// Test stub for `server-only`. The real package throws when imported outside
// a React Server Component; this empty module lets vitest load server-only
// modules (e.g. lib/admin/authGuard.ts) without error.
export {};
