import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { del, put } from "@vercel/blob";

function useBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function customAvatarDir() {
  return path.join(process.cwd(), "public/avatars/custom");
}

function localAvatarPath(characterId: string, ext: string) {
  return path.join(customAvatarDir(), `${characterId}.${ext}`);
}

function localAvatarUrl(characterId: string, ext: string) {
  return `/avatars/custom/${characterId}.${ext}`;
}

export async function removeStoredAvatar(characterId: string, existingUrl?: string | null) {
  if (existingUrl && useBlobStorage() && existingUrl.includes("blob.vercel-storage.com")) {
    try {
      await del(existingUrl);
    } catch {
      // blob may already be gone
    }
    return;
  }

  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    try {
      await unlink(localAvatarPath(characterId, ext));
    } catch {
      // file may not exist
    }
  }
}

export async function storeAvatarImage(
  characterId: string,
  ext: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  if (useBlobStorage()) {
    const pathname = `avatars/${characterId}.${ext}`;
    const blob = await put(pathname, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  await mkdir(customAvatarDir(), { recursive: true });
  await writeFile(localAvatarPath(characterId, ext), buffer);
  return localAvatarUrl(characterId, ext);
}
