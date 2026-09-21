import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import {
  PROFILE_IMAGE_MAX_BYTES,
  isLocalProfileImage,
  removeLocalProfileImages,
  saveProfileImage,
} from "@/lib/profile-image";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const sessionUser = await requireUser();

    if (!sessionUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "Choose an image to upload" },
        { status: 400 }
      );
    }

    if (file.size > PROFILE_IMAGE_MAX_BYTES) {
      return NextResponse.json(
        { message: "Image must be 2MB or smaller" },
        { status: 400 }
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const profileImage = await saveProfileImage(sessionUser.id, bytes);

    if (!profileImage) {
      return NextResponse.json(
        { message: "Use a JPG, PNG, WEBP, or GIF image" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: sessionUser.id },
      data: { profileImage },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
      },
    });

    return NextResponse.json({
      message: "Profile photo updated",
      user,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Could not upload photo" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const sessionUser = await requireUser();

    if (!sessionUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const current = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { profileImage: true },
    });

    if (current?.profileImage && isLocalProfileImage(current.profileImage)) {
      await removeLocalProfileImages(sessionUser.id);
    }

    const user = await prisma.user.update({
      where: { id: sessionUser.id },
      data: { profileImage: null },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
      },
    });

    return NextResponse.json({
      message: "Profile photo removed",
      user,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Could not remove photo" },
      { status: 500 }
    );
  }
}
