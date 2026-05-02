"use client";

import React, { useState } from "react";
import { LogOut } from "lucide-react";

export default function StaffLogoutButton() {
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/dashboard/login";
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={logout}
      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
    >
      <LogOut size={20} />
      تسجيل الخروج
    </button>
  );
}
