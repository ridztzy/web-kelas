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
      // Untuk tugas kelas - assign ke SEMUA user (termasuk admin & inactive)
      const { data: allUsers, error: userError } = await supabaseAdmin
        .from("profiles")
        .select("id");

      if (userError) {
        console.error("Error fetching all users:", userError);
        // Rollback task jika perlu
        await supabaseAdmin.from("tasks").delete().eq("id", newTask.id);
        return NextResponse.json(
          {
            error: "Gagal mengambil data user",
          },
          { status: 500 }
        );
      }

      // Validasi apakah ada user di database
      if (!allUsers || allUsers.length === 0) {
        // Rollback task
        await supabaseAdmin.from("tasks").delete().eq("id", newTask.id);
        return NextResponse.json(
          {
            error: "Tidak ada user di database",
          },
          { status: 400 }
        );
      }

      // Bulk insert submissions untuk semua user
      const submissionsToInsert = allUsers.map((user) => ({
        task_id: newTask.id,
        user_id: user.id,
        status: "pending", // atau bisa dihilangkan, akan default 'pending'
      }));

      const { error: submissionError } = await supabaseAdmin
        .from("task_submissions")
        .insert(submissionsToInsert);

      if (submissionError) {
        console.error("Error creating class submissions:", submissionError);
        // Rollback task
        await supabaseAdmin.from("tasks").delete().eq("id", newTask.id);
        return NextResponse.json(
          {
            error: "Gagal membuat submissions untuk tugas kelas",
          },
          { status: 500 }
        );
      }

      // Return success dengan info berapa user yang ditugaskan
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
  .from('task_submissions')
  .insert({
    task_id: newTask.id,
    user_id: taskData.assigned_to,
    status: 'pending', // atau bisa dihilangkan
  });

      if (submissionError) {
        console.error("Error creating personal submission:", submissionError);
        // Rollback task
        await supabaseAdmin.from("tasks").delete().eq("id", newTask.id);
        return NextResponse.json(
          {
            error: "Gagal membuat submission untuk tugas pribadi",
          },
          { status: 500 }
        );
      }

      // Return success dengan info user yang ditugaskan
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

// --- FUNGSI UNTUK MENGAMBIL SEMUA TUGAS (LOGIKA DIUBAH TOTAL) ---
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

    // Ambil semua tugas kelas dan tugas pribadi untuk user ini,
    // dan hanya ambil submission milik user ini
    const { data, error } = await supabaseAdmin
      .from("tasks")
      .select(
        `
        *,
        subjects ( id, name ),
        assigner:profiles!tasks_assigned_by_fkey ( id, name ),
        task_submissions (
          id,
          status,
          user_id
        )
      `
      )
      .or(`type.eq.kelas,assigned_to.eq.${userId}`)
      .eq('task_submissions.user_id', userId); // <--- filter submission milik user ini saja

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
