import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db, assetsTable } from "@workspace/db";
import { and, desc, eq, ilike } from "drizzle-orm";

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

router.post("/assets/upload", async (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const body = (await req.body) as HandleUploadBody;
    const response = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        const expectedPrefix = `users/${userId}/`;
        if (!pathname.startsWith(expectedPrefix)) {
          throw new Error("Invalid asset upload path");
        }

        return {
          allowedContentTypes,
          maximumSizeInBytes: maxUploadBytes,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId }),
        };
      },
      onUploadCompleted: async () => {
        // Database finalization happens through /assets/finalize so local
        // development works without a public callback URL.
      },
    });

    res.json(response);
  } catch (error) {
    req.log.error({ error, userId }, "Asset upload token request failed");
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unable to prepare upload",
    });
  }
});

router.post("/assets/finalize", async (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const body = req.body ?? {};
  const pathname = typeof body.pathname === "string" ? body.pathname : "";
  const url = typeof body.url === "string" ? body.url : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const mimeType = typeof body.contentType === "string" ? body.contentType : "";
  const size = Number.isFinite(body.size) ? Number(body.size) : null;
  const width = Number.isFinite(body.width) ? Number(body.width) : null;
  const height = Number.isFinite(body.height) ? Number(body.height) : null;
  const duration = Number.isFinite(body.duration) ? Number(body.duration) : null;

  if (!pathname || !url || !name || !mimeType) {
    res.status(400).json({ error: "Asset metadata is incomplete" });
    return;
  }

  if (!pathname.startsWith(`users/${userId}/`)) {
    res.status(403).json({ error: "You cannot finalize this asset" });
    return;
  }

  if (!allowedContentTypes.includes(mimeType)) {
    res.status(400).json({ error: "Unsupported media type" });
    return;
  }

  try {
    const asset = {
      id: crypto.randomUUID(),
      clerkUserId: userId,
      name: name.slice(0, 180),
      type: assetTypeFromMime(mimeType),
      mimeType,
      url,
      storageKey: pathname,
      source: "upload",
      width,
      height,
      duration,
      size,
    };

    await db.insert(assetsTable).values(asset);

    res.status(201).json({ asset });
  } catch (error) {
    req.log.error({ error, userId }, "Failed to finalize uploaded asset");
    res.status(500).json({ error: "Unable to save asset" });
  }
});

router.get("/assets", async (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const type = typeof req.query.type === "string" ? req.query.type : "all";
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

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
      .where(and(
        eq(assetsTable.id, req.params.id),
        eq(assetsTable.clerkUserId, userId),
      ))
      .limit(1);

    if (!asset) {
      res.status(404).json({ error: "Asset not found" });
      return;
    }

    const { del } = await import("@vercel/blob");
    await del(asset.url);

    await db
      .delete(assetsTable)
      .where(and(
        eq(assetsTable.id, asset.id),
        eq(assetsTable.clerkUserId, userId),
      ));

    res.status(204).send();
  } catch (error) {
    req.log.error({ error, userId }, "Failed to delete asset");
    res.status(500).json({ error: "Unable to delete asset" });
  }
});

export default router;
