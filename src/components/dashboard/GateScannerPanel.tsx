"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import jsQR from "jsqr";
import {
  AlertTriangle,
  Camera,
  CameraOff,
  CheckCircle2,
  ImageUp,
  Minus,
  Plus,
  QrCode,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  SwitchCamera,
  Ticket,
  UsersRound,
} from "lucide-react";
import {
  BOOKING_STATUS_LABELS,
  isBookingQrActive,
  type BookingRecord,
} from "@/lib/bookings-types";
import { matchesNormalizedQuery } from "@/lib/search-normalize";
import { parseTicketBookingId, qrBlockReasonAr } from "@/lib/ticket-qr";
import { formatCreated, formatWhen, StatusBadge } from "./booking-shared";
import TicketPassModal from "./TicketPassModal";

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
};

export default function GateScannerPanel() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [manualInput, setManualInput] = useState("");
  const [guestSearch, setGuestSearch] = useState("");
  const [scannedBooking, setScannedBooking] = useState<BookingRecord | null>(null);
  const [scanError, setScanError] = useState("");
  const [scanNotice, setScanNotice] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [customCount, setCustomCount] = useState(1);
  const [ticketModalBooking, setTicketModalBooking] = useState<BookingRecord | null>(null);

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lastScanRef = useRef<{ code: string; at: number }>({ code: "", at: 0 });

  const playTone = useCallback((kind: "ok" | "warn") => {
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = kind === "ok" ? "sine" : "sawtooth";
      osc.frequency.value = kind === "ok" ? 1046 : 240;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (kind === "ok" ? 0.22 : 0.4));
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (kind === "ok" ? 0.25 : 0.45));
      setTimeout(() => void ctx.close().catch(() => {}), 600);
    } catch {}
  }, []);

  const refreshBookings = useCallback(async () => {
    try {
      const res = await fetch("/api/bookings", { credentials: "include", cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { bookings?: BookingRecord[] };
      if (Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      }
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void refreshBookings();
  }, [refreshBookings]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  const verifyCode = useCallback(
    async (rawCode: string) => {
      const parsedId = parseTicketBookingId(rawCode);
      if (!parsedId) {
        setScanError("رمز QR أو رقم التذكرة غير مفهوم.");
        setScanNotice("");
        playTone("warn");
        return;
      }

      setVerifying(true);
      setScanError("");
      setScanNotice("");
      try {
        const res = await fetch(
          `/api/scanner/checkin?code=${encodeURIComponent(rawCode.trim())}`,
          { credentials: "include", cache: "no-store" }
        );
        const data = (await res.json().catch(() => ({}))) as {
          booking?: BookingRecord;
          qrActive?: boolean;
          remaining?: number;
          error?: string;
        };
        if (!res.ok || !data.booking) {
          setScannedBooking(null);
          setScanError(data.error || "لم يتم العثور على التذكرة.");
          playTone("warn");
          return;
        }
        setScannedBooking(data.booking);
        setBookings((prev) =>
          prev.map((row) => (row.id === data.booking!.id ? data.booking! : row))
        );
        const remaining = Math.max(0, data.booking.groupSize - data.booking.checkedInCount);
        setCustomCount(remaining > 0 ? 1 : 0);
        playTone(data.qrActive && remaining > 0 ? "ok" : "warn");
      } catch {
        setScanError("انقطع الاتصال بالخادم أثناء التحقق من التذكرة.");
        playTone("warn");
      } finally {
        setVerifying(false);
      }
    },
    [playTone]
  );

  // Camera scanning loop using BarcodeDetector + jsQR fallback
  useEffect(() => {
    if (!cameraActive) return;

    let cancelled = false;
    let rafId = 0;
    let lastFrameAt = 0;

    const DetectorCtor = (
      window as unknown as {
        BarcodeDetector?: new (opts: { formats: string[] }) => BarcodeDetectorLike;
      }
    ).BarcodeDetector;
    const detector = DetectorCtor ? new DetectorCtor({ formats: ["qr_code"] }) : null;

    async function start() {
      setCameraError("");
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("المتصفح لا يدعم تشغيل الكاميرا مباشرة. استخدم البحث اليدوي أو رفع صورة QR.");
        setCameraActive(false);
        return;
      }

      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false,
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        rafId = requestAnimationFrame(scanLoop);
      } catch (err) {
        if (!cancelled) {
          const name = err instanceof DOMException ? err.name : "";
          let message =
            "تعذر الوصول إلى الكاميرا — تأكد من منح إذن الكاميرا أو استخدم مسح صورة / إدخال الكود.";
          if (name === "NotFoundError" || name === "DevicesNotFoundError") {
            message = "لا توجد كاميرا متصلة بهذا الجهاز — استخدم جهاز مسح USB أو رفع صورة QR أو الإدخال اليدوي.";
          } else if (name === "NotReadableError" || name === "TrackStartError") {
            message = "الكاميرا مستخدمة حاليًا في برنامج أو تبويب آخر — أغلقه ثم أعد المحاولة.";
          } else if (name === "NotAllowedError" || name === "PermissionDeniedError") {
            message = "تم حظر إذن الكاميرا من المتصفح أو سياسة الأمان — اسمح للكاميرا من إعدادات الموقع وأعد المحاولة.";
          }
          setCameraError(message);
          setCameraActive(false);
        }
      }
    }

    async function handleDetected(rawValue: string) {
      const now = Date.now();
      if (lastScanRef.current.code === rawValue && now - lastScanRef.current.at < 2200) {
        return;
      }
      lastScanRef.current = { code: rawValue, at: now };
      setManualInput(rawValue);
      await verifyCode(rawValue);
    }

    async function scanLoop(ts: number) {
      if (cancelled) return;
      if (ts - lastFrameAt >= 150) {
        lastFrameAt = ts;
        const video = videoRef.current;
        if (video && video.readyState >= 2 && video.videoWidth > 0) {
          try {
            if (detector) {
              const found = await detector.detect(video);
              const val = found[0]?.rawValue?.trim();
              if (val) await handleDetected(val);
            } else {
              const canvas = canvasRef.current || document.createElement("canvas");
              canvasRef.current = canvas;
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              const ctx = canvas.getContext("2d", { willReadFrequently: true });
              if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(img.data, img.width, img.height, {
                  inversionAttempts: "dontInvert",
                });
                if (code?.data?.trim()) {
                  await handleDetected(code.data.trim());
                }
              }
            }
          } catch {}
        }
      }
      if (!cancelled) {
        rafId = requestAnimationFrame(scanLoop);
      }
    }

    void start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [cameraActive, facingMode, verifyCode]);

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setScanError("");
    setScanNotice("");
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Invalid image"));
        img.src = objectUrl;
      });
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Canvas unavailable");
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const decoded = jsQR(imageData.data, imageData.width, imageData.height);
      if (!decoded?.data?.trim()) {
        setScanError("لم يتم العثور على رمز QR واضح داخل الصورة المرفوعة.");
        playTone("warn");
        return;
      }
      setManualInput(decoded.data.trim());
      await verifyCode(decoded.data.trim());
    } catch {
      setScanError("تعذر قراءة الصورة المرفوعة.");
      playTone("warn");
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function applyWristbands(delta: number) {
    if (!scannedBooking || checkingIn) return;
    setCheckingIn(true);
    setScanError("");
    setScanNotice("");
    try {
      const res = await fetch("/api/scanner/checkin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: scannedBooking.id, delta }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        booking?: BookingRecord;
        remaining?: number;
        error?: string;
      };
      if (!res.ok || !data.booking) {
        if (data.booking) {
          setScannedBooking(data.booking);
          setBookings((prev) =>
            prev.map((row) => (row.id === data.booking!.id ? data.booking! : row))
          );
        }
        setScanError(data.error || "تعذر تسجيل الدخول والأساور.");
        playTone("warn");
        return;
      }

      setScannedBooking(data.booking);
      setBookings((prev) =>
        prev.map((row) => (row.id === data.booking!.id ? data.booking! : row))
      );
      const remaining = Math.max(0, data.booking.groupSize - data.booking.checkedInCount);
      setCustomCount(remaining > 0 ? 1 : 0);
      setScanNotice(
        delta > 0
          ? `تم تسليم ${delta} ${delta === 1 ? "إسورة" : "أساور"} بنجاح — المتبقي: ${remaining}`
          : `تم التراجع عن ${Math.abs(delta)} إسورة — المتبقي: ${remaining}`
      );
      playTone("ok");
    } catch {
      setScanError("انقطع الاتصال أثناء تسجيل الأساور.");
      playTone("warn");
    } finally {
      setCheckingIn(false);
    }
  }

  async function handleConfirmOrderAtGate() {
    if (!scannedBooking) return;
    setCheckingIn(true);
    setScanError("");
    setScanNotice("");
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(scannedBooking.id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "confirmed" }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        booking?: BookingRecord;
        error?: string;
      };
      if (!res.ok || !data.booking) {
        throw new Error(data.error || "تعذر تأكيد الحجز.");
      }
      setScannedBooking(data.booking);
      setBookings((prev) =>
        prev.map((row) => (row.id === data.booking!.id ? data.booking! : row))
      );
      setScanNotice("تم تأكيد الحجز وتفعيل رمز QR للدخول الآن.");
      playTone("ok");
    } catch (err) {
      setScanError(err instanceof Error ? err.message : "تعذر تأكيد الحجز.");
      playTone("warn");
    } finally {
      setCheckingIn(false);
    }
  }

  const filteredQuickBookings = useMemo(() => {
    const q = guestSearch.trim();
    const list = q
      ? bookings.filter((b) =>
          matchesNormalizedQuery(q, [b.id, b.name, b.phone, b.company], [b.phone])
        )
      : bookings.filter((b) => b.status !== "cancelled");
    return list.slice(0, 12);
  }, [bookings, guestSearch]);

  const qrActive = scannedBooking ? isBookingQrActive(scannedBooking.status) : false;
  const remaining = scannedBooking
    ? Math.max(0, scannedBooking.groupSize - scannedBooking.checkedInCount)
    : 0;
  const blockReason = scannedBooking ? qrBlockReasonAr(scannedBooking.status) : null;
  const progressPct =
    scannedBooking && scannedBooking.groupSize > 0
      ? Math.min(100, Math.round((scannedBooking.checkedInCount / scannedBooking.groupSize) * 100))
      : 0;

  return (
    <div className="mx-auto max-w-[1500px] pb-24 md:pb-8" dir="rtl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[#d4b458]">
            <QrCode size={18} />
            <span className="text-xs font-bold">بوابة الدخول والأساور</span>
          </div>
          <h1 className="text-2xl font-black text-white md:text-3xl">
            اسكانر تذاكر QR وضبط أعداد الضيوف
          </h1>
          <p className="mt-2 text-xs text-white/45">
            لا يقبل دخول غير الحجوزات المؤكدة فقط، ويمنع تجاوز عدد الأشخاص المسجل على التذكرة لتسليم الأساور بدقة.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refreshBookings()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white/75 hover:bg-white/10"
        >
          <RefreshCw size={15} className={loadingList ? "animate-spin" : ""} /> تحديث القائمة
        </button>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[420px_minmax(0,1fr)]">
        {/* Left column: Camera + Manual Scanner + Quick Search */}
        <div className="space-y-5">
          {/* Camera & USB/Manual Box */}
          <section className="rounded-2xl border border-[#cba135]/25 bg-white/[0.025] p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Camera size={16} className="text-[#d4b458]" />
                مسح QR بالكاميرا أو الاسكانر
              </h2>
              <div className="flex items-center gap-2">
                {cameraActive ? (
                  <button
                    type="button"
                    onClick={() =>
                      setFacingMode((m) => (m === "environment" ? "user" : "environment"))
                    }
                    title="تبديل الكاميرا"
                    className="rounded-lg border border-white/15 bg-white/5 p-2 text-white/75 hover:bg-white/10"
                  >
                    <SwitchCamera size={15} />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => (cameraActive ? stopCamera() : setCameraActive(true))}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black transition-colors ${
                    cameraActive
                      ? "bg-red-500/20 border border-red-400/35 text-red-200 hover:bg-red-500/30"
                      : "bg-[#cba135] text-black hover:bg-[#d4b458]"
                  }`}
                >
                  {cameraActive ? <CameraOff size={15} /> : <Camera size={15} />}
                  {cameraActive ? "إيقاف الكاميرا" : "تشغيل الكاميرا"}
                </button>
              </div>
            </div>

            {cameraActive ? (
              <div className="relative overflow-hidden rounded-2xl border border-[#cba135]/40 bg-black aspect-[4/3]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="h-48 w-48 border-2 border-[#e5c979]/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
                </div>
                <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-[10px] font-bold text-[#e5c979]">
                  وجّه الكاميرا نحو رمز QR التذكرة
                </span>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/15 bg-black/25 p-5 text-center">
                <QrCode size={32} className="mx-auto mb-2 text-[#cba135]/60" />
                <p className="text-xs text-white/55">
                  اضغط «تشغيل الكاميرا» لمسح باركود التذكرة أو استخدم قارئ الباركود/الصورة بالأسفل
                </p>
              </div>
            )}

            {cameraError ? (
              <p className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-xs text-amber-200">
                {cameraError}
              </p>
            ) : null}

            {/* Manual / USB Scanner Input */}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void verifyCode(manualInput);
              }}
              className="space-y-2"
            >
              <label className="block text-[11px] font-bold text-white/55">
                جهاز المسح (USB Scanner) أو إدخال رقم التذكرة يدويًا
              </label>
              <div className="flex gap-2">
                <input
                  value={manualInput}
                  onChange={(event) => setManualInput(event.target.value)}
                  placeholder="ALG-XXXX أو الصق نص QR هنا…"
                  dir="ltr"
                  className="w-full rounded-xl border border-white/15 bg-black/35 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#cba135]/60"
                />
                <button
                  type="submit"
                  disabled={verifying || !manualInput.trim()}
                  className="shrink-0 rounded-xl bg-[#cba135] px-4 py-2.5 text-xs font-black text-black hover:bg-[#d4b458] disabled:opacity-40"
                >
                  {verifying ? <RefreshCw size={15} className="animate-spin" /> : "فحص"}
                </button>
              </div>
            </form>

            {/* Upload Screenshot QR */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => void handleImageUpload(e)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-bold text-white/80 hover:bg-white/10"
              >
                <ImageUp size={15} className="text-[#d4b458]" />
                مسح QR من صورة أو لقطة شاشة (واتساب)
              </button>
            </div>
          </section>

          {/* Quick Lookup if customer forgot ticket */}
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <UsersRound size={16} className="text-[#d4b458]" />
                بحث سريع (لو لم يحفظ العميل التذكرة)
              </h2>
            </div>
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35"
              />
              <input
                value={guestSearch}
                onChange={(event) => setGuestSearch(event.target.value)}
                placeholder="ابحث بالاسم أو الجوال أو رقم التذكرة…"
                className="w-full rounded-xl border border-white/10 bg-black/30 pr-10 pl-3 py-2.5 text-xs text-white outline-none placeholder:text-white/30 focus:border-[#cba135]/60"
              />
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto pl-1">
              {filteredQuickBookings.map((row) => {
                const active = isBookingQrActive(row.status);
                const rem = Math.max(0, row.groupSize - row.checkedInCount);
                return (
                  <div
                    key={row.id}
                    className={`rounded-xl border p-3 transition-colors ${
                      scannedBooking?.id === row.id
                        ? "border-[#cba135]/50 bg-[#cba135]/10"
                        : "border-white/[0.07] bg-black/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => void verifyCode(row.id)}
                        className="min-w-0 flex-1 text-right"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-[#e5c979]" dir="ltr">
                            {row.id}
                          </span>
                          <StatusBadge status={row.status} />
                        </div>
                        <p className="mt-1 truncate text-xs font-bold text-white">{row.name}</p>
                        <p className="mt-0.5 text-[10px] text-white/50">
                          <span dir="ltr" className="font-mono">
                            {row.phone}
                          </span>{" "}
                          • الأساور: {row.checkedInCount}/{row.groupSize} (متبقي {rem})
                        </p>
                      </button>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => void verifyCode(row.id)}
                          className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold ${
                            active
                              ? "bg-[#cba135]/15 text-[#e5c979] hover:bg-[#cba135]/25"
                              : "bg-white/5 text-white/60 hover:bg-white/10"
                          }`}
                        >
                          فحص
                        </button>
                        <button
                          type="button"
                          onClick={() => setTicketModalBooking(row)}
                          title="إصدار / عرض التذكرة"
                          className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/75 hover:bg-white/10"
                        >
                          التذكرة
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right column: Gate Decision & Wristband Control */}
        <div className="space-y-5">
          {scanError ? (
            <div className="flex items-start gap-3 rounded-2xl border border-red-400/35 bg-red-500/15 p-4 text-sm font-bold text-red-200">
              <ShieldAlert size={20} className="mt-0.5 shrink-0 text-red-400" />
              <span>{scanError}</span>
            </div>
          ) : null}

          {scanNotice ? (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/35 bg-emerald-500/15 p-4 text-sm font-bold text-emerald-200">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-400" />
              <span>{scanNotice}</span>
            </div>
          ) : null}

          {!scannedBooking ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-20 text-center">
              <QrCode size={48} className="mx-auto mb-4 text-white/15" />
              <h3 className="text-lg font-black text-white/80">جاهز لمسح تذاكر الضيوف</h3>
              <p className="mt-2 text-xs text-white/45 max-w-md mx-auto leading-6">
                امسح رمز QR من الكاميرا أو قارئ الباركود، أو اختر ضيفًا من القائمة الجانبية لعرض حالة التأكيد وعدد الأساور المتبقية المسموح بدخولها.
              </p>
            </div>
          ) : (
            <section className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              {/* Gate Status Verdict */}
              {!qrActive ? (
                <div className="rounded-2xl border-2 border-red-500/50 bg-red-500/15 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <ShieldAlert size={28} className="shrink-0 text-red-400 mt-0.5" />
                      <div>
                        <h2 className="text-lg font-black text-red-200">
                          ⛔ غير مسموح بالدخول — رمز QR غير مفعل
                        </h2>
                        <p className="mt-1 text-sm text-red-100/85">{blockReason}</p>
                      </div>
                    </div>
                    {scannedBooking.status === "pending" ? (
                      <button
                        type="button"
                        disabled={checkingIn}
                        onClick={() => void handleConfirmOrderAtGate()}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#cba135] px-4 py-2.5 text-xs font-black text-black hover:bg-[#d4b458] disabled:opacity-50"
                      >
                        <ShieldCheck size={16} />
                        تأكيد الحجز وتفعيل التذكرة الآن
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : remaining === 0 ? (
                <div className="rounded-2xl border-2 border-amber-500/50 bg-amber-500/15 p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={28} className="shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <h2 className="text-lg font-black text-amber-200">
                        🚫 اكتمل العدد بالكامل — لا توجد أساور متبقية
                      </h2>
                      <p className="mt-1 text-sm text-amber-100/85">
                        تم تسليم جميع الأساور المسموحة على هذه التذكرة ({scannedBooking.checkedInCount} من{" "}
                        {scannedBooking.groupSize})، ولا يمكن إدخال أشخاص إضافيين.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-emerald-500/45 bg-emerald-500/10 p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={28} className="shrink-0 text-emerald-400 mt-0.5" />
                    <div>
                      <h2 className="text-lg font-black text-emerald-200">
                        ✅ تذكرة مؤكدة ومفعلة — مسموح بالدخول
                      </h2>
                      <p className="mt-1 text-sm text-emerald-100/85">
                        يمكنك تسليم ما يصل إلى{" "}
                        <strong className="text-white underline">
                          {remaining} {remaining === 1 ? "إسورة" : "أساور"}
                        </strong>{" "}
                        فقط كحد أقصى لهذا الحجز.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Guest Info & Issue Ticket Button */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-xl font-black text-white">{scannedBooking.name}</h3>
                    <span className="font-mono text-xs font-bold text-[#e5c979]" dir="ltr">
                      {scannedBooking.id}
                    </span>
                    <StatusBadge status={scannedBooking.status} />
                  </div>
                  <p className="mt-1.5 text-xs text-white/60">
                    الجوال:{" "}
                    <span className="font-mono text-white/85" dir="ltr">
                      {scannedBooking.phone}
                    </span>
                    {" • "}
                    الموعد: <span className="text-white/85">{formatWhen(scannedBooking.preferredAt)}</span>
                    {scannedBooking.company && scannedBooking.company !== "—"
                      ? ` • ${scannedBooking.company}`
                      : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTicketModalBooking(scannedBooking)}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#cba135]/40 bg-[#cba135]/10 px-4 py-2.5 text-xs font-bold text-[#e5c979] hover:bg-[#cba135]/20"
                >
                  <Ticket size={15} />
                  عرض / إصدار التذكرة
                </button>
              </div>

              {/* Wristband Capacity Meter */}
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-white/10 bg-black/30 p-3.5 text-center">
                    <p className="text-[11px] text-white/50">العدد بالتذكرة</p>
                    <p className="mt-1 text-2xl font-black text-white">
                      {scannedBooking.groupSize}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/30 p-3.5 text-center">
                    <p className="text-[11px] text-white/50">استلموا الأساور</p>
                    <p className="mt-1 text-2xl font-black text-[#e5c979]">
                      {scannedBooking.checkedInCount}
                    </p>
                  </div>
                  <div
                    className={`rounded-xl border p-3.5 text-center ${
                      remaining > 0
                        ? "border-emerald-400/30 bg-emerald-500/10"
                        : "border-red-400/30 bg-red-500/10"
                    }`}
                  >
                    <p className="text-[11px] text-white/70">المتبقي المسموح به</p>
                    <p
                      className={`mt-1 text-2xl font-black ${
                        remaining > 0 ? "text-emerald-300" : "text-red-300"
                      }`}
                    >
                      {remaining}
                    </p>
                  </div>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full transition-all duration-300 ${
                      remaining === 0 ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Wristband Issue Controls */}
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white/80">
                    تسجيل دخول وتسليم أساور الضيوف
                  </span>
                  {scannedBooking.checkedInCount > 0 ? (
                    <button
                      type="button"
                      disabled={checkingIn}
                      onClick={() => void applyWristbands(-1)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 text-[11px] font-bold text-white/70 hover:bg-white/10 disabled:opacity-40"
                    >
                      <RotateCcw size={12} /> تراجع (-1 إسورة)
                    </button>
                  ) : null}
                </div>

                {qrActive && remaining > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          disabled={checkingIn || n > remaining}
                          onClick={() => void applyWristbands(n)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#cba135]/40 bg-[#cba135]/10 px-4 py-3 text-xs font-black text-[#e5c979] hover:bg-[#cba135]/20 disabled:opacity-30"
                        >
                          <Plus size={14} />
                          {n === 1 ? "تسليم إسورة (1)" : `تسليم ${n} أساور`}
                        </button>
                      ))}
                      <button
                        type="button"
                        disabled={checkingIn}
                        onClick={() => void applyWristbands(remaining)}
                        className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs font-black text-black hover:bg-emerald-400 disabled:opacity-40"
                      >
                        <CheckCircle2 size={16} />
                        دخول كل المتبقي ({remaining} {remaining === 1 ? "إسورة" : "أساور"})
                      </button>
                    </div>

                    {remaining > 1 ? (
                      <div className="flex flex-wrap items-center gap-3 border-t border-white/[0.08] pt-3">
                        <span className="text-xs text-white/60">أو حدد عدد مخصص (بحد أقصى {remaining}):</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setCustomCount((c) => Math.max(1, c - 1))}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white hover:bg-white/10"
                          >
                            <Minus size={14} />
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={remaining}
                            value={customCount}
                            onChange={(event) => {
                              const val = Math.floor(Number(event.target.value) || 1);
                              setCustomCount(Math.max(1, Math.min(remaining, val)));
                            }}
                            className="w-20 rounded-lg border border-white/15 bg-black/40 py-2 text-center text-sm font-black text-white outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setCustomCount((c) => Math.min(remaining, c + 1))}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white hover:bg-white/10"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          type="button"
                          disabled={checkingIn || customCount < 1 || customCount > remaining}
                          onClick={() => void applyWristbands(customCount)}
                          className="rounded-xl bg-[#cba135] px-4 py-2.5 text-xs font-black text-black hover:bg-[#d4b458] disabled:opacity-40"
                        >
                          تأكيد تسليم {customCount}
                        </button>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p className="text-xs text-white/45">
                    {!qrActive
                      ? `أزرار الدخول معطلة لأن حالة الطلب حالياً «${BOOKING_STATUS_LABELS[scannedBooking.status]}» وليس مؤكداً.`
                      : "تم تسليم كافة الأساور المسموحة لهذه التذكرة."}
                  </p>
                )}
              </div>

              {/* Check-in History Log */}
              <div>
                <h4 className="mb-2.5 text-xs font-bold text-white/60">سجل تسليم الأساور على البوابة</h4>
                {scannedBooking.checkIns.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-white/35">
                    لم يدخل أي ضيوف من هذه التذكرة بعد.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {[...scannedBooking.checkIns].reverse().map((entry, idx) => (
                      <div
                        key={`${entry.at}-${idx}`}
                        className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/20 px-3.5 py-2 text-xs"
                      >
                        <span
                          className={`font-bold ${
                            entry.delta > 0 ? "text-emerald-300" : "text-amber-300"
                          }`}
                        >
                          {entry.delta > 0
                            ? `+${entry.delta} ${entry.delta === 1 ? "إسورة" : "أساور"} (دخول)`
                            : `${entry.delta} تراجع`}
                        </span>
                        <span className="text-white/50">
                          الإجمالي بعد الحركة: <strong className="text-white">{entry.countAfter}</strong> /{" "}
                          {scannedBooking.groupSize}
                        </span>
                        <span className="text-[11px] text-white/40">
                          {formatCreated(entry.at)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>

      <TicketPassModal
        booking={ticketModalBooking}
        onClose={() => setTicketModalBooking(null)}
        onBookingUpdated={(updated) => {
          setBookings((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
          if (scannedBooking?.id === updated.id) {
            setScannedBooking(updated);
          }
          setTicketModalBooking(updated);
        }}
      />
    </div>
  );
}
