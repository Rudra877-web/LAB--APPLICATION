import React from "react";
import { AlertTriangle } from "lucide-react";
import { isSupabaseConfigured, configProblem } from "../supabaseClient.js";

// Shows a clear, actionable banner instead of a silently broken page
// when Supabase isn't connected yet, or a table-related query failed.
export default function SetupBanner({ errorMessage }) {
  if (isSupabaseConfigured && !errorMessage) return null;

  return (
    <div className="setup-banner">
      <AlertTriangle size={18} strokeWidth={2.2} />
      <div>
        {!isSupabaseConfigured ? (
          <>
            <strong>Database connect nahi hai.</strong> {configProblem}
            {" "}Steps README.md mein hain (.env file banao, phir dev server
            restart karo). Agar keys sahi hain toh Supabase SQL Editor mein{" "}
            <code>sql/schema.sql</code> bhi run karna zaroori hai.
          </>
        ) : (
          <>{errorMessage}</>
        )}
      </div>
    </div>
  );
}
