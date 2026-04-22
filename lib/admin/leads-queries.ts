// lib/admin/leads-queries.ts
import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

export type LeadStatus = 'new' | 'in_progress' | 'done' | 'invalid';

export async function getLeadDedupCounts(phones: string[]): Promise<Record<string, number>> {
  if (phones.length === 0) return {};
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('leads')
    .select('phone')
    .in('phone', phones);
  if (error) {
    console.warn('[leads-queries] getLeadDedupCounts', error.message);
    return {};
  }
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.phone] = (counts[row.phone] ?? 0) + 1;
  }
  return counts;
}

export interface LinkedPlayer {
  id: string;
  display_name: string | null;
}

export async function getLinkedPlayerByPhone(phones: string[]): Promise<Record<string, LinkedPlayer>> {
  if (phones.length === 0) return {};
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('players')
    .select('id, phone, display_name')
    .in('phone', phones);
  if (error) {
    console.warn('[leads-queries] getLinkedPlayerByPhone', error.message);
    return {};
  }
  const map: Record<string, LinkedPlayer> = {};
  for (const row of data ?? []) {
    map[row.phone] = { id: row.id, display_name: row.display_name };
  }
  return map;
}

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus,
  assignedTo: string | null,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from('leads')
    .update({ status, assigned_to: assignedTo })
    .eq('id', leadId);
  if (error) throw error;
}

export async function bulkUpdateLeads(
  ids: string[],
  patch: { status?: LeadStatus; assigned_to?: string | null },
): Promise<number> {
  if (ids.length === 0) return 0;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('leads')
    .update(patch)
    .in('id', ids)
    .select('id');
  if (error) throw error;
  return (data ?? []).length;
}
