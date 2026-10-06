import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";

const router: IRouter = Router();

router.post("/ai/images/generate", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
  const aspectRatio = typeof req.body?.aspectRatio === "string" ? req.body.aspectRatio : "1:1";

  if (!prompt || prompt.length > 2000) {
    res.status(400).json({ error: "Prompt must be between 1 and 2000 characters" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "AI image generation is not configured. Add GEMINI_API_KEY to the API server environment." });
    return;
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" +
        (process.env.CREATEORA_IMAGE_MODEL || "gemini-3.1-flash-image") +
        ":generateContent?key=" + encodeURIComponent(apiKey),
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          config: {
            responseModalities: ["IMAGE"],
            responseFormat: { image: { aspectRatio } },
          },
        }),
      },
    );

    const payload = await response.json() as {
      error?: { message?: string };
      candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> } }>;
    };

    if (!response.ok) {
      req.log.error({ status: response.status, message: payload.error?.message }, "Gemini image generation failed");
      res.status(502).json({ error: payload.error?.message || "AI image generation failed" });
      return;
    }

    const part = payload.candidates?.[0]?.content?.parts?.find((item) => item.inlineData?.data);
    if (!part?.inlineData?.data) {
      res.status(502).json({ error: "The AI provider returned no image" });
      return;
    }

    res.json({
      image: "data:" + (part.inlineData.mimeType || "image/png") + ";base64," + part.inlineData.data,
      model: process.env.CREATEORA_IMAGE_MODEL || "gemini-3.1-flash-image",
    });
  } catch (error) {
    req.log.error({ err: error, userId }, "AI image generation request failed");
    res.status(502).json({ error: "Unable to reach the AI image provider" });
  }
});

export default router;
