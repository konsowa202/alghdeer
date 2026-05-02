"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function StaffLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError(
          res.status === 401
            ? "بيانات الدخول غير صحيحة."
            : "تعذر تسجيل الدخول. حاول مرة أخرى."
        );
        return;
      }
      window.location.href = "/dashboard";
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-[#0b0c10] flex flex-col items-center justify-center px-4"
      dir="rtl"
    >
      <Link
        href="/"
        className="absolute top-6 right-6 text-white/40 hover:text-white text-sm tracking-wide"
      >
        ← العودة للموقع
      </Link>
      <div className="w-full max-w-md bg-black/80 border border-white/10 rounded-2xl p-8 shadow-xl">
        <h1 className="text-xl font-bold text-white text-center mb-1">
          دخول الموظفين
        </h1>
        <p className="text-white/50 text-sm text-center mb-8">
          لوحة تسجيل الحجوزات والاستفسارات فقط للفريق الداخلي
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-white/50 text-xs tracking-wider mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#cba135]"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="block text-white/50 text-xs tracking-wider mb-2">
              كلمة المرور
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#cba135]"
            />
          </div>
          {error ? (
            <p className="text-red-400 text-sm text-center">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#cba135] text-black font-bold rounded-lg hover:bg-[#d4b458] disabled:opacity-50 transition-colors"
          >
            {loading ? "جاري الدخول…" : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
