import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/http/security";
import { getWebsitePageDefinition } from "@/lib/website-cms/config";
import {
  WEBSITE_MEDIA_MAX_BYTES,
  WEBSITE_MEDIA_TYPES,
  websiteMediaMetadataSchema,
} from "@/lib/website-cms/schemas";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/auth";

const fileExtensions: Record<(typeof WEBSITE_MEDIA_TYPES)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const metadata = websiteMediaMetadataSchema.safeParse({
      pageSlug: formData.get("pageSlug"),
      fieldKey: formData.get("fieldKey"),
    });

    if (!(file instanceof File) || !metadata.success) {
      return NextResponse.json(
        { error: "Choose an image to upload." },
        { status: 400 },
      );
    }
    if (
      !WEBSITE_MEDIA_TYPES.includes(
        file.type as (typeof WEBSITE_MEDIA_TYPES)[number],
      )
    ) {
      return NextResponse.json(
        { error: "Use a JPG, PNG, WebP, or AVIF image." },
        { status: 400 },
      );
    }
    if (file.size <= 0 || file.size > WEBSITE_MEDIA_MAX_BYTES) {
      return NextResponse.json(
        { error: "The image must be 8 MB or smaller." },
        { status: 400 },
      );
    }

    const definition = getWebsitePageDefinition(metadata.data.pageSlug);
    const imageField = definition?.sections
      .flatMap((section) => section.fields)
      .find(
        (field) =>
          field.key === metadata.data.fieldKey && field.kind === "image",
      );
    if (!definition?.editable || !imageField) {
      return NextResponse.json(
        { error: "This image field is not editable." },
        { status: 400 },
      );
    }

    const extension =
      fileExtensions[file.type as (typeof WEBSITE_MEDIA_TYPES)[number]];
    const objectPath = `${metadata.data.pageSlug}/${new Date().getUTCFullYear()}/${randomUUID()}.${extension}`;
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage
      .from("website-media")
      .upload(objectPath, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });
    if (error) throw error;

    const { data } = supabase.storage
      .from("website-media")
      .getPublicUrl(objectPath);

    return NextResponse.json({
      image: {
        url: data.publicUrl,
        fieldKey: metadata.data.fieldKey,
      },
    });
  } catch (error) {
    console.error("Website image upload failed", error);
    return NextResponse.json(
      {
        error:
          "Could not upload this image. Check the Website media bucket setup.",
      },
      { status: 503 },
    );
  }
}
