import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFPage,
  type PDFFont,
  type RGB,
} from 'pdf-lib';

import type {
  CorteCajaDTO,
  CorteCajaReciboDTO,
} from '@/modulos/corte-caja/types/corte-caja.types';

/* =========================
   Formatting & safety
========================= */

function money(n: number, currency = 'MXN'): string {
  try {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(n) ? n : 0);
  } catch {
    return `$${Number.isFinite(n) ? n.toFixed(2) : '0.00'} ${currency}`;
  }
}

function safeText(v: unknown, fallback = '—'): string {
  const s = typeof v === 'string' ? v.trim() : String(v ?? '').trim();
  return s ? s : fallback;
}

/**
 * StandardFonts = WinAnsi. Evita caracteres que truena (→ • · — etc).
 */
function toWinAnsi(text: string): string {
  return text
    .replaceAll('→', '->')
    .replaceAll('•', '-')
    .replaceAll('·', '-')
    .replaceAll('—', '-')
    .replaceAll('–', '-')
    .replaceAll('“', '"')
    .replaceAll('”', '"')
    .replaceAll('’', "'");
}

function fitText(font: PDFFont, text: string, size: number, maxWidth: number): string {
  const t = toWinAnsi(safeText(text, ''));
  if (!t) return '—';
  if (font.widthOfTextAtSize(t, size) <= maxWidth) return t;

  const ell = '...';
  const ellW = font.widthOfTextAtSize(ell, size);
  const target = Math.max(0, maxWidth - ellW);

  let lo = 0;
  let hi = t.length;

  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    const s = t.slice(0, mid);
    const w = font.widthOfTextAtSize(s, size);
    if (w <= target) lo = mid;
    else hi = mid - 1;
  }

  const cut = t.slice(0, Math.max(0, lo)).trimEnd();
  return cut ? `${cut}${ell}` : ell;
}

/* =========================
   Colors (como tu captura)
========================= */

const C = {
  headerBg: rgb(0.06, 0.09, 0.16),
  headerAccent: rgb(0.2, 0.45, 0.95),
  pageBg: rgb(0.97, 0.98, 1),
  card: rgb(1, 1, 1),
  border: rgb(0.87, 0.9, 0.95),
  softText: rgb(0.38, 0.44, 0.55),
  ink: rgb(0.09, 0.11, 0.16),
  white: rgb(1, 1, 1),
};

/* =========================
   Rounded rect via SVG path
========================= */

function clamp(n: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, n));
}

function roundedRectPath(x: number, y: number, w: number, h: number, r: number): string {
  const rr = clamp(r, 0, Math.min(w, h) / 2);
  const x0 = x;
  const y0 = y;
  const x1 = x + w;
  const y1 = y + h;

  return [
    `M ${x0 + rr} ${y0}`,
    `L ${x1 - rr} ${y0}`,
    `Q ${x1} ${y0} ${x1} ${y0 + rr}`,
    `L ${x1} ${y1 - rr}`,
    `Q ${x1} ${y1} ${x1 - rr} ${y1}`,
    `L ${x0 + rr} ${y1}`,
    `Q ${x0} ${y1} ${x0} ${y1 - rr}`,
    `L ${x0} ${y0 + rr}`,
    `Q ${x0} ${y0} ${x0 + rr} ${y0}`,
    'Z',
  ].join(' ');
}

function drawRoundedRect(args: {
  page: PDFPage;
  x: number;
  y: number; // bottom
  w: number;
  h: number;
  r: number;
  fill: RGB;
  stroke?: RGB;
  strokeWidth?: number;
}) {
  const { page, x, y, w, h, r, fill, stroke, strokeWidth } = args;
  page.drawSvgPath(roundedRectPath(x, y, w, h, r), {
    color: fill,
    borderColor: stroke,
    borderWidth: strokeWidth,
  });
}

/* =========================
   Layout types
========================= */

type Fonts = { regular: PDFFont; bold: PDFFont };

type Ctx = {
  pdf: PDFDocument;
  page: PDFPage;
  fonts: Fonts;
  w: number;
  h: number;
  margin: number;
  left: number;
  right: number;
  y: number;
  pages: PDFPage[];
};

function drawText(args: {
  page: PDFPage;
  font: PDFFont;
  text: string;
  x: number;
  y: number;
  size: number;
  color: RGB;
}) {
  const { page, font, text, x, y, size, color } = args;
  page.drawText(toWinAnsi(text), { x, y, size, font, color });
}

function addPage(pdf: PDFDocument, fonts: Fonts, margin: number, pages: PDFPage[]): Ctx {
  const page = pdf.addPage([595.28, 841.89]); // A4
  const { width: w, height: h } = page.getSize();

  // background
  page.drawRectangle({ x: 0, y: 0, width: w, height: h, color: C.pageBg });

  const left = margin;
  const right = w - margin;

  const ctx: Ctx = {
    pdf,
    page,
    fonts,
    w,
    h,
    margin,
    left,
    right,
    y: h - margin,
    pages,
  };

  pages.push(page);
  return ctx;
}

function ensureSpace(ctx: Ctx, needed: number, onNewPage?: (ctx2: Ctx) => void): Ctx {
  const bottom = ctx.margin + 42; // deja espacio para footer
  if (ctx.y - needed >= bottom) return ctx;

  const next = addPage(ctx.pdf, ctx.fonts, ctx.margin, ctx.pages);
  if (onNewPage) onNewPage(next);
  return next;
}

/* =========================
   Header (como tu captura)
========================= */

function drawHeader(ctx: Ctx, titleRight: string) {
  const headerH = 92;
  const top = ctx.h;
  const bottom = ctx.h - headerH;

  // dark bar
  ctx.page.drawRectangle({
    x: 0,
    y: bottom,
    width: ctx.w,
    height: headerH,
    color: C.headerBg,
  });

  // left accent strip
  ctx.page.drawRectangle({
    x: 0,
    y: bottom,
    width: 6,
    height: headerH,
    color: C.headerAccent,
  });

  // left texts
  drawText({
    page: ctx.page,
    font: ctx.fonts.bold,
    text: 'REPORTE',
    x: ctx.left,
    y: top - 30,
    size: 11,
    color: rgb(0.86, 0.9, 0.97),
  });

  drawText({
    page: ctx.page,
    font: ctx.fonts.bold,
    text: 'Corte de caja',
    x: ctx.left,
    y: top - 62,
    size: 26,
    color: C.white,
  });

  // right range (top-right)
  const rightText = toWinAnsi(titleRight);
  const size = 12;
  const wText = ctx.fonts.bold.widthOfTextAtSize(rightText, size);
  drawText({
    page: ctx.page,
    font: ctx.fonts.bold,
    text: rightText,
    x: ctx.right - wText,
    y: top - 34,
    size,
    color: rgb(0.86, 0.9, 0.97),
  });

  // move cursor under header
  ctx.y = bottom - 26;
}

/* =========================
   Small meta row
========================= */

function drawMetaRow(ctx: Ctx, rango: string, plantel: string) {
  ctx = ensureSpace(ctx, 34);

  const y = ctx.y;
  const labelSize = 10.5;

  drawText({
    page: ctx.page,
    font: ctx.fonts.bold,
    text: `Rango: ${rango}`,
    x: ctx.left,
    y,
    size: labelSize,
    color: C.softText,
  });

  drawText({
    page: ctx.page,
    font: ctx.fonts.bold,
    text: `Plantel: ${plantel}`,
    x: ctx.left + 220,
    y,
    size: labelSize,
    color: C.softText,
  });

  // divider
  ctx.page.drawLine({
    start: { x: ctx.left, y: y - 18 },
    end: { x: ctx.right, y: y - 18 },
    thickness: 1,
    color: C.border,
  });

  ctx.y = y - 36;
  return ctx;
}

/* =========================
   Section title + underline
========================= */

function drawSectionTitle(ctx: Ctx, title: string) {
  ctx = ensureSpace(ctx, 40);

  drawText({
    page: ctx.page,
    font: ctx.fonts.bold,
    text: title,
    x: ctx.left,
    y: ctx.y,
    size: 15,
    color: C.ink,
  });

  ctx.page.drawLine({
    start: { x: ctx.left, y: ctx.y - 14 },
    end: { x: ctx.right, y: ctx.y - 14 },
    thickness: 1,
    color: C.border,
  });

  ctx.y -= 32;
  return ctx;
}

/* =========================
   Summary row (1 card, 4 cols)
========================= */

function drawSummaryRow(ctx: Ctx, data: CorteCajaDTO) {
  ctx = ensureSpace(ctx, 110);

  const boxW = ctx.right - ctx.left;
  const boxH = 76;
  const yTop = ctx.y;
  const yBottom = yTop - boxH;

  drawRoundedRect({
    page: ctx.page,
    x: ctx.left,
    y: yBottom,
    w: boxW,
    h: boxH,
    r: 10,
    fill: C.card,
    stroke: C.border,
    strokeWidth: 1,
  });

  // subtle top divider like your screenshot
  ctx.page.drawRectangle({
    x: ctx.left,
    y: yTop - 8,
    width: boxW,
    height: 2,
    color: rgb(0.93, 0.95, 0.98),
  });
  // blue mini indicator (center-ish)
  ctx.page.drawRectangle({
    x: ctx.left + boxW * 0.27,
    y: yTop - 8,
    width: boxW * 0.18,
    height: 2,
    color: C.headerAccent,
  });

  const cols = 4;
  const colW = boxW / cols;

  type Item = { label: string; value: string };
  const items: Item[] = [
    { label: 'Total recibos', value: String(data.resumen.totalRecibos) },
    { label: 'Total monto', value: money(data.resumen.totalMonto, 'MXN') },
    { label: 'Cancelados', value: String(data.resumen.totalCancelados) },
    { label: 'Monto cancelado', value: money(data.resumen.totalMontoCancelado, 'MXN') },
  ];

  for (let i = 0; i < cols; i++) {
    const x = ctx.left + colW * i + 18;

    drawText({
      page: ctx.page,
      font: ctx.fonts.bold,
      text: items[i].label,
      x,
      y: yTop - 32,
      size: 10,
      color: C.softText,
    });

    drawText({
      page: ctx.page,
      font: ctx.fonts.bold,
      text: items[i].value,
      x,
      y: yTop - 56,
      size: 12.5,
      color: C.ink,
    });
  }

  ctx.y = yBottom - 26;
  return ctx;
}

/* =========================
   Table
========================= */

type Col = {
  key: 'folio' | 'pago' | 'alumno' | 'concepto' | 'monto' | 'estatus';
  label: string;
  w: number;
  align?: 'left' | 'right';
};

function getCols(tableW: number): Col[] {
  // Ajuste fino para que NO se corte "Estatus" ni se desborde en A4
  const base: Col[] = [
    { key: 'folio', label: 'Folio', w: 70 },
    { key: 'pago', label: 'Pago', w: 70 },
    { key: 'alumno', label: 'Alumno', w: 140 },
    { key: 'concepto', label: 'Concepto', w: Math.max(150, tableW - (70 + 70 + 140 + 95 + 85)) },
    { key: 'monto', label: 'Monto', w: 95, align: 'right' },
    { key: 'estatus', label: 'Estatus', w: 85 },
  ];

  // si sobró o faltó por redondeos, ajusta concepto
  const sum = base.reduce((a, c) => a + c.w, 0);
  if (sum !== tableW) {
    const diff = tableW - sum;
    return base.map((c) => (c.key === 'concepto' ? { ...c, w: c.w + diff } : c));
  }

  return base;
}

function drawTableHeader(ctx: Ctx, cols: Col[], tableX: number, tableW: number) {
  ctx = ensureSpace(ctx, 34);

  // header (sin barra oscura, como tu captura)
  const y = ctx.y;

  for (const c of cols) {
    // sólo texto, sin fondo
    void c;
  }

  let x = tableX;
  const size = 10;

  for (const c of cols) {
    const txt = fitText(ctx.fonts.bold, c.label, size, c.w - 8);
    drawText({
      page: ctx.page,
      font: ctx.fonts.bold,
      text: txt,
      x: x + 2,
      y,
      size,
      color: C.softText,
    });
    x += c.w;
  }

  // divider
  ctx.page.drawLine({
    start: { x: tableX, y: y - 14 },
    end: { x: tableX + tableW, y: y - 14 },
    thickness: 1,
    color: C.border,
  });

  ctx.y = y - 28;
  return ctx;
}

function mapCell(r: CorteCajaReciboDTO, k: Col['key']): string {
  switch (k) {
    case 'folio':
      return safeText(r.folio);
    case 'pago':
      return safeText(r.fechaPago);
    case 'alumno':
      return safeText(r.alumnoNombre);
    case 'concepto':
      return safeText(r.concepto);
    case 'monto':
      return money(r.monto, r.moneda || 'MXN');
    case 'estatus':
      return r.cancelado ? 'Cancelado' : safeText(r.estatusDesc, '—');
    default: {
      const _exhaustive: never = k;
      return String(_exhaustive);
    }
  }
}

function drawRow(ctx: Ctx, cols: Col[], tableX: number, tableW: number, r: CorteCajaReciboDTO, idx: number) {
  const rowH = 20;
  ctx = ensureSpace(ctx, rowH + 10);

  // zebra suave (muy leve)
  if (idx % 2 === 1) {
    ctx.page.drawRectangle({
      x: tableX,
      y: ctx.y - rowH + 4,
      width: tableW,
      height: rowH,
      color: rgb(0.985, 0.988, 1),
    });
  }

  // line bottom
  ctx.page.drawLine({
    start: { x: tableX, y: ctx.y - rowH + 4 },
    end: { x: tableX + tableW, y: ctx.y - rowH + 4 },
    thickness: 1,
    color: C.border,
  });

  const size = 9.4;
  let x = tableX;

  for (const c of cols) {
    const raw = mapCell(r, c.key);
    const txt = fitText(ctx.fonts.regular, raw, size, c.w - 8);

    if (c.align === 'right') {
      const t = toWinAnsi(txt);
      const tw = ctx.fonts.regular.widthOfTextAtSize(t, size);
      drawText({
        page: ctx.page,
        font: ctx.fonts.regular,
        text: txt,
        x: x + c.w - 4 - tw,
        y: ctx.y - 12,
        size,
        color: C.ink,
      });
    } else {
      drawText({
        page: ctx.page,
        font: ctx.fonts.regular,
        text: txt,
        x: x + 2,
        y: ctx.y - 12,
        size,
        color: C.ink,
      });
    }

    x += c.w;
  }

  ctx.y -= rowH;
  return ctx;
}

/* =========================
   Footer (Generado + Pagina X/Y)
========================= */

function drawFooter(page: PDFPage, fonts: Fonts, margin: number, w: number, generatedAt: string, pageNum: number, total: number) {
  const y = 18;

  page.drawLine({
    start: { x: margin, y: y + 14 },
    end: { x: w - margin, y: y + 14 },
    thickness: 1,
    color: rgb(0.92, 0.94, 0.98),
  });

  drawText({
    page,
    font: fonts.regular,
    text: `Generado: ${generatedAt}`,
    x: margin,
    y,
    size: 9,
    color: C.softText,
  });

  const rightTxt = `Página ${pageNum}/${total}`;
  const size = 9;
  const rw = fonts.bold.widthOfTextAtSize(toWinAnsi(rightTxt), size);

  drawText({
    page,
    font: fonts.bold,
    text: rightTxt,
    x: w - margin - rw,
    y,
    size,
    color: C.softText,
  });
}

/* =========================
   Public API
========================= */

export async function buildCorteCajaPdfBytes(args: {
  data: CorteCajaDTO;
  recibos: CorteCajaReciboDTO[];
  filters: { fechaInicio: string; fechaFin: string; plantelId: number | null };
  plantelLabel?: string | null;
}): Promise<Uint8Array> {
  const { data, recibos, filters, plantelLabel } = args;

  const pdf = await PDFDocument.create();
  const fonts: Fonts = {
    regular: await pdf.embedFont(StandardFonts.Helvetica),
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
  };

  const pages: PDFPage[] = [];
  const margin = 44;

  let ctx = addPage(pdf, fonts, margin, pages);

  const rangoTopRight = `${safeText(filters.fechaInicio)} a ${safeText(filters.fechaFin)}`;
  drawHeader(ctx, rangoTopRight);

  const rango = `${safeText(filters.fechaInicio)} a ${safeText(filters.fechaFin)}`;
  const plantel =
    filters.plantelId == null
      ? 'Todos'
      : plantelLabel
        ? `${plantelLabel} (#${filters.plantelId})`
        : `#${filters.plantelId}`;

  ctx = drawMetaRow(ctx, rango, plantel);

  ctx = drawSectionTitle(ctx, 'Resumen');
  ctx = drawSummaryRow(ctx, data);

  ctx = drawSectionTitle(ctx, 'Recibos (vista actual)');

  const tableX = ctx.left;
  const tableW = ctx.right - ctx.left;
  const cols = getCols(tableW);

  ctx = drawTableHeader(ctx, cols, tableX, tableW);

  if (!recibos?.length) {
    // deja el “silencio” como tu captura (sin “mensaje grandote”)
    // pero sí dejamos una línea suave para que no se vea “cortado”
    ctx.page.drawLine({
      start: { x: tableX, y: ctx.y - 2 },
      end: { x: tableX + tableW, y: ctx.y - 2 },
      thickness: 1,
      color: rgb(0.94, 0.96, 0.99),
    });
    ctx.y -= 18;
  } else {
    for (let i = 0; i < recibos.length; i++) {
      // Si no cabe, nueva página con header mini (mismo estilo) y tabla
      const needs = 60;
      const bottom = ctx.margin + 42;
      if (ctx.y - needs < bottom) {
        ctx = addPage(pdf, fonts, margin, pages);
        drawHeader(ctx, rangoTopRight);
        ctx = drawMetaRow(ctx, rango, plantel);
        ctx = drawSectionTitle(ctx, 'Recibos (continuación)');
        ctx = drawTableHeader(ctx, cols, tableX, tableW);
      }

      ctx = drawRow(ctx, cols, tableX, tableW, recibos[i], i);
    }
  }

  // Footer (2do pase) con total páginas rtoArrayBuffereal
  const generatedAt = new Date().toLocaleString('es-MX');
  const total = pages.length;

  for (let i = 0; i < pages.length; i++) {
    drawFooter(pages[i], fonts, margin, pages[i].getSize().width, generatedAt, i + 1, total);
  }

  return pdf.save();
}

/**
 * Descarga un PDF en el navegador.
 */
function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  // ✅ garantiza ArrayBuffer “real” (no ArrayBufferLike / SharedArrayBuffer)
  const ab = u8.buffer;
  if (ab instanceof ArrayBuffer && u8.byteOffset === 0 && u8.byteLength === ab.byteLength) {
    return ab;
  }

  // si es vista parcial o el buffer no es ArrayBuffer puro, copiamos
  const copy = new Uint8Array(u8.byteLength);
  copy.set(u8);
  return copy.buffer;
}

/**
 * Descarga un PDF en el navegador.
 */
export function downloadPdfBytes(bytes: Uint8Array, filename: string): void {
  const arrayBuffer = toArrayBuffer(bytes);

  const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
