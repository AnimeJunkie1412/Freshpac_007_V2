# Desktop app placeholder

The supplied plan points to a desktop-first operations app with offline-safe mode.

This starter framework keeps the main Next.js app at the repository root so Vercel setup stays simple. The desktop app should be added after the web foundation is stable.

Recommended path:

1. Build and validate the shared data model in Prisma/Supabase.
2. Build the web Sales Portal and Engineers Portal screens.
3. Choose Tauri or Electron.
4. Create a desktop shell that reuses the same UI patterns.
5. Add local SQLite storage.
6. Add approved-device checks.
7. Add offline action queue.
8. Add sync conflict review.

Do not let the desktop app create official order references while offline. Use temporary references such as `OFFLINE-2026-0001` until the cloud confirms sync.
