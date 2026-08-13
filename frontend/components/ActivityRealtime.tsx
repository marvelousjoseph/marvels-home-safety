"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ActivityRealtime() {
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel("activity-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "device_events",
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
