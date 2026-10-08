import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  secure: true,
});

export const getCloudinary = () => {
  const config = cloudinary.config();

  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET (or CLOUDINARY_URL).",
    );
  }

  return {
    client: cloudinary,
    cloudName: config.cloud_name,
    apiKey: config.api_key,
    apiSecret: config.api_secret,
  };
};
