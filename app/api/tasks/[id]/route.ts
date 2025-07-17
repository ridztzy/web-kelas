// Lokasi: app/api/tasks/[id]/route.ts

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Database } from "@/lib/database.types";
import { z } from "zod";
import { cookies } from "next/headers";

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Skema untuk update, semua opsional
const TaskUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  due_date: z.string().datetime().optional(),
  priority: z.enum(["rendah", "sedang", "tinggi"]).optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
  subject_id: z.string().uuid().optional().nullable(),
});

// --- FUNGSI UNTUK UPDATE DATA (PUT/PATCH) ---
// --- GANTI SELURUH FUNGSI PUT DENGAN INI ---
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("supabase-session")?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized: No session" },
        { status: 401 }
      );
    }
    const sessionData = JSON.parse(sessionCookie);
    const userId = sessionData.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: User not found in session" },
        { status: 401 }
      );
    }

    // 1. AMBIL ROLE PENGGUNA DARI DATABASE
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: "User profile not found or error fetching it." },
        { status: 404 }
      );
    }
    const userRole = userProfile.role;

    const { id } = params;
    const body = await request.json();

    const validation = TaskUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Data tidak valid",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { data: task, error: fetchError } = await supabaseAdmin
      .from("tasks")
      .select("id, title, type, assigned_by, assigned_to") // <-- Ambil data ini juga
      .eq("id", id)
      .single();

    if (fetchError || !task) {
      return NextResponse.json(
        { error: "Tugas tidak ditemukan" },
        { status: 404 }
      );
    }

    // 2. LOGIKA OTORISASI BARU
    const allowedRoles = ["admin", "ketua_kelas", "sekretaris"];
    const isOwner = task.assigned_by === userId;
    const hasPermission = allowedRoles.includes(userRole);

    if (!isOwner && !hasPermission) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to edit this task." },
        { status: 403 }
      );
    }

    // 3. TAMBAHKAN DATA PENGEDIT
    const updateData = {
      ...validation.data,
      updated_at: new Date().toISOString(),
      last_edited_by_id: userId, // Simpan ID pengguna yang mengedit
    };

    const { data, error } = await supabaseAdmin
      .from("tasks")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // ===================================================================
    // === AWAL: LOGIKA NOTIFIKASI UNTUK UPDATE TUGAS ===
    // ===================================================================
    if (data) {
      // 'data' adalah hasil dari update yang berhasil
      const actorId = userId; // Pengguna yang melakukan update
      const eventTitle = `Tugas Diperbarui: ${data.title}`;
      const eventMessage = `Tugas "${data.title}" telah diperbarui. Periksa perubahannya.`;
      const linkTo = `/dashboard/tasks`; // Link umum

      if (data.type === "kelas") {
        // Kirim notifikasi ke semua pengguna kecuali si pengedit
        const { data: allUsers } = await supabaseAdmin
          .from("profiles")
          .select("id");
        if (allUsers) {
          const notifications = allUsers
            .filter((user) => user.id !== actorId) // Jangan kirim ke diri sendiri
            .map((user) => ({
              user_id: user.id,
              actor_id: actorId,
              event_type: "task_updated",
              title: eventTitle,
              message: eventMessage,
              link_to: linkTo,
              entity_id: data.id,
            }));

          if (notifications.length > 0) {
            await supabaseAdmin.from("notifications").insert(notifications);
          }
        }
      } else if (data.type === "pribadi" && data.assigned_to) {
        // Kirim notifikasi hanya jika yang mengedit bukan yang ditugaskan
        if (actorId !== data.assigned_to) {
          await supabaseAdmin.from("notifications").insert({
            user_id: data.assigned_to,
            actor_id: actorId,
            event_type: "task_updated",
            title: eventTitle,
            message: eventMessage,
            link_to: linkTo,
            entity_id: data.id,
          });
        }
      }
    }
    // ===================================================================
    // === AKHIR: LOGIKA NOTIFIKASI UNTUK UPDATE TUGAS ===
    // ===================================================================

    return NextResponse.json({ message: "Tugas berhasil diperbarui", data });
  } catch (error: any) {
    console.error("Gagal memperbarui tugas:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
// --- FUNGSI UNTUK MENGHAPUS DATA (DELETE) ---
// --- GANTI SELURUH FUNGSI DELETE DENGAN INI ---
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("supabase-session")?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized: No session" },
        { status: 401 }
      );
    }
    const sessionData = JSON.parse(sessionCookie);
    const userId = sessionData.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: User not found in session" },
        { status: 401 }
      );
    }

    // 1. AMBIL ROLE PENGGUNA DARI DATABASE
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: "User profile not found or error fetching it." },
        { status: 404 }
      );
    }
    const userRole = userProfile.role;

    const { id } = params;

    const { data: task, error: fetchError } = await supabaseAdmin
      .from("tasks")
      .select("id, title, type, assigned_by, assigned_to")
      .eq("id", id)
      .single();

    if (fetchError || !task) {
      return NextResponse.json(
        { error: "Tugas tidak ditemukan" },
        { status: 404 }
      );
    }

    // 2. LOGIKA OTORISASI BARU
    const allowedRoles = ["admin", "ketua_kelas", "sekretaris"];
    const isOwner = task.assigned_by === userId;
    const hasPermission = allowedRoles.includes(userRole);

    if (!isOwner && !hasPermission) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to delete this task." },
        { status: 403 }
      );
    }

    // ===================================================================
    // === AWAL: LOGIKA NOTIFIKASI SEBELUM MENGHAPUS TUGAS ===
    // ===================================================================
    const actorId = userId; // Pengguna yang melakukan delete
    const eventTitle = `Tugas Dihapus: ${task.title}`;
    const eventMessage = `Tugas "${task.title}" telah dihapus dari daftar.`;
    const linkTo = "/dashboard/tasks";

    if (task.type === "kelas") {
      const { data: allUsers } = await supabaseAdmin
        .from("profiles")
        .select("id");
      if (allUsers) {
        const notifications = allUsers
          .filter((user) => user.id !== actorId)
          .map((user) => ({
            user_id: user.id,
            actor_id: actorId,
            event_type: "task_deleted",
            title: eventTitle,
            message: eventMessage,
            link_to: linkTo,
            entity_id: task.id,
          }));

        if (notifications.length > 0) {
          await supabaseAdmin.from("notifications").insert(notifications);
        }
      }
    } else if (task.type === "pribadi" && task.assigned_to) {
      if (actorId !== task.assigned_to) {
        await supabaseAdmin.from("notifications").insert({
          user_id: task.assigned_to,
          actor_id: actorId,
          event_type: "task_deleted",
          title: eventTitle,
          message: eventMessage,
          link_to: linkTo,
          entity_id: task.id,
        });
      }
    }
    // ===================================================================
    // === AKHIR: LOGIKA NOTIFIKASI SEBELUM MENGHAPUS TUGAS ===
    // ===================================================================

    const { error } = await supabaseAdmin.from("tasks").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json(
      { message: "Tugas berhasil dihapus" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Gagal menghapus tugas:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
