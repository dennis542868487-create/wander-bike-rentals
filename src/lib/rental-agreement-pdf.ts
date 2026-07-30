import type { PDFFont, PDFPage, RGB } from "pdf-lib";
import {
  buildRentalAgreementClauses,
  formatAgreementDateTime,
  rentalAgreementModeLabel,
  signingCapacityLabel,
  type RentalAgreementData,
} from "./rental-agreement";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BOTTOM_LIMIT = 62;
const INK = { r: 15 / 255, g: 23 / 255, b: 42 / 255 };
const MUTED = { r: 71 / 255, g: 85 / 255, b: 105 / 255 };
const TEAL = { r: 15 / 255, g: 118 / 255, b: 110 / 255 };
const TEAL_SOFT = { r: 240 / 255, g: 253 / 255, b: 250 / 255 };
const BORDER = { r: 203 / 255, g: 213 / 255, b: 225 / 255 };

type PdfColor = { r: number; g: number; b: number };
type PdfFontSet = { latin: PDFFont; unicode: PDFFont };

function pdfColor(rgb: typeof import("pdf-lib")["rgb"], color: PdfColor): RGB {
  return rgb(color.r, color.g, color.b);
}

function fontForCharacter(character: string, fonts: PdfFontSet) {
  return character.codePointAt(0)! <= 0xff ? fonts.latin : fonts.unicode;
}

function textWidth(text: string, fonts: PdfFontSet, size: number) {
  return Array.from(text).reduce(
    (width, character) =>
      width + fontForCharacter(character, fonts).widthOfTextAtSize(character, size),
    0,
  );
}

function drawTextRuns(
  page: PDFPage,
  text: string,
  options: {
    x: number;
    y: number;
    size: number;
    color: RGB;
    fonts: PdfFontSet;
  },
) {
  let x = options.x;
  let run = "";
  let runFont = options.fonts.latin;

  function flush() {
    if (!run) return;
    page.drawText(run, {
      x,
      y: options.y,
      size: options.size,
      font: runFont,
      color: options.color,
    });
    x += runFont.widthOfTextAtSize(run, options.size);
    run = "";
  }

  for (const character of Array.from(text)) {
    const nextFont = fontForCharacter(character, options.fonts);
    if (run && nextFont !== runFont) flush();
    runFont = nextFont;
    run += character;
  }
  flush();
}

function splitLongToken(
  token: string,
  fonts: PdfFontSet,
  size: number,
  maxWidth: number,
) {
  const parts: string[] = [];
  let part = "";
  for (const character of Array.from(token)) {
    const candidate = `${part}${character}`;
    if (part && textWidth(candidate, fonts, size) > maxWidth) {
      parts.push(part);
      part = character;
    } else {
      part = candidate;
    }
  }
  if (part) parts.push(part);
  return parts;
}

export function wrapPdfText(
  text: string,
  fonts: PdfFontSet,
  size: number,
  maxWidth: number,
) {
  const paragraphs = text.replace(/\r/g, "").split("\n");
  const output: string[] = [];

  for (const [paragraphIndex, paragraph] of paragraphs.entries()) {
    const rawWords = paragraph.trim().split(/\s+/).filter(Boolean);
    const words = rawWords.flatMap((word) =>
      textWidth(word, fonts, size) > maxWidth
        ? splitLongToken(word, fonts, size, maxWidth)
        : [word],
    );
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && textWidth(candidate, fonts, size) > maxWidth) {
        output.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) output.push(line);
    if (paragraphIndex < paragraphs.length - 1) output.push("");
  }

  return output.length ? output : [""];
}

async function loadPdfFontBytes(provided?: Uint8Array) {
  if (provided) return provided;
  const response = await fetch(
    "/fonts/droid-sans-fallback/DroidSansFallback.ttf",
    { cache: "force-cache" },
  );
  if (!response.ok) {
    throw new Error("The PDF font could not be loaded. Please try again.");
  }
  return new Uint8Array(await response.arrayBuffer());
}

export async function createRentalAgreementPdf(
  data: RentalAgreementData,
  options?: { fontBytes?: Uint8Array },
) {
  const [{ PDFDocument, StandardFonts, rgb }, { default: fontkit }] =
    await Promise.all([
      import("pdf-lib"),
      import("@pdf-lib/fontkit"),
    ]);
  const document = await PDFDocument.create();
  document.registerFontkit(fontkit);
  const fontBytes = await loadPdfFontBytes(options?.fontBytes);
  const fonts: PdfFontSet = {
    latin: await document.embedFont(StandardFonts.Helvetica),
    unicode: await document.embedFont(fontBytes, { subset: false }),
  };

  document.setTitle(
    `${rentalAgreementModeLabel(data.mode)} agreement - ${data.renterFirstName} ${data.renterLastName}`,
  );
  document.setAuthor("Wander Bike");
  document.setSubject("Signed bike rental acknowledgement and waiver");
  document.setCreator("Wander Bike on-device rental form");
  document.setCreationDate(new Date(data.signedAt));

  let page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function addRunningHeader(target: PDFPage) {
    target.drawText("WANDER BIKE", {
      x: MARGIN,
      y: PAGE_HEIGHT - 34,
      size: 8,
      font: fonts.latin,
      color: pdfColor(rgb, TEAL),
    });
    target.drawLine({
      start: { x: MARGIN, y: PAGE_HEIGHT - 42 },
      end: { x: PAGE_WIDTH - MARGIN, y: PAGE_HEIGHT - 42 },
      thickness: 0.8,
      color: pdfColor(rgb, BORDER),
    });
  }

  function addPage() {
    page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    addRunningHeader(page);
    y = PAGE_HEIGHT - 62;
  }

  function ensureSpace(height: number) {
    if (y - height < BOTTOM_LIMIT) addPage();
  }

  function drawWrapped(
    text: string,
    options: {
      size?: number;
      color?: PdfColor;
      x?: number;
      maxWidth?: number;
      lineHeight?: number;
      after?: number;
    } = {},
  ) {
    const size = options.size ?? 9.5;
    const lineHeight = options.lineHeight ?? size * 1.45;
    const x = options.x ?? MARGIN;
    const maxWidth = options.maxWidth ?? CONTENT_WIDTH;
    const lines = wrapPdfText(text, fonts, size, maxWidth);
    ensureSpace(lines.length * lineHeight + (options.after ?? 0));
    for (const line of lines) {
      if (line) {
        drawTextRuns(page, line, {
          x,
          y,
          size,
          color: pdfColor(rgb, options.color ?? INK),
          fonts,
        });
      }
      y -= lineHeight;
    }
    y -= options.after ?? 0;
  }

  function drawSectionTitle(title: string) {
    ensureSpace(34);
    page.drawText(title.toUpperCase(), {
      x: MARGIN,
      y,
      size: 9,
      font: fonts.latin,
      color: pdfColor(rgb, TEAL),
    });
    y -= 20;
  }

  function drawField(label: string, value: string) {
    const cleanedValue = value.trim() || "Not provided";
    drawWrapped(label.toUpperCase(), {
      size: 7.4,
      color: MUTED,
      lineHeight: 9,
      after: 2,
    });
    drawWrapped(cleanedValue, {
      size: 10,
      lineHeight: 13.5,
      after: 9,
    });
  }

  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 10,
    width: PAGE_WIDTH,
    height: 10,
    color: pdfColor(rgb, TEAL),
  });
  page.drawText("WANDER BIKE", {
    x: MARGIN,
    y,
    size: 9,
    font: fonts.latin,
    color: pdfColor(rgb, TEAL),
  });
  y -= 32;
  drawWrapped("BIKE RENTAL ACKNOWLEDGEMENT & WAIVER", {
    size: 20,
    lineHeight: 25,
    after: 10,
  });

  page.drawRectangle({
    x: MARGIN,
    y: y - 45,
    width: CONTENT_WIDTH,
    height: 52,
    color: pdfColor(rgb, TEAL_SOFT),
    borderColor: pdfColor(rgb, BORDER),
    borderWidth: 0.8,
  });
  drawTextRuns(page, rentalAgreementModeLabel(data.mode), {
    x: MARGIN + 14,
    y: y - 14,
    size: 11,
    color: pdfColor(rgb, INK),
    fonts,
  });
  drawTextRuns(page, `Rental provider: ${data.providerName}`, {
    x: MARGIN + 14,
    y: y - 32,
    size: 9,
    color: pdfColor(rgb, MUTED),
    fonts,
  });
  y -= 68;

  drawSectionTitle("Renter information");
  drawField(
    "Full legal name",
    `${data.renterFirstName} ${data.renterLastName}`,
  );
  drawField("Phone", data.renterPhone);
  drawField("Email", data.renterEmail);
  drawField("Photo ID", `${data.photoIdType} - ${data.photoIdNumber}`);

  drawSectionTitle("Rental details");
  drawField("Rental provider", data.providerName);
  drawField("Provider contact", data.providerContact);
  drawField("Prepared by", data.preparedBy);
  drawField("Rental start", formatAgreementDateTime(data.rentalStart));
  drawField("Expected return", formatAgreementDateTime(data.expectedReturn));
  drawField("Bike or equipment", data.bikeDescription);
  drawField(
    "Quantities",
    `Adult bikes: ${data.adultBikeQuantity} | Kids bikes: ${data.kidBikeQuantity} | Trailers: ${data.trailerQuantity}`,
  );
  if (data.notes.trim()) drawField("Condition or handoff notes", data.notes);

  addPage();
  drawSectionTitle("Agreement terms");
  const clauses = buildRentalAgreementClauses(data.mode, data.providerName);
  for (const [index, clause] of clauses.entries()) {
    ensureSpace(58);
    drawWrapped(`${index + 1}. ${clause.title}`, {
      size: 10.5,
      lineHeight: 14,
      after: 2,
    });
    drawWrapped(clause.body, {
      size: 8.7,
      color: MUTED,
      lineHeight: 12.2,
      after: 9,
    });
  }

  ensureSpace(330);
  drawSectionTitle("Signature and confirmation");
  drawField("Signer", data.signerLegalName);
  drawField("Signing as", signingCapacityLabel(data.signingCapacity));
  drawField("Includes minor riders", data.includesMinors ? "Yes" : "No");
  drawField("Signed", formatAgreementDateTime(data.signedAt));
  drawWrapped(
    "The signer confirmed that they read and agreed to all terms above before signing.",
    { size: 8.7, color: MUTED, lineHeight: 12, after: 8 },
  );

  const signature = await document.embedPng(data.signatureDataUrl);
  const signatureBoxHeight = 92;
  page.drawRectangle({
    x: MARGIN,
    y: y - signatureBoxHeight,
    width: CONTENT_WIDTH,
    height: signatureBoxHeight,
    color: rgb(1, 1, 1),
    borderColor: pdfColor(rgb, BORDER),
    borderWidth: 0.8,
  });
  const signatureScale = Math.min(
    (CONTENT_WIDTH - 28) / signature.width,
    (signatureBoxHeight - 18) / signature.height,
  );
  const signatureWidth = signature.width * signatureScale;
  const signatureHeight = signature.height * signatureScale;
  page.drawImage(signature, {
    x: MARGIN + 14,
    y: y - signatureBoxHeight + 9,
    width: signatureWidth,
    height: signatureHeight,
  });
  y -= signatureBoxHeight + 16;

  drawWrapped(
    "Privacy note: This PDF was created locally in the browser. Wander Bike did not receive or store the information used to create it. The person who downloaded this file is responsible for keeping it.",
    { size: 7.8, color: MUTED, lineHeight: 10.5 },
  );

  const pages = document.getPages();
  for (const [index, target] of pages.entries()) {
    target.drawLine({
      start: { x: MARGIN, y: 42 },
      end: { x: PAGE_WIDTH - MARGIN, y: 42 },
      thickness: 0.6,
      color: pdfColor(rgb, BORDER),
    });
    target.drawText(
      `Generated on this device - Not stored by Wander Bike - Page ${index + 1} of ${pages.length}`,
      {
        x: MARGIN,
        y: 27,
        size: 6.8,
        font: fonts.latin,
        color: pdfColor(rgb, MUTED),
      },
    );
  }

  return document.save();
}
