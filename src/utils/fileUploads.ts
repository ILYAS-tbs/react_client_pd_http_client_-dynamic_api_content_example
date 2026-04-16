export const SCHOOL_FILE_ACCEPT = "application/pdf,image/jpeg,image/png,image/webp";

const SCHOOL_FILE_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "webp"];
const SCHOOL_FILE_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export function getFileNameFromPath(path?: string | null): string | null {
  if (!path) return null;
  const cleanPath = path.split("?")[0]?.split("#")[0] ?? "";
  const fileName = cleanPath.split("/").pop() ?? "";
  return fileName ? decodeURIComponent(fileName) : null;
}

export function getFileExtension(pathOrName?: string | null): string | null {
  const fileName = getFileNameFromPath(pathOrName) ?? pathOrName ?? "";
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  return extension || null;
}

export function isPdfFile(pathOrName?: string | null): boolean {
  return getFileExtension(pathOrName) === "pdf";
}

export function isImageFile(pathOrName?: string | null): boolean {
  const extension = getFileExtension(pathOrName);
  return extension !== null && ["jpg", "jpeg", "png", "webp"].includes(extension);
}

export function isAllowedSchoolUpload(file: File | null): boolean {
  if (!file) return false;

  const normalizedType = file.type.toLowerCase();
  if (SCHOOL_FILE_MIME_TYPES.includes(normalizedType)) {
    return true;
  }

  const extension = getFileExtension(file.name);
  return extension !== null && SCHOOL_FILE_EXTENSIONS.includes(extension);
}