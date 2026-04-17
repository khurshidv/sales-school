import { redirect } from 'next/navigation';

export default function AdminIndex() {
  // TODO Phase 2: switch to /admin/realtime once the page exists.
  redirect('/admin/overview');
}
