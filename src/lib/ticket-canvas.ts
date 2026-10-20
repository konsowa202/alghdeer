/**
 * Ticket Image Generator
 * Generates an ultra-crisp, high-resolution PNG image of the authentic Alghdeer
 * beige-and-red vintage VIP ticket with real guest details, barcode, and QR code,
 * ready to save directly to the user's phone gallery / downloads.
 */

import type { TicketDetails } from "./calendar-wallet";

export async function generateTicketCanvas(ticket: TicketDetails): Promise<HTMLCanvasElement> {
  const width = 1200;
  const height = 580;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  // 1. Base Colors
  const beige = "#f4ead2";
  const dark = "#0B0C10";
  const red = "#b5382a";
  const ink = "#1a1610";
  const gold = "#cba135";

  // Perforation split at x = 820
  const splitX = 820;

  // 2. Draw Left Body (Beige)
  ctx.fillStyle = beige;
  ctx.fillRect(0, 0, splitX, height);

  // 3. Draw Right Stub (Red)
  ctx.fillStyle = red;
  ctx.fillRect(splitX, 0, width - splitX, height);

  // 4. Subtle Texture / Vignette
  ctx.fillStyle = "rgba(0, 0, 0, 0.03)";
  for (let i = 0; i < width; i += 8) {
    ctx.fillRect(i, 0, 2, height);
  }

  // 5. Perforation Line (Dashed)
  ctx.strokeStyle = "rgba(11, 12, 16, 0.4)";
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(splitX, 0);
  ctx.lineTo(splitX, height);
  ctx.stroke();
  ctx.setLineDash([]); // reset

  // 6. Cutout Notches (Dark Circles)
  const notchRadius = 24;
  ctx.fillStyle = dark;

  // 4 Outer Corners
  ctx.beginPath();
  ctx.arc(0, 0, notchRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(width, 0, notchRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, height, notchRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(width, height, notchRadius, 0, Math.PI * 2);
  ctx.fill();

  // Perforation Notches (Top & Bottom of split)
  ctx.beginPath();
  ctx.arc(splitX, 0, notchRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(splitX, height, notchRadius, 0, Math.PI * 2);
  ctx.fill();

  // ============================================================
  // LEFT BODY: TICKET CONTENT
  // ============================================================

  // Inner Border Box
  ctx.strokeStyle = "rgba(26, 22, 16, 0.25)";
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, splitX - 72, height - 72);

  // Thin outer accent line
  ctx.strokeStyle = "rgba(26, 22, 16, 0.12)";
  ctx.lineWidth = 1;
  ctx.strokeRect(42, 42, splitX - 84, height - 84);

  // Header Stars & Title
  ctx.fillStyle = red;
  ctx.font = "bold 18px 'Segoe UI', Tahoma, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("★  ★  ★", splitX / 2, 78);

  ctx.fillStyle = "rgba(26, 22, 16, 0.7)";
  ctx.font = "bold 13px 'Segoe UI', Tahoma, sans-serif";
  ctx.fillText("ADMIT VIP PASS • تذكرة حجز رسمية معتمدة", splitX / 2, 104);

  ctx.fillStyle = ink;
  ctx.font = "900 32px 'Segoe UI', Tahoma, sans-serif";
  ctx.fillText("مخيمات الغدير الشتوية", splitX / 2, 144);

  ctx.fillStyle = red;
  ctx.font = "bold 16px 'Courier New', monospace";
  ctx.fillText(`№ ${ticket.id}`, splitX / 2, 172);

  // Horizontal Divider Line
  ctx.strokeStyle = "rgba(26, 22, 16, 0.2)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(60, 190);
  ctx.lineTo(splitX - 60, 190);
  ctx.stroke();

  // Booking Details Table
  ctx.textAlign = "right";
  const startY = 230;
  const lineSpacing = 42;

  const rows = [
    { label: "اسم الضيف:", val: ticket.name },
    { label: "المناسبة / الجهة:", val: ticket.company && ticket.company !== "—" ? ticket.company : "حجز مناسبة خاصة" },
    { label: "عدد الضيوف:", val: `${ticket.groupSize} أشخاص` },
    { label: "موعد الفعالية:", val: ticket.preferredAt },
    { label: "الموقع:", val: "مخيمات الغدير، بريمان، جدة" },
  ];

  rows.forEach((r, idx) => {
    const y = startY + idx * lineSpacing;

    // Label
    ctx.fillStyle = "rgba(26, 22, 16, 0.65)";
    ctx.font = "bold 14px 'Segoe UI', Tahoma, sans-serif";
    ctx.fillText(r.label, splitX - 70, y);

    // Value
    ctx.fillStyle = ink;
    ctx.font = "bold 16px 'Segoe UI', Tahoma, sans-serif";
    ctx.fillText(r.val, splitX - 220, y);

    // Dotted bottom line
    ctx.strokeStyle = "rgba(26, 22, 16, 0.1)";
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(60, y + 10);
    ctx.lineTo(splitX - 60, y + 10);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Stamp Seal in bottom-left
  ctx.save();
  ctx.translate(140, 470);
  ctx.rotate(-0.1);
  ctx.strokeStyle = red;
  ctx.lineWidth = 3;
  ctx.strokeRect(-80, -26, 160, 52);
  ctx.fillStyle = red;
  ctx.font = "900 13px 'Segoe UI', Tahoma, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("VERIFIED • معتمد", 0, -4);
  ctx.font = "bold 10px monospace";
  ctx.fillText("ALGHDEER OFFICIAL", 0, 14);
  ctx.restore();

  // ============================================================
  // RIGHT STUB: BARCODE & VIP BADGE
  // ============================================================
  const stubCenterX = splitX + (width - splitX) / 2;

  // Stub Inner Border
  ctx.strokeStyle = "rgba(244, 234, 210, 0.35)";
  ctx.lineWidth = 2;
  ctx.strokeRect(splitX + 24, 36, width - splitX - 48, height - 72);

  // Admit VIP
  ctx.fillStyle = beige;
  ctx.textAlign = "center";
  ctx.font = "bold 13px 'Segoe UI', Tahoma, sans-serif";
  ctx.fillText("ADMIT VIP", stubCenterX, 78);

  ctx.font = "900 24px 'Segoe UI', Tahoma, sans-serif";
  ctx.fillText("ALGHDEER", stubCenterX, 112);

  ctx.fillStyle = "rgba(244, 234, 210, 0.75)";
  ctx.font = "bold 12px 'Segoe UI', Tahoma, sans-serif";
  ctx.fillText("CAMP & RESORT", stubCenterX, 134);

  // Guest Summary in stub
  ctx.fillStyle = beige;
  ctx.font = "bold 15px 'Segoe UI', Tahoma, sans-serif";
  ctx.fillText(ticket.name, stubCenterX, 185);

  ctx.fillStyle = "rgba(244, 234, 210, 0.85)";
  ctx.font = "13px 'Segoe UI', Tahoma, sans-serif";
  ctx.fillText(`${ticket.groupSize} ضيوف`, stubCenterX, 210);

  ctx.fillStyle = "#fae5a5";
  ctx.font = "bold 14px 'Courier New', monospace";
  ctx.fillText(`№ ${ticket.id}`, stubCenterX, 238);

  // Barcode Graphic
  const barcodeY = 280;
  const barcodeHeight = 75;
  const barcodeWidth = width - splitX - 80;
  const barcodeStartX = splitX + 40;

  ctx.fillStyle = beige;
  const barPattern = [
    3, 2, 4, 1, 5, 2, 3, 4, 1, 6, 2, 3, 5, 1, 2, 4, 3, 1, 5, 2, 4, 1, 3, 5, 2,
    4, 1, 6, 3, 2, 4, 1, 5, 3, 2, 4, 1, 5, 2, 3, 4, 1, 6, 2, 3, 5, 1,
  ];

  let currentBarX = barcodeStartX;
  for (let i = 0; i < barPattern.length && currentBarX < barcodeStartX + barcodeWidth; i++) {
    const barW = barPattern[i] % 4 === 0 ? 3 : barPattern[i] % 3 === 0 ? 2 : 1.5;
    ctx.fillRect(currentBarX, barcodeY, barW, barcodeHeight);
    currentBarX += barW + (barPattern[i] % 3 + 2);
  }

  // Serial under Barcode
  ctx.fillStyle = "rgba(244, 234, 210, 0.7)";
  ctx.font = "bold 11px monospace";
  ctx.fillText(`* ${ticket.id} *`, stubCenterX, barcodeY + barcodeHeight + 20);

  // Gate & Season Notice
  ctx.fillStyle = "rgba(244, 234, 210, 0.85)";
  ctx.font = "bold 11px 'Segoe UI', Tahoma, sans-serif";
  ctx.fillText("بوابة كبار الشخصيات VIP", stubCenterX, 440);
  ctx.font = "10px monospace";
  ctx.fillText("SEASON WINTER 2026", stubCenterX, 460);

  // Optional: Try to load QR Code into left box if available
  try {
    const qrData = `https://alghdeer.vercel.app/ticket/${ticket.id}?guest=${encodeURIComponent(
      ticket.name
    )}&date=${encodeURIComponent(ticket.preferredAt)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
      qrData
    )}&color=1a1610&bgcolor=f4ead2`;

    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve) => {
      img.onload = () => {
        ctx.drawImage(img, 70, 310, 95, 95);
        ctx.fillStyle = "rgba(26, 22, 16, 0.6)";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText("SCAN AT GATE", 117, 420);
        resolve();
      };
      img.onerror = () => resolve(); // silent fallback
      img.src = qrUrl;
    });
  } catch {
    // Graceful fallback if network is offline
  }

  return canvas;
}

/**
 * Downloads the high-resolution PNG pass directly to the device
 */
export async function downloadTicketImage(ticket: TicketDetails): Promise<void> {
  if (typeof window === "undefined") return;
  const canvas = await generateTicketCanvas(ticket);
  const dataUrl = canvas.toDataURL("image/png");

  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `alghdeer-vip-pass-${ticket.id}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
