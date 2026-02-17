"use client";
import { supabase } from "@/libs/supabase";

export default function LoginPage() {
    const loginWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: "http://localhost:3000/auth/callback",
            },
        });
    };

    return (
        <div className="h-screen flex items-center justify-center">
            <button
                onClick={loginWithGoogle}
                className="bg-black text-white px-6 py-3 rounded-lg"
            >
                Login with Google
            </button>
        </div>
    );
}
