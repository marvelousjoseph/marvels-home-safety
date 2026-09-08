import { createClient } from "npm:@supabase/supabase-js@2";

const BUCKET_NAME = "security-recordings";
const RETENTION_DAYS = 30;

type Recording = {
  id: string;
  storage_path: string | null;
  created_at: string;
};

function getSupabaseAdmin() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");

  const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");
  const legacyServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL is not configured.");
  }

  let secretKey = legacyServiceRoleKey;

  if (secretKeysRaw) {
    try {
      const secretKeys = JSON.parse(secretKeysRaw);
      secretKey = secretKeys?.default ?? secretKey;
    } catch {
      throw new Error("SUPABASE_SECRET_KEYS is not valid JSON.");
    }
  }

  if (!secretKey) {
    throw new Error("No Supabase secret key is configured.");
  }

  return createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

Deno.serve(async (_req) => {
  try {
    const supabase = getSupabaseAdmin();

    const cutoff = new Date(
      Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data: recordings, error: recordingsError } = await supabase
      .from("security_event_recordings")
      .select("id, storage_path, created_at")
      .lt("created_at", cutoff)
      .order("created_at", { ascending: true })
      .limit(100);

    if (recordingsError) {
      throw new Error(
        `Failed to find old recordings: ${recordingsError.message}`,
      );
    }

    const rows = (recordings ?? []) as Recording[];

    let deletedFiles = 0;
    let deletedRows = 0;
    let skippedRows = 0;
    let failedRows = 0;

    const failures: Array<{
      id: string;
      error: string;
    }> = [];

    for (const recording of rows) {
      try {
        /*
         * If the database row has no Storage object,
         * there is nothing to remove from Storage.
         */
        if (!recording.storage_path) {
          const { error: deleteRowError } = await supabase
            .from("security_event_recordings")
            .delete()
            .eq("id", recording.id);

          if (deleteRowError) {
            throw new Error(
              `Failed to delete metadata row: ${deleteRowError.message}`,
            );
          }

          deletedRows++;
          skippedRows++;
          continue;
        }

        /*
         * Delete the actual object from Supabase Storage first.
         */
        const { error: storageError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([recording.storage_path]);

        if (storageError) {
          throw new Error(
            `Failed to delete Storage object: ${storageError.message}`,
          );
        }

        deletedFiles++;

        /*
         * Only remove the database metadata after the Storage
         * deletion has succeeded.
         */
        const { error: deleteRowError } = await supabase
          .from("security_event_recordings")
          .delete()
          .eq("id", recording.id);

        if (deleteRowError) {
          throw new Error(
            `Storage deleted but metadata deletion failed: ${deleteRowError.message}`,
          );
        }

        deletedRows++;
      } catch (error) {
        failedRows++;

        failures.push({
          id: recording.id,
          error: error instanceof Error
            ? error.message
            : "Unknown cleanup error",
        });
      }
    }

    return Response.json({
      ok: true,
      retention_days: RETENTION_DAYS,
      cutoff,
      found: rows.length,
      deleted_files: deletedFiles,
      deleted_rows: deletedRows,
      rows_without_storage: skippedRows,
      failed: failedRows,
      failures,
    });
  } catch (error) {
    console.error("Recording cleanup failed:", error);

    return Response.json(
      {
        ok: false,
        error: error instanceof Error
          ? error.message
          : "Unknown cleanup error",
      },
      { status: 500 },
    );
  }
});