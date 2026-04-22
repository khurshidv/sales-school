import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

export type ParticipantStatus = 'new' | 'in_progress' | 'done' | 'hire' | 'skip';

export async function updateParticipantStatus(
  playerId: string,
  status: ParticipantStatus,
  assignedTo: string | null,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from('player_admin_states')
    .upsert(
      { player_id: playerId, status, assigned_to: assignedTo },
      { onConflict: 'player_id' },
    );
  if (error) throw error;
}

export async function bulkUpdateParticipants(
  ids: string[],
  patch: { status?: ParticipantStatus; assigned_to?: string | null },
): Promise<number> {
  if (ids.length === 0) return 0;
  if (patch.status === undefined && patch.assigned_to === undefined) return 0;

  const admin = createAdminClient();

  const payload = ids.map(pid => {
    const row: { player_id: string; status?: ParticipantStatus; assigned_to?: string | null } = {
      player_id: pid,
    };
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.assigned_to !== undefined) row.assigned_to = patch.assigned_to;
    return row;
  });

  const { data, error } = await admin
    .from('player_admin_states')
    .upsert(payload, { onConflict: 'player_id' })
    .select('player_id');
  if (error) throw error;
  return (data ?? []).length;
}
