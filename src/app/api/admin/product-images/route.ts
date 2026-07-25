import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/http/security";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/supabase/auth";

export const runtime = "nodejs";

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);
const maximumBytes = 8 * 1024 * 1024;

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const auth = await requireStaff(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (auth.role !== "admin") {
    return NextResponse.json(
      { error: "Only administrators can upload product images." },
      { status: 403 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
    }

    const extension = allowedTypes.get(file.type);
    if (!extension) {
      return NextResponse.json(
        { error: "Use a JPEG, PNG, WebP, or AVIF image." },
        { status: 415 },
      );
    }
    if (file.size <= 0 || file.size > maximumBytes) {
      return NextResponse.json(
        { error: "Product images must be smaller than 8 MB." },
        { status: 413 },
      );
    }

    const storagePath = `products/${new Date().getUTCFullYear()}/${randomUUID()}.${extension}`;
    const supabase = getSupabaseAdmin();
    const upload = await supabase.storage
      .from("product-images")
      .upload(storagePath, new Uint8Array(await file.arrayBuffer()), {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });

    if (upload.error) {
      return NextResponse.json(
        { error: "The image could not be uploaded." },
        { status: 502 },
      );
    }

    const publicUrl = supabase.storage
      .from("product-images")
      .getPublicUrl(storagePath).data.publicUrl;

    return NextResponse.json(
      {
        image: {
          storagePath,
          publicUrl,
          altText: "",
          width: null,
          height: null,
          sortOrder: 0,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "The image could not be uploaded." },
      { status: 500 },
    );
  }
}
