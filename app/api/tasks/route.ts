// Lokasi: app/api/tasks/route.ts

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Database } from "@/lib/database.types";
import { z } from "zod";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Skema Zod untuk validasi data tugas baru
const TaskSchema = z.object({
  title: z.string().min(3, "Judul tidak boleh kosong"),
  description: z.string().optional(),
  due_date: z.string().datetime(),
  priority: z.enum(["rendah", "sedang", "tinggi"]),
  type: z.enum(["pribadi", "kelas"]),
  subject_id: z.string().uuid().optional().nullable(),
  assigned_by: z.string().uuid(),
  // assigned_to sekarang bisa null untuk tugas kelas
  assigned_to: z.string().uuid().nullable(),
});

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- FUNGSI UNTUK MEMBUAT TUGAS BARU (LOGIKA DIUBAH TOTAL) ---
export async function POST(request: Request) {
  try {
    // 1. Parse dan validasi input
    const body = await request.json();
    const validation = TaskSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Data tidak valid",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { type, ...taskData } = validation.data;

    // 2. Validasi khusus berdasarkan type
    if (type === "pribadi") {
      // Untuk tugas pribadi - wajib ada assigned_to
      if (!taskData.assigned_to) {
        return NextResponse.json(
          {
            error: "assigned_to wajib diisi untuk tugas pribadi",
          },
          { status: 400 }
        );
      }

      // Cek apakah user yang ditugaskan ada
      const { data: assignedUser, error: userCheckError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("id", taskData.assigned_to)
        .single();

      if (userCheckError || !assignedUser) {
        return NextResponse.json(
          {
            error: "User yang ditugaskan tidak ditemukan",
          },
          { status: 400 }
        );
      }
    } else if (type === "kelas") {
      // Untuk tugas kelas - assigned_to harus null
      taskData.assigned_to = null;
    }

    // 3. Buat master task
    const { data: newTask, error: taskError } = await supabaseAdmin
      .from("tasks")
      .insert({
        type,
        ...taskData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (taskError) {
      console.error("Error creating task:", taskError);
      return NextResponse.json(
        {
          error: "Gagal membuat tugas",
        },
        { status: 500 }
      );
    }

    // 4. Buat submissions berdasarkan type
    if (type === "kelas") {
      // Untuk tugas kelas - assign ke SEMUA user
      const { data: allUsers, error: userError } = await supabaseAdmin
        .from("profiles")
        .select("id");

      if (userError) {
        console.error("Error fetching all users:", userError);
        await supabaseAdmin.from("tasks").delete().eq("id", newTask.id);
        return NextResponse.json(
          {
            error: "Gagal mengambil data user",
          },
          { status: 500 }
        );
      }

      if (!allUsers || allUsers.length === 0) {
        await supabaseAdmin.from("tasks").delete().eq("id", newTask.id);
        return NextResponse.json(
          {
            error: "Tidak ada user di database",
          },
          { status: 400 }
        );
      }

      // =================================================================
      // === AWAL DARI LOGIKA BARU: MEMBUAT NOTIFIKASI UNTUK TUGAS KELAS ===
      // =================================================================
      const notificationsToInsert = allUsers
        .filter((user) => user.id !== taskData.assigned_by) // Jangan kirim notif ke pembuat tugas
        .map((user) => ({
          user_id: user.id, // Penerima notifikasi
          actor_id: taskData.assigned_by, // Pelaku (yang membuat tugas)
          event_type: "new_task",
          title: `Tugas Kelas Baru: ${taskData.title}`,
          message: `Sebuah tugas baru telah ditambahkan. Segera periksa daftar tugas Anda.`,
          link_to: `/dashboard/tasks`, // Nanti bisa diubah ke link detail tugas, misal: `/dashboard/tasks/${newTask.id}`
          entity_id: newTask.id, // ID dari tugas yang baru dibuat
        }));

      if (notificationsToInsert.length > 0) {
        const { error: notificationError } = await supabaseAdmin
          .from("notifications")
          .insert(notificationsToInsert);

        if (notificationError) {
          // Jika gagal membuat notifikasi, kita hanya akan mencatat errornya
          // dan tidak menggagalkan seluruh proses pembuatan tugas.
          console.error(
            "Peringatan: Gagal membuat notifikasi untuk tugas kelas:",
            notificationError
          );
        }
      }
      // ===============================================================
      // === AKHIR DARI LOGIKA BARU: MEMBUAT NOTIFIKASI                ===
      // ===============================================================
      // ===================================================================
      // === AWAL DARI LOGIKA BARU: MEMBUAT PENGUMUMAN PUBLIK OTOMATIS ===
      // ===================================================================
      // Kita buat juga pengumuman publik agar muncul di halaman login
      try {
        await supabaseAdmin.from("announcements").insert({
          title: `Tugas Kelas Baru: ${taskData.title}`,
          message:
            "Sebuah tugas baru telah ditambahkan untuk seluruh kelas. Segera periksa daftar tugas Anda setelah login.",
          type: "assignment", // Tipe ini sesuai dengan yang ada di UI login
          // Jadikan 'urgent' jika prioritas tugasnya tinggi
          urgent: taskData.priority === "tinggi",
        });
      } catch (announcementError) {
        // Jika gagal membuat pengumuman, proses utama tidak boleh gagal.
        // Cukup catat errornya di server.
        console.error(
          "Peringatan: Gagal membuat pengumuman publik untuk tugas kelas:",
          announcementError
        );
      }
      // =================================================================
      // === AKHIR DARI LOGIKA BARU                                    ===
      // =================================================================

      // Bulk insert submissions untuk semua user
      const submissionsToInsert = allUsers.map((user) => ({
        task_id: newTask.id,
        user_id: user.id,
        status: "pending" as const,
      }));

      const { error: submissionError } = await supabaseAdmin
        .from("task_submissions")
        .insert(submissionsToInsert);

      if (submissionError) {
        console.error("Error creating class submissions:", submissionError);
        await supabaseAdmin.from("tasks").delete().eq("id", newTask.id);
        return NextResponse.json(
          {
            error: "Gagal membuat submissions untuk tugas kelas",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          message: "Tugas kelas berhasil ditambahkan",
          task_id: newTask.id,
          type: "kelas",
          assigned_users: allUsers.length,
          assigned_to: null,
        },
        { status: 201 }
      );
    } else if (type === "pribadi") {
      // Untuk tugas pribadi - assign ke user tertentu
      const { error: submissionError } = await supabaseAdmin
        .from("task_submissions")
        .insert({
          task_id: newTask.id,
          user_id: taskData.assigned_to!,
          status: "pending",
        });

      if (submissionError) {
        console.error("Error creating personal submission:", submissionError);
        await supabaseAdmin.from("tasks").delete().eq("id", newTask.id);
        return NextResponse.json(
          {
            error: "Gagal membuat submission untuk tugas pribadi",
          },
          { status: 500 }
        );
      }

      // ===================================================================
      // === AWAL DARI LOGIKA BARU: MEMBUAT NOTIFIKASI UNTUK TUGAS PRIBADI ===
      // ===================================================================
      // Hanya kirim notifikasi jika tugas diberikan oleh orang lain
      if (taskData.assigned_by !== taskData.assigned_to) {
        await supabaseAdmin.from("notifications").insert({
          user_id: taskData.assigned_to!, // Penerima notifikasi
          actor_id: taskData.assigned_by, // Pelaku (yang memberi tugas)
          event_type: "new_personal_task",
          title: `Tugas Pribadi Baru: ${taskData.title}`,
          message: `Anda diberi tugas pribadi baru.`,
          link_to: `/dashboard/tasks`,
          entity_id: newTask.id,
        });
      }
      // =================================================================
      // === AKHIR DARI LOGIKA BARU                                    ===
      // =================================================================

      return NextResponse.json(
        {
          message: "Tugas pribadi berhasil ditambahkan",
          task_id: newTask.id,
          type: "pribadi",
          assigned_to: taskData.assigned_to,
        },
        { status: 201 }
      );
    }
      return NextResponse.json(
    { error: "Tipe tugas tidak valid setelah divalidasi." },
    { status: 400 }
  );
  } catch (error: any) {
    console.error("Unexpected error in POST task:", error);
    return NextResponse.json(
      {
        error: "Terjadi kesalahan pada server",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// --- FUNGSI UNTUK MENGAMBIL SEMUA TUGAS (GET) ---
// Fungsi GET tidak perlu diubah
export async function GET() {
  try {
    const cookieStore = cookies();
    let userId = cookieStore.get("user_id")?.value;

    if (!userId) {
      const sessionCookie = cookieStore.get("supabase-session")?.value;
      if (sessionCookie) {
        try {
          const sessionData = JSON.parse(sessionCookie);
          userId = sessionData.user?.id;
        } catch {}
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from("tasks")
      .select(
        `
        *,
        subjects ( id, name, lecturer ),
        assigner:profiles!tasks_assigned_by_fkey ( id, name, role ),
        editor:profiles!tasks_last_edited_by_id_fkey ( id, name, role ),
        task_submissions (
          id,
          status,
          user_id
        )
      `
      )
      .or(`type.eq.kelas,assigned_to.eq.${userId}`)
      .eq("task_submissions.user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Gagal mengambil data tugas:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data tugas" },
      { status: 500 }
    );
  }
}
