import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function GET() {
  return NextResponse.json({
    app: "freshpac-b2b-platform",
    status: "ok",
    supabaseConfigured: isSupabaseConfigured,
    timestamp: new Date().toISOString()
  });
}
