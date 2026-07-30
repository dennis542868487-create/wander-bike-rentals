import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import {
  buildRentalAgreementClauses,
  rentalAgreementFilename,
  type RentalAgreementData,
} from "@/lib/rental-agreement";
import { createRentalAgreementPdf } from "@/lib/rental-agreement-pdf";

const data: RentalAgreementData = {
  mode: "community",
  providerName: "Dennis 荒七杂八",
  providerContact: "owner@example.com",
  preparedBy: "Dennis 荒七杂八",
  renterFirstName: "测试",
  renterLastName: "Rider",
  renterPhone: "+1 778 555 0101",
  renterEmail: "rider@example.com",
  photoIdType: "Driver's licence",
  photoIdNumber: "BC-123456",
  rentalStart: "2026-07-29T10:00",
  expectedReturn: "2026-07-29T18:00",
  bikeDescription: "Blue hybrid bike with lock",
  adultBikeQuantity: 1,
  kidBikeQuantity: 0,
  trailerQuantity: 0,
  signingCapacity: "self",
  signerLegalName: "测试 Rider",
  includesMinors: false,
  notes: "Small scratch on the left fork.",
  signedAt: "2026-07-29T17:00:00.000Z",
  signatureDataUrl:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
};

describe("rental agreement", () => {
  it("uses offline loss and damage wording with no credit card charge", () => {
    const clauses = buildRentalAgreementClauses(
      "community",
      "Community Owner",
    );
    const text = clauses.map((clause) => clause.body).join(" ");
    expect(clauses).toHaveLength(7);
    expect(text).toContain("paid directly");
    expect(text).toContain("provides the marketplace only");
    expect(text.toLowerCase()).not.toContain("credit card");
  });

  it("creates a readable multi-page PDF with unicode names", async () => {
    const fontBytes = readFileSync(
      process.env.RENTAL_PDF_FONT ??
        join(
          process.cwd(),
          "public/fonts/droid-sans-fallback/DroidSansFallback.ttf",
        ),
    );
    const bytes = await createRentalAgreementPdf(data, {
      fontBytes: new Uint8Array(fontBytes),
    });
    const document = await PDFDocument.load(bytes);
    if (process.env.RENTAL_PDF_OUTPUT) {
      writeFileSync(process.env.RENTAL_PDF_OUTPUT, bytes);
    }

    expect(bytes.byteLength).toBeGreaterThan(1_000_000);
    expect(document.getPageCount()).toBeGreaterThanOrEqual(2);
    expect(document.getTitle()).toContain("测试 Rider");
  });

  it("builds a specific download filename", () => {
    expect(rentalAgreementFilename(data)).toBe(
      "bike-rental-agreement-测试-Rider-2026-07-29.pdf",
    );
  });
});
