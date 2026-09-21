import { mkdir, readdir, unlink, writeFile } from "fs/promises";
import path from "path";

export const PROFILE_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const PROFILE_IMAGE_PUBLIC_DIR = "/uploads/avatars";

const AVATAR_DIR = path.join(process.cwd(), "public", "uploads", "avatars");

export function isLocalProfileImage(url: string) {
  return url.startsWith(`${PROFILE_IMAGE_PUBLIC_DIR}/`);
}

export function extensionFromImageBytes(bytes: Uint8Array) {
  if (bytes.length < 12) {
    return null;
  }

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpg";
  }

  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "png";
  }

  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return "gif";
  }

  const header = String.fromCharCode(...bytes.slice(0, 4));
  const format = String.fromCharCode(...bytes.slice(8, 12));
  if (header === "RIFF" && format === "WEBP") {
    return "webp";
  }

  return null;
}

export async function saveProfileImage(userId: string, bytes: Uint8Array) {
  const extension = extensionFromImageBytes(bytes);

  if (!extension) {
    return null;
  }

  await mkdir(AVATAR_DIR, { recursive: true });
  await removeLocalProfileImages(userId);

  const filename = `${userId}-${Date.now()}.${extension}`;
  await writeFile(path.join(AVATAR_DIR, filename), Buffer.from(bytes));

  return `${PROFILE_IMAGE_PUBLIC_DIR}/${filename}`;
}

export async function removeLocalProfileImages(userId: string) {
  let files: string[] = [];

  try {
    files = await readdir(AVATAR_DIR);
  } catch {
    return;
  }

  await Promise.all(
    files
      .filter(
        (file) => file.startsWith(`${userId}-`) || file.startsWith(`${userId}.`)
      )
      .map((file) => unlink(path.join(AVATAR_DIR, file)).catch(() => undefined))
  );
}
