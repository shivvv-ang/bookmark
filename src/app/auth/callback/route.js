import { supabase } from "@/libs/supabase";
import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (code) {

        await supabase.auth.exchangeCodeForSession(code);
    }

    return NextResponse.redirect("http://localhost:3000/dashboard");
}
