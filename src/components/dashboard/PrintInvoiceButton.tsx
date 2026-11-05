"use client";

import { Printer } from "lucide-react";

export default function PrintInvoiceButton() {
  return (
    <button type="button" onClick={() => window.print()} className="print-button">
      <Printer size={17} /> طباعة / حفظ PDF
    </button>
  );
}
