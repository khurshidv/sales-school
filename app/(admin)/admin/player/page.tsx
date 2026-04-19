import { redirect } from 'next/navigation';

// Player Journey requires a specific player ID.
// The sidebar link /admin/player redirects to Participants where players can be searched and selected.
export default function PlayerIndexPage() {
  redirect('/admin/participants');
}
