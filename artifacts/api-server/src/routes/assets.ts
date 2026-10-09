import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db, assetsTable } from "@workspace/db";
import { and, desc, eq, ilike } from "drizzle-orm";
import { getCloudinary } from "../lib/cloudinary";

const router: IRouter = Router();

const allowedContentTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "audio/mpeg",
  "audio/wav",
  "audio/mp4",
  "audio/webm",
];

const maxUploadBytes = 500 * 1024 * 1024;

const assetTypeFromMime = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "other";
};

const cloudinaryResourceTypeFromMime = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return "image";
  // Cloudinary treats audio as the video resource type.
  if (mimeType.startsWith("video/") || mimeType.startsWith("audio/")) return "video";
  return "raw";
};

router.post("/assets/cloudinary/signature", async (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const mimeType = typeof req.body?.contentType === "string"
    ? req.body.contentType
    : "";

  if (!allowedContentTypes.includes(mimeType)) {
    res.status(400).json({
      error: `Unsupported media type: ${mimeType || "unknown"}`,
    });
    return;
  }

  try {
    const { client: cloudinary, cloudName, apiKey, apiSecret } = getCloudinary();
    const timestamp = Math.floor(Date.now() / 1000);
    const publicId = `createora/${userId}/${crypto.randomUUID()}`;

    const signature = cloudinary.utils.api_sign_request(
      {
        public_id: publicId,
        timestamp,
      },
      apiSecret,
    );

    res.json({
      cloudName,
      apiKey,
      publicId,
      timestamp,
      signature,
      resourceType: cloudinaryResourceTypeFromMime(mimeType),
    });
  } catch (error) {
    req.log.error({ error, userId }, "Failed to create Cloudinary upload signature");
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Unable to prepare Cloudinary upload",
    });
  }
});

router.post("/assets/cloudinary/finalize", async (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const body = req.body ?? {};
  const publicId = typeof body.publicId === "string" ? body.publicId : "";
  const responseSignature =
    typeof body.signature === "string" ? body.signature : "";
  const version = Number(body.version);
  const secureUrl = typeof body.secureUrl === "string" ? body.secureUrl : "";
  const resourceType =
    typeof body.resourceType === "string" ? body.resourceType : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const mimeType =
    typeof body.mimeType === "string" ? body.mimeType : "";

  if (
    !publicId ||
    !responseSignature ||
    !Number.isFinite(version) ||
    !secureUrl ||
    !resourceType ||
    !name ||
    !mimeType
  ) {
    res.status(400).json({ error: "Cloudinary asset metadata is incomplete" });
    return;
  }

  if (!publicId.startsWith(`createora/${userId}/`)) {
    res.status(403).json({ error: "You cannot finalize this asset" });
    return;
  }

  if (!allowedContentTypes.includes(mimeType)) {
    res.status(400).json({ error: "Unsupported media type" });
    return;
  }

  if (!["image", "video", "raw"].includes(resourceType)) {
    res.status(400).json({ error: "Unsupported Cloudinary resource type" });
    return;
  }

  try {
    const { client: cloudinary, cloudName, apiKey, apiSecret } = getCloudinary();

    const expectedPrefix = `https://res.cloudinary.com/${cloudName}/`;
    if (!secureUrl.startsWith(expectedPrefix)) {
      res.status(400).json({ error: "Invalid Cloudinary asset URL" });
      return;
    }

    const verified = cloudinary.utils.verify_api_response_signature(
      { public_id: publicId, version },
      responseSignature,
      apiSecret,
    );

    if (!verified) {
      res.status(400).json({ error: "Cloudinary asset verification failed" });
      return;
    }

    if (resourceType === "image" && !mimeType.startsWith("image/")) {
      res.status(400).json({ error: "Asset type does not match resource type" });
      return;
    }

    if (resourceType === "video" &&
      !mimeType.startsWith("video/") &&
      !mimeType.startsWith("audio/")) {
      res.status(400).json({ error: "Asset type does not match resource type" });
      return;
    }

    const assetType = assetTypeFromMime(mimeType);
    const width = Number.isFinite(body.width) ? Number(body.width) : null;
    const height = Number.isFinite(body.height) ? Number(body.height) : null;
    const duration = Number.isFinite(body.duration) ? Number(body.duration) : null;
    const size = Number.isFinite(body.bytes) ? Number(body.bytes) : null;

    const thumbnailUrl =
      assetType === "image"
        ? secureUrl
        : assetType === "video"
          ? cloudinary.url(publicId, {
              secure: true,
              resource_type: "video",
              format: "jpg",
              transformation: [
                { width: 640, height: 360, crop: "limit" },
              ],
            })
          : null;

    const asset = {
      id: crypto.randomUUID(),
      clerkUserId: userId,
      name: name.slice(0, 180),
      type: assetType,
      mimeType,
      url: secureUrl,
      storageKey: publicId,
      source: "upload",
      thumbnailUrl,
      width,
      height,
      duration,
      size,
    };

    await db.insert(assetsTable).values(asset);

    req.log.info(
      {
        userId,
        assetId: asset.id,
        publicId,
        resourceType,
      },
      "Cloudinary media upload finalized",
    );

    res.status(201).json({
      asset,
      cloudName,
      apiKey,
    });
  } catch (error) {
    req.log.error({ error, userId }, "Failed to finalize Cloudinary asset");
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Unable to save Cloudinary asset",
    });
  }
});

router.get("/assets", async (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const type = typeof req.query.type === "string" ? req.query.type : "all";
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";

  const filters = [eq(assetsTable.clerkUserId, userId)];
  if (type !== "all") filters.push(eq(assetsTable.type, type));
  if (search) filters.push(ilike(assetsTable.name, `%${search}%`));

  try {
    const assets = await db
      .select()
      .from(assetsTable)
      .where(and(...filters))
      .orderBy(desc(assetsTable.createdAt))
      .limit(200);

    res.json({ assets });
  } catch (error) {
    req.log.error({ error, userId }, "Failed to load assets");
    res.status(500).json({ error: "Unable to load media library" });
  }
});

router.delete("/assets/:id", async (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const [asset] = await db
      .select()
      .from(assetsTable)
      .where(
        and(
          eq(assetsTable.id, req.params.id),
          eq(assetsTable.clerkUserId, userId),
        ),
      )
      .limit(1);

    if (!asset) {
      res.status(404).json({ error: "Asset not found" });
      return;
    }

    if (asset.storageKey && asset.storageKey.startsWith(`createora/${userId}/`)) {
      const { client: cloudinary, apiKey } = getCloudinary();
      const resourceType =
        asset.type === "image" ? "image" : "video";

      await cloudinary.uploader.destroy(asset.storageKey, {
        resource_type: resourceType,
        type: "upload",
        invalidate: true,
        api_key: apiKey,
      });
    }

    await db
      .delete(assetsTable)
      .where(
        and(
          eq(assetsTable.id, asset.id),
          eq(assetsTable.clerkUserId, userId),
        ),
      );

    res.status(204).send();
  } catch (error) {
    req.log.error({ error, userId }, "Failed to delete asset");
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Unable to delete asset",
    });
  }
});

export default router;
