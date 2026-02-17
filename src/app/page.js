"use client";

import { useEffect } from "react";
import { supabase } from "@/libs/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="h-screen flex items-center justify-center">
      <p>Loading...</p>
    </div>
  );
}
