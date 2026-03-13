import { NextResponse, type NextRequest } from "next/server";
import { getAuthUser } from "@/lib/server-utils";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
    try {
        const auth = await getAuthUser();
        if (!auth) return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });

        const formData = await request.formData();
        const file     = formData.get("file") as File | null;

        if (!file) return NextResponse.json({ success: false, error: "No file provided." }, { status: 400 });
        if (file.size > 5 * 1024 * 1024) return NextResponse.json({ success: false, error: "File too large. Max 5MB." }, { status: 400 });
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            return NextResponse.json({ success: false, error: "Only JPG, PNG, WebP allowed." }, { status: 400 });
        }

        // Convert file to base64 for Cloudinary
        const bytes  = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString("base64");
        const dataUri = `data:${file.type};base64,${base64}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataUri, {
            folder:         "billflow/avatars",
            public_id:      `user-${auth.sub}`,
            overwrite:      true,
            transformation: [{ width: 200, height: 200, crop: "fill", gravity: "face" }],
        });

        // Save URL to user record
        await prisma.user.update({
            where: { id: auth.sub },
            data:  { avatarUrl: result.secure_url },
        });

        return NextResponse.json({ success: true, data: { url: result.secure_url } });
    } catch (error) {
        console.error("[AVATAR UPLOAD ERROR]", error);
        return NextResponse.json({ success: false, error: "Upload failed." }, { status: 500 });
    }
}