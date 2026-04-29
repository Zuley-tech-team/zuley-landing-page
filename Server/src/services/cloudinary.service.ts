import { Readable } from "stream";
import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary.config";
import { env } from "../config/env.config";

type UploadOptions = {
  folder?: string;
  publicId?: string;
};

const DATA_URL_PATTERN = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/;

const parseDataUrlImage = (dataUrl: string) => {
  const match = dataUrl.match(DATA_URL_PATTERN);
  if (!match) {
    return null;
  }

  const [, mimeType, base64Data] = match;

  return {
    mimeType,
    buffer: Buffer.from(base64Data, "base64"),
  };
};

export async function uploadImageBuffer(buffer: Buffer, options: UploadOptions = {}) {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured");
  }

  const uploadFolder = options.folder || env.CLOUDINARY_FOLDER;

  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: uploadFolder,
        public_id: options.publicId,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          const message =
            typeof error === "object" && error !== null && "message" in error && typeof (error as { message?: unknown }).message === "string"
              ? (error as { message: string }).message
              : error instanceof Error
                ? error.message
                : "Cloudinary upload failed";
          reject(new Error(message));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    Readable.from([buffer]).pipe(uploadStream);
  });
}

export async function uploadDataUrlImage(dataUrl: string, options: UploadOptions = {}) {
  const parsed = parseDataUrlImage(dataUrl);

  if (!parsed) {
    throw new Error("Invalid image data URL");
  }

  return uploadImageBuffer(parsed.buffer, {
    ...options,
  });
}

export const isDataUrlImage = (value: string) => DATA_URL_PATTERN.test(value);