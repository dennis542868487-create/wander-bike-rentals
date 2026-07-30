"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Eraser,
  FileSignature,
  LockKeyhole,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { DateField } from "@/components/forms/date-field";
import {
  buildRentalAgreementClauses,
  rentalAgreementFilename,
  rentalAgreementModeLabel,
  type RentalAgreementData,
  type RentalAgreementMode,
} from "@/lib/rental-agreement";
import { createRentalAgreementPdf } from "@/lib/rental-agreement-pdf";

const PHOTO_ID_OPTIONS = [
  "Driver's licence",
  "Passport",
  "BC Services Card",
  "Provincial or state ID",
  "Other government photo ID",
];

function stringValue(form: FormData, name: string) {
  return String(form.get(name) ?? "").trim();
}

function numberValue(form: FormData, name: string) {
  const value = Number(form.get(name));
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
}

function SignaturePad({
  onChange,
}: {
  onChange: (dataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const hasInkRef = useRef(false);

  function point(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const bounds = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * canvas.width,
      y: ((event.clientY - bounds.top) / bounds.height) * canvas.height,
    };
  }

  function start(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    const context = canvas.getContext("2d");
    if (!context) return;
    const next = point(event);
    context.beginPath();
    context.moveTo(next.x, next.y);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 6;
    context.strokeStyle = "#0f172a";
    drawingRef.current = true;
  }

  function move(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    event.preventDefault();
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const next = point(event);
    context.lineTo(next.x, next.y);
    context.stroke();
    hasInkRef.current = true;
  }

  function finish(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    event.preventDefault();
    const canvas = canvasRef.current;
    drawingRef.current = false;
    if (canvas?.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    if (canvas && hasInkRef.current) onChange(canvas.toDataURL("image/png"));
  }

  function clear() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    hasInkRef.current = false;
    drawingRef.current = false;
    onChange("");
  }

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-inner">
        <canvas
          ref={canvasRef}
          width={900}
          height={300}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={finish}
          onPointerCancel={finish}
          onPointerLeave={finish}
          className="block h-[11rem] w-full cursor-crosshair touch-none sm:h-[12.5rem]"
          role="img"
          aria-label="Signature drawing area"
        />
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-3 py-2">
          <p className="text-xs text-slate-500">
            Sign with a finger, stylus, or mouse.
          </p>
          <button
            type="button"
            onClick={clear}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold text-slate-700 hover:bg-slate-100"
          >
            <Eraser className="h-4 w-4" aria-hidden="true" />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-800">
        {number}
      </div>
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-950">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </div>
  );
}

export function RentalAgreementForm({
  mode,
  defaultProviderName,
  defaultProviderContact,
  defaultPreparedBy,
}: {
  mode: RentalAgreementMode;
  defaultProviderName: string;
  defaultProviderContact: string;
  defaultPreparedBy: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [providerName, setProviderName] = useState(defaultProviderName);
  const [signatureDataUrl, setSignatureDataUrl] = useState("");
  const [signatureKey, setSignatureKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [downloaded, setDownloaded] = useState(false);
  const clauses = buildRentalAgreementClauses(mode, providerName);

  useEffect(() => {
    if (!dirty || downloaded) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [dirty, downloaded]);

  function markChanged() {
    setDirty(true);
    setDownloaded(false);
    setError("");
  }

  async function downloadPdf(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (!formElement.reportValidity()) return;
    if (!signatureDataUrl) {
      setError("The renter must sign in the signature box before downloading.");
      document
        .getElementById("rental-signature")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const form = new FormData(formElement);
    const signedAt = new Date().toISOString();
    const data: RentalAgreementData = {
      mode,
      providerName: stringValue(form, "provider_name"),
      providerContact: stringValue(form, "provider_contact"),
      preparedBy: stringValue(form, "prepared_by"),
      renterFirstName: stringValue(form, "renter_first_name"),
      renterLastName: stringValue(form, "renter_last_name"),
      renterPhone: stringValue(form, "renter_phone"),
      renterEmail: stringValue(form, "renter_email"),
      photoIdType: stringValue(form, "photo_id_type"),
      photoIdNumber: stringValue(form, "photo_id_number"),
      rentalStart: stringValue(form, "rental_start"),
      expectedReturn: stringValue(form, "expected_return"),
      bikeDescription: stringValue(form, "bike_description"),
      adultBikeQuantity: numberValue(form, "adult_bike_quantity"),
      kidBikeQuantity: numberValue(form, "kid_bike_quantity"),
      trailerQuantity: numberValue(form, "trailer_quantity"),
      signingCapacity: stringValue(
        form,
        "signing_capacity",
      ) as RentalAgreementData["signingCapacity"],
      signerLegalName: stringValue(form, "signer_legal_name"),
      includesMinors: form.get("includes_minors") === "yes",
      notes: stringValue(form, "notes"),
      signedAt,
      signatureDataUrl,
    };

    setBusy(true);
    setError("");
    try {
      const bytes = await createRentalAgreementPdf(data);
      const blob = new Blob([Uint8Array.from(bytes).buffer], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = rentalAgreementFilename(data);
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2_000);
      setDownloaded(true);
      setDirty(false);
    } catch (pdfError) {
      setError(
        pdfError instanceof Error
          ? pdfError.message
          : "The PDF could not be created. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  function clearForm() {
    if (
      dirty &&
      !window.confirm(
        "Clear every field and signature? This cannot be undone unless you already downloaded the PDF.",
      )
    ) {
      return;
    }
    formRef.current?.reset();
    setProviderName(defaultProviderName);
    setSignatureDataUrl("");
    setSignatureKey((value) => value + 1);
    setDirty(false);
    setDownloaded(false);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-sm font-bold text-teal-800">
            {rentalAgreementModeLabel(mode)}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Rental agreement form
          </h1>
          <p className="mt-2 max-w-3xl leading-7 text-slate-600">
            Complete this with the renter and have them sign before you hand
            over the bike.
          </p>
        </div>
        <button
          type="button"
          onClick={clearForm}
          className="btn-secondary min-h-11 text-sm"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Clear form
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1rem] border border-teal-200 bg-teal-50 p-4">
          <div className="flex gap-3">
            <LockKeyhole
              className="mt-0.5 h-5 w-5 shrink-0 text-teal-800"
              aria-hidden="true"
            />
            <div>
              <p className="font-bold text-teal-950">
                Not sent to Wander Bike
              </p>
              <p className="mt-1 text-sm leading-6 text-teal-900">
                Nothing typed or drawn here is saved to Supabase, your account,
                or the marketplace.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-[1rem] border border-amber-200 bg-amber-50 p-4">
          <div className="flex gap-3">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0 text-amber-800"
              aria-hidden="true"
            />
            <div>
              <p className="font-bold text-amber-950">
                Download before closing
              </p>
              <p className="mt-1 text-sm leading-6 text-amber-900">
                Refreshing or closing this tab clears the form. Keep the
                downloaded PDF in your own secure files.
              </p>
            </div>
          </div>
        </div>
      </div>

      <form
        ref={formRef}
        onSubmit={downloadPdf}
        onChange={markChanged}
        className="mt-6 space-y-5"
      >
        <section className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-7">
          <SectionHeading
            number="1"
            title="Rental provider and renter"
            description="Use the renter's full legal name and the same details shown on their photo ID."
          />

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="field-label sm:col-span-2">
              {mode === "wander"
                ? "Rental provider"
                : "Rental provider / bike owner legal name"}
              <input
                name="provider_name"
                required
                maxLength={120}
                value={providerName}
                readOnly={mode === "wander"}
                onChange={(event) => {
                  setProviderName(event.target.value);
                  markChanged();
                }}
                className="market-input text-base read-only:bg-slate-50 read-only:text-slate-600"
                autoComplete="name"
              />
            </label>
            <label className="field-label">
              Provider contact
              <input
                name="provider_contact"
                required
                maxLength={160}
                defaultValue={defaultProviderContact}
                className="market-input text-base"
                placeholder="Email or phone number"
              />
            </label>
            <label className="field-label">
              Prepared by
              <input
                name="prepared_by"
                required
                maxLength={120}
                defaultValue={defaultPreparedBy}
                className="market-input text-base"
                placeholder="Owner or staff name"
              />
            </label>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-7">
            <h3 className="font-bold text-slate-950">Renter details</h3>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <label className="field-label">
                First name
                <input
                  name="renter_first_name"
                  required
                  maxLength={80}
                  className="market-input text-base"
                  autoComplete="given-name"
                />
              </label>
              <label className="field-label">
                Last name
                <input
                  name="renter_last_name"
                  required
                  maxLength={80}
                  className="market-input text-base"
                  autoComplete="family-name"
                />
              </label>
              <label className="field-label">
                Phone number
                <input
                  name="renter_phone"
                  type="tel"
                  required
                  maxLength={40}
                  className="market-input text-base"
                  autoComplete="tel"
                  placeholder="Include country code if not Canadian"
                />
              </label>
              <label className="field-label">
                Email
                <input
                  name="renter_email"
                  type="email"
                  required
                  maxLength={160}
                  className="market-input text-base"
                  autoComplete="email"
                />
              </label>
              <label className="field-label">
                Photo ID type
                <select
                  name="photo_id_type"
                  required
                  defaultValue=""
                  className="market-select text-base"
                >
                  <option value="" disabled>
                    Select photo ID
                  </option>
                  {PHOTO_ID_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-label">
                Photo ID number
                <input
                  name="photo_id_number"
                  required
                  maxLength={80}
                  className="market-input text-base"
                  autoComplete="off"
                />
              </label>
            </div>
            <p className="mt-4 flex gap-2 text-xs leading-5 text-slate-500">
              <ShieldCheck
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              Photo ID details only appear in the PDF downloaded to this
              device. Protect that file because it contains personal
              information.
            </p>
          </div>
        </section>

        <section className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-7">
          <SectionHeading
            number="2"
            title="Bike and rental timing"
            description="Record exactly what is being handed over and when it should be returned."
          />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="field-label">
              Rental start
              <DateField
                name="rental_start"
                type="datetime-local"
                required
                className="market-input text-base"
              />
            </label>
            <label className="field-label">
              Expected return
              <DateField
                name="expected_return"
                type="datetime-local"
                required
                className="market-input text-base"
              />
            </label>
            <label className="field-label sm:col-span-2">
              Bike / listing description
              <input
                name="bike_description"
                required
                maxLength={240}
                className="market-input text-base"
                placeholder="e.g. Blue Trek hybrid, listing name, frame size, lock"
              />
            </label>
            <fieldset className="sm:col-span-2">
              <legend className="field-label">Equipment quantities</legend>
              <div className="mt-3 grid grid-cols-1 gap-4 min-[420px]:grid-cols-3">
                <label className="field-label">
                  Adult bikes
                  <input
                    name="adult_bike_quantity"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="30"
                    defaultValue="1"
                    className="market-input text-base"
                  />
                </label>
                <label className="field-label">
                  Kids bikes
                  <input
                    name="kid_bike_quantity"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="30"
                    defaultValue="0"
                    className="market-input text-base"
                  />
                </label>
                <label className="field-label">
                  Trailers
                  <input
                    name="trailer_quantity"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="30"
                    defaultValue="0"
                    className="market-input text-base"
                  />
                </label>
              </div>
            </fieldset>
            <label className="field-label sm:col-span-2">
              Condition or handoff notes{" "}
              <span className="font-normal text-slate-400">(optional)</span>
              <textarea
                name="notes"
                maxLength={500}
                className="market-textarea min-h-28 text-base"
                placeholder="Existing scratches, included accessories, or other handoff details"
              />
            </label>
          </div>
        </section>

        <section className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-7">
          <SectionHeading
            number="3"
            title="Read, confirm, and sign"
            description="The renter or authorized signer must review these terms before signing."
          />

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <ol className="space-y-5">
              {clauses.map((clause, index) => (
                <li key={clause.title}>
                  <h3 className="text-sm font-bold text-slate-950">
                    {index + 1}. {clause.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600">
                    {clause.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="field-label">
              Signer full legal name
              <input
                name="signer_legal_name"
                required
                maxLength={160}
                className="market-input text-base"
                autoComplete="name"
                placeholder="Must match the signer's photo ID"
              />
            </label>
            <label className="field-label">
              Signing as
              <select
                name="signing_capacity"
                required
                defaultValue="self"
                className="market-select text-base"
              >
                <option value="self">Renter signing for themself</option>
                <option value="guardian">Parent or legal guardian</option>
                <option value="group">
                  Authorized group representative
                </option>
              </select>
            </label>
          </div>

          <label className="mt-5 flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3.5 text-sm leading-6 text-slate-700">
            <input
              name="includes_minors"
              type="checkbox"
              value="yes"
              className="mt-1 h-5 w-5 shrink-0 accent-teal-700"
            />
            This rental includes one or more riders under 19.
          </label>

          <label className="mt-3 flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-teal-200 bg-teal-50 p-3.5 text-sm font-semibold leading-6 text-teal-950">
            <input
              name="agreement_confirmed"
              type="checkbox"
              required
              className="mt-1 h-5 w-5 shrink-0 accent-teal-700"
            />
            I have read and agree to the complete rental agreement above.
          </label>

          <div id="rental-signature" className="mt-6 scroll-mt-24">
            <div className="mb-2">
              <p className="field-label">Renter / authorized signer signature</p>
              <p className="mt-1 text-xs text-slate-500">
                Required. This signature is placed into the downloaded PDF.
              </p>
            </div>
            <SignaturePad
              key={signatureKey}
              onChange={(dataUrl) => {
                setSignatureDataUrl(dataUrl);
                markChanged();
              }}
            />
          </div>
        </section>

        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-900"
          >
            {error}
          </div>
        ) : null}

        {downloaded ? (
          <div
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5"
          >
            <div className="flex gap-3">
              <CheckCircle2
                className="h-5 w-5 shrink-0 text-emerald-700"
                aria-hidden="true"
              />
              <div>
                <p className="font-bold text-emerald-950">
                  Signed PDF download started.
                </p>
                <p className="mt-1 text-sm leading-6 text-emerald-900">
                  Check Downloads or Files on this device and move the PDF to
                  the secure place where you keep rental records. You can clear
                  this page after confirming the file is there.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="sticky bottom-3 z-20 rounded-[1.1rem] border border-slate-700 bg-slate-950 p-3 shadow-[0_20px_55px_rgba(15,23,42,0.34)] sm:flex sm:items-center sm:justify-between sm:gap-5 sm:p-4">
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-white">
              The form is not stored online.
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              Download the PDF before leaving this page.
            </p>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-teal-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-300 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
          >
            {busy ? (
              "Creating PDF..."
            ) : (
              <>
                <Download className="h-4 w-4" aria-hidden="true" />
                Download signed PDF
              </>
            )}
          </button>
        </div>
      </form>

      <p className="mt-6 flex gap-2 rounded-xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-500">
        <FileSignature
          className="mt-0.5 h-4 w-4 shrink-0"
          aria-hidden="true"
        />
        This tool reproduces the supplied rental form in a phone-friendly
        format and updates the old payment wording for offline transactions.
        Have local legal counsel review your final waiver language before
        relying on it as legal advice.
      </p>
    </div>
  );
}
