import Image from "next/image";
import { notFound } from "next/navigation";
import PrintInvoiceButton from "@/components/dashboard/PrintInvoiceButton";
import { getStaffContext } from "@/lib/staff-session";
import { getInvoice } from "@/lib/invoices-store";
import { formatSar } from "@/lib/invoice-pricing";

const money = (value: number) => `${formatSar(value)} SAR`;

export default async function InvoicePrintPage({ params }: { params: { id: string } }) {
  const staff = await getStaffContext();
  if (!staff) notFound();
  const invoice = await getInvoice(params.id, staff.accessToken);
  if (!invoice) notFound();
  const isIssued = invoice.status === "issued";
  const eventDate = invoice.eventAt
    ? new Intl.DateTimeFormat("ar-SA", { dateStyle: "long", timeZone: "Asia/Riyadh" }).format(new Date(invoice.eventAt))
    : "—";
  const issueDate = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Asia/Riyadh" }).format(new Date(invoice.updatedAt));

  return (
    <div className="invoice-page" dir="rtl">
      <style>{`
        .invoice-page{--ink:#161b26;--muted:#687080;--gold:#a98125;--line:#e4e5e9;max-width:1050px;margin:0 auto;background:#fff;color:var(--ink);font-family:Tahoma,Arial,sans-serif;min-height:100vh;padding:28px;direction:rtl}
        .invoice-toolbar{display:flex;justify-content:flex-end;margin-bottom:18px}.print-button{display:inline-flex;align-items:center;gap:8px;border:0;border-radius:10px;background:#cba135;color:#111;padding:12px 20px;font-weight:700;cursor:pointer}
        .invoice-sheet{border:1px solid var(--line);border-radius:18px;overflow:hidden;background:#fff}.invoice-hero{display:flex;align-items:center;justify-content:space-between;gap:24px;background:#111319;padding:26px 32px;color:#fff}.invoice-brand{width:190px;height:auto}.invoice-title{text-align:left}.invoice-title h1{font-size:25px;margin:0 0 7px;color:#f1d17c}.invoice-title p{margin:0;color:#b5b7bf;font:12px Arial;letter-spacing:1px}.invoice-number{font:600 14px monospace;color:#fff;margin-top:10px;direction:ltr}
        .invoice-meta{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid var(--line)}.invoice-meta>div{padding:18px 22px;border-left:1px solid var(--line)}.invoice-meta>div:last-child{border-left:0}.invoice-label{display:block;color:var(--muted);font-size:11px;margin-bottom:7px}.invoice-value{display:block;font-size:14px;font-weight:700;word-break:break-word}.invoice-ltr{direction:ltr;text-align:right;unicode-bidi:embed}
        .invoice-customer{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:24px 28px}.customer-box{border:1px solid var(--line);border-radius:12px;padding:18px}.customer-box h2{font-size:13px;margin:0 0 13px;color:var(--gold)}.customer-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.customer-grid p{margin:0;font-size:12px;line-height:1.8}.customer-grid small{display:block;color:var(--muted);font-size:10px}
        .invoice-table-wrap{padding:0 28px}.invoice-table{width:100%;border-collapse:collapse;table-layout:fixed}.invoice-table th{background:#f5f2e9;color:#69541f;padding:13px 10px;font-size:11px;text-align:right;border-bottom:1px solid #ded4b8}.invoice-table td{padding:16px 10px;border-bottom:1px solid var(--line);font-size:12px;vertical-align:top}.invoice-table .num{text-align:center;width:60px}.invoice-table .price{text-align:left;width:130px;direction:ltr}.item-ar{font-weight:700;font-size:13px}.item-en{display:block;color:var(--muted);font:11px Arial;margin-top:6px;direction:ltr;text-align:right}.item-unit{color:var(--muted);font-size:10px;margin-top:4px}
        .invoice-bottom{display:grid;grid-template-columns:1fr 340px;gap:30px;padding:26px 28px}.invoice-notes{font-size:11px;line-height:2;color:var(--muted);white-space:pre-wrap}.invoice-notes h3{color:var(--ink);font-size:12px;margin:0 0 8px}.invoice-totals{font-size:12px}.total-row{display:flex;justify-content:space-between;gap:20px;padding:9px 0;color:var(--muted)}.total-row strong{color:var(--ink);direction:ltr}.grand-total{display:flex;justify-content:space-between;align-items:center;gap:15px;border-top:2px solid var(--gold);margin-top:8px;padding-top:17px;font-size:15px;font-weight:800}.grand-total strong{color:var(--gold);font-size:21px;direction:ltr}.invoice-footer{display:flex;justify-content:space-between;gap:20px;border-top:1px solid var(--line);padding:20px 28px;color:var(--muted);font-size:10px;line-height:1.8}.invoice-status{display:inline-block;border:1px solid #d9c486;color:#80631a;border-radius:20px;padding:4px 12px;font-size:10px;font-weight:700}
        @page{size:A4;margin:10mm}@media print{body{background:#fff!important}.invoice-page{padding:0;max-width:none}.invoice-toolbar{display:none!important}aside,header,nav{display:none!important}main{padding:0!important;background:#fff!important}.invoice-sheet{border:0;border-radius:0}.invoice-hero{-webkit-print-color-adjust:exact;print-color-adjust:exact}.invoice-table th{-webkit-print-color-adjust:exact;print-color-adjust:exact}.invoice-customer,.invoice-bottom,.invoice-table tr{break-inside:avoid}.invoice-table-wrap{padding:0 18px}.invoice-customer,.invoice-bottom{padding-left:18px;padding-right:18px}}
        @media(max-width:700px){.invoice-page{padding:10px}.invoice-hero{padding:20px;flex-direction:column;align-items:flex-start}.invoice-title{text-align:right}.invoice-meta{grid-template-columns:1fr 1fr}.invoice-meta>div:nth-child(2){border-left:0}.invoice-customer,.invoice-bottom{grid-template-columns:1fr;padding:18px}.invoice-table-wrap{padding:0 10px;overflow-x:auto}.invoice-table{min-width:700px}.invoice-footer{padding:16px;flex-direction:column}.invoice-brand{width:160px}}
      `}</style>
      <div className="invoice-toolbar"><PrintInvoiceButton /></div>
      <article className="invoice-sheet">
        <div className="invoice-hero">
          <Image src="/logo-dark-bg.png" alt="ALGHDEER camp" width={1205} height={190} className="invoice-brand" priority />
          <div className="invoice-title">
            <h1>{isIssued ? "فاتورة" : "عرض سعر"}</h1>
            <p>{isIssued ? "INVOICE" : "QUOTATION"}</p>
            <div className="invoice-number">{invoice.invoiceNumber}</div>
          </div>
        </div>
        <div className="invoice-meta">
          <div><span className="invoice-label">التاريخ / Date</span><span className="invoice-value invoice-ltr">{issueDate}</span></div>
          <div><span className="invoice-label">الحالة / Status</span><span className="invoice-status">{isIssued ? "صادرة / Issued" : invoice.status === "approved" ? "معتمد / Approved" : "مسودة / Draft"}</span></div>
          <div><span className="invoice-label">تاريخ المناسبة / Event</span><span className="invoice-value">{eventDate}</span></div>
          <div><span className="invoice-label">عدد الضيوف / Guests</span><span className="invoice-value">{invoice.guestCount}</span></div>
        </div>
        <section className="invoice-customer">
          <div className="customer-box">
            <h2>بيانات العميل / CLIENT DETAILS</h2>
            <div className="customer-grid">
              <p><small>الاسم / Name</small>{invoice.customerName}</p>
              <p><small>الجوال / Phone</small><span className="invoice-ltr">{invoice.customerPhone || "—"}</span></p>
              <p><small>الجهة / Company</small>{invoice.company || "—"}</p>
              <p><small>البريد / Email</small><span className="invoice-ltr">{invoice.customerEmail || "—"}</span></p>
            </div>
          </div>
          <div className="customer-box">
            <h2>الجهة المصدرة / ISSUED BY</h2>
            <div className="customer-grid">
              <p><small>المنشأة / Business</small>مخيمات الغدير<br />ALGHDEER camp</p>
              <p><small>الموقع / Location</small>جدة — طريق بريمان<br />Jeddah — Briman Road</p>
              {invoice.bookingId ? <p><small>رقم الحجز / Booking</small><span className="invoice-ltr">{invoice.bookingId}</span></p> : null}
              <p><small>العملة / Currency</small>الريال السعودي / SAR</p>
            </div>
          </div>
        </section>
        <div className="invoice-table-wrap">
          <table className="invoice-table">
            <thead><tr><th className="num">#</th><th>وصف الخدمة / DESCRIPTION</th><th className="num">العدد<br />QTY</th><th className="price">سعر الوحدة<br />UNIT PRICE</th><th className="price">الإجمالي<br />AMOUNT</th></tr></thead>
            <tbody>{invoice.items.map((item, index) => (
              <tr key={item.id}>
                <td className="num">{index + 1}</td>
                <td><div className="item-ar">{item.descriptionAr || item.descriptionEn}</div>{item.descriptionEn && item.descriptionAr ? <span className="item-en">{item.descriptionEn}</span> : null}<div className="item-unit">{item.unitAr} / {item.unitEn}</div></td>
                <td className="num">{item.quantity}</td>
                <td className="price">{money(item.unitPrice)}</td>
                <td className="price">{money(item.quantity * item.unitPrice)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div className="invoice-bottom">
          <div className="invoice-notes"><h3>ملاحظات وشروط / NOTES & TERMS</h3>{invoice.notes || "يعتمد الحجز النهائي بعد تأكيد الموعد والدفع وفق الاتفاق مع إدارة المخيم.\nFinal booking is subject to date confirmation and payment as agreed with camp management."}</div>
          <div className="invoice-totals">
            <div className="total-row"><span>الإجمالي الفرعي / Subtotal</span><strong>{money(invoice.subtotal)}</strong></div>
            <div className="total-row"><span>الخصم / Discount</span><strong>- {money(invoice.discount)}</strong></div>
            {invoice.showCommission && invoice.commissionAmount > 0 ? <div className="total-row"><span>عمولة المنصة / Service commission {invoice.commissionType === "percent" ? `(${invoice.commissionValue}%)` : ""}</span><strong>{money(invoice.commissionAmount)}</strong></div> : null}
            <div className="total-row"><span>الضريبة / VAT ({invoice.taxRate}%)</span><strong>{money(invoice.taxAmount)}</strong></div>
            <div className="grand-total"><span>الإجمالي / TOTAL</span><strong>{money(invoice.total)}</strong></div>
          </div>
        </div>
        <footer className="invoice-footer"><span>شكرًا لاختياركم مخيمات الغدير<br />Thank you for choosing ALGHDEER camp</span><span>www.alghder.com<br />@alghdeer_sa</span></footer>
      </article>
    </div>
  );
}
