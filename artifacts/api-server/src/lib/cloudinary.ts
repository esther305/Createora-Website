import { v2 as cloudinary } from "cloudinary";

export const getCloudinary = () => {
  // Read these at request time so the running service uses its current
  // environment instead of relying on values captured during module loading.
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  } else {
    // The SDK also supports CLOUDINARY_URL. Calling config() lets us inspect
    // the SDK's current configuration without ever logging credentials.
    cloudinary.config({ secure: true });
  }

  const config = cloudinary.config();

  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    const missing = [
      !config.cloud_name && "cloud name",
      !config.api_key && "API key",
      !config.api_secret && "API secret",
    ].filter(Boolean);

    throw new Error(
      `Cloudinary is not configured. Missing: ${missing.join(", ")}. Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET (or CLOUDINARY_URL) in the Render environment for createora-api.`,
    );
  }

  return {
    client: cloudinary,
    cloudName: config.cloud_name,
    apiKey: config.api_key,
    apiSecret: config.api_secret,
  };
};
