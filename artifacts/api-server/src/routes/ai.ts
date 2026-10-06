import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";

const router: IRouter = Router();

const aspectRatios = new Set(["1:1", "16:9", "9:16", "4:3"]);

router.post("/ai/images/generate", async (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
  const aspectRatio = typeof req.body?.aspectRatio === "string" ? req.body.aspectRatio : "1:1";

  if (!prompt) {
    res.status(400).json({ error: "A prompt is required" });
    return;
  }

  if (prompt.length > 2000) {
    res.status(400).json({ error: "Prompt must be 2000 characters or less" });
    return;
  }

  if (!aspectRatios.has(aspectRatio)) {
    res.status(400).json({ error: "Unsupported aspect ratio" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "AI image generation is not configured on the server" });
    return;
  }

  const model = process.env.CREATEORA_IMAGE_MODEL || "gemini-3.1-flash-image";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Create a polished production-ready image for a creative design editor. Aspect ratio: ${aspectRatio}. User brief: ${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
            imageConfig: { aspectRatio },
          },
        }),
      },
    );

    const raw = await response.text();
    let payload: any = {};

    try {
      payload = raw ? JSON.parse(raw) : {};
    } catch (parseError) {
      req.log.error(
        { status: response.status, raw, err: parseError },
        "Gemini returned a non-JSON response",
      );
      res.status(502).json({
        error: `Gemini returned an invalid response (HTTP ${response.status})`,
      });
      return;
    }

    if (!response.ok) {
      const providerMessage =
        typeof payload?.error?.message === "string"
          ? payload.error.message
          : "The AI provider rejected the request.";

      req.log.error(
        { status: response.status, payload },
        "Gemini image generation failed",
      );

      res.status(502).json({
        error: `Gemini: ${providerMessage}`,
      });
      return;
    }

    const parts = payload?.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find(
      (part: any) => typeof part?.inlineData?.data === "string",
    );

    if (!imagePart?.inlineData?.data) {
      req.log.error({ payload }, "Gemini returned no image data");
      res.status(502).json({ error: "The AI returned no image. Try a different prompt." });
      return;
    }

    const mimeType = imagePart.inlineData.mimeType || "image/png";

    res.json({
      image: `data:${mimeType};base64,${imagePart.inlineData.data}`,
      model,
      aspectRatio,
    });
  } catch (error) {
    req.log.error({ err: error, userId }, "AI image generation request failed");
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unable to generate the image right now",
    });
  }
});

export default router;
