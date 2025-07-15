// Lokasi: app/api/tasks/submissions/[id]/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Database } from '@/lib/database.types';
import { z } from 'zod';
import { cookies } from 'next/headers';

// Skema untuk validasi update status
const StatusUpdateSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed']),
});

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- FUNGSI UNTUK UPDATE STATUS SUBMISSION ---
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Ambil userId dari cookie manual
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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const submissionId = params.id;
  if (!submissionId) {
    return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = StatusUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const { status } = validation.data;

    // Pastikan submission ini milik user yang login
    const { data: submission, error: fetchError } = await supabaseAdmin
      .from('task_submissions')
      .select('id, user_id')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (submission.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update status di tabel task_submissions
    const { data, error } = await supabaseAdmin
      .from('task_submissions')
      .update({ 
        status: status,
        updated_at: new Date().toISOString() 
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Status updated successfully', data });

  } catch (error: any) {
    console.error('Failed to update submission status:', error);
    return NextResponse.json({ error: 'Server error while updating status' }, { status: 500 });
  }
}
