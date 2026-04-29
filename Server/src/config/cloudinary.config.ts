import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.config";

const isConfigured =
  Boolean(env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(env.CLOUDINARY_API_KEY) &&
  Boolean(env.CLOUDINARY_API_SECRET);

if (isConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME?.trim().toLowerCase(),
    api_key: env.CLOUDINARY_API_KEY?.trim(),
    api_secret: env.CLOUDINARY_API_SECRET?.trim(),
  });
}

export const isCloudinaryConfigured = () => isConfigured;
export { cloudinary };