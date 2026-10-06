import { db, aiGenerationsTable } from "@workspace/db";
import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { InferenceClient } from "@huggingface/inference";

const router: IRouter = Router();

const aspectRatios = new Set(["1:1", "16:9", "9:16", "4:3"]);

const getAspectDimensions = (aspectRatio: string) => {
  switch (aspectRatio) {
    case "16:9":
      return { width: 1024, height: 576 };
    case "9:16":
      return { width: 576, height: 1024 };
    case "4:3":
      return { width: 1024, height: 768 };
    default:
      return { width: 1024, height: 1024 };
  }
};

const generateWithGemini = async (
  prompt: string,
  aspectRatio: string,
  apiKey: string,
  model: string,
) => {
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
  } catch {
    throw new Error(`Gemini returned an invalid response (HTTP ${response.status})`);
  }

  if (!response.ok) {
    const providerMessage =
      typeof payload?.error?.message === "string"
        ? payload.error.message
        : "Gemini rejected the request.";

    throw new Error(`Gemini: ${providerMessage}`);
  }

  const parts = payload?.candidates?.[0]?.content?.parts ?? [];

  const imagePart = parts.find(
    (part: any) => typeof part?.inlineData?.data === "string",
  );

  if (!imagePart?.inlineData?.data) {
    throw new Error("Gemini returned no image data.");
  }

  const mimeType = imagePart.inlineData.mimeType || "image/png";

  return {
    image: `data:${mimeType};base64,${imagePart.inlineData.data}`,
    provider: "gemini",
    model,
  };
};

const generateWithHuggingFace = async (
  prompt: string,
  aspectRatio: string,
  token: string,
  model: string,
) => {
  const client = new InferenceClient(token);
  const { width, height } = getAspectDimensions(aspectRatio);

  const enhancedPrompt = `
Create a polished, production-ready image for a modern creative design application.

User brief:
${prompt}

Requirements:
- High visual quality
- Professional composition
- Strong lighting and detail
- Clean commercial presentation
- Suitable for use in a design editor
- Aspect ratio: ${aspectRatio}
`.trim();

  const imageBlob = await client.textToImage({
    model,
    inputs: enhancedPrompt,
    provider: "auto",
    width,
    height,
  });

  const buffer = Buffer.from(await imageBlob.arrayBuffer());

  const mimeType = imageBlob.type || "image/png";

  return {
    image: `data:${mimeType};base64,${buffer.toString("base64")}`,
    provider: "huggingface",
    model,
  };
};

router.post("/ai/images/generate", async (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const prompt =
    typeof req.body?.prompt === "string"
      ? req.body.prompt.trim()
      : "";

  const aspectRatio =
    typeof req.body?.aspectRatio === "string"
      ? req.body.aspectRatio
      : "1:1";

  if (!prompt) {
    res.status(400).json({
      error: "A prompt is required",
    });
    return;
  }

  if (prompt.length > 2000) {
    res.status(400).json({
      error: "Prompt must be 2000 characters or less",
    });
    return;
  }

  if (!aspectRatios.has(aspectRatio)) {
    res.status(400).json({
      error: "Unsupported aspect ratio",
    });
    return;
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const hfToken = process.env.HF_TOKEN;

  const geminiModel =
    process.env.CREATEORA_IMAGE_MODEL ||
    "gemini-3.1-flash-image";

  const hfModel =
    process.env.HF_IMAGE_MODEL ||
    "black-forest-labs/FLUX.1-schnell";

  const errors: string[] = [];

  // --------------------------------------------------
  // Provider 1: Gemini
  // --------------------------------------------------

  if (geminiKey) {
    try {
      const result = await generateWithGemini(
        prompt,
        aspectRatio,
        geminiKey,
        geminiModel,
      );

      req.log.info(
        {
          userId,
          provider: result.provider,
          model: result.model,
        },
        "AI image generated successfully",
      );

      await db.insert(aiGenerationsTable).values({
        id: crypto.randomUUID(),
        clerkUserId: userId,
        type: "image",
        provider: result.provider,
        model: result.model,
        prompt,
        aspectRatio,
        status: "completed",
        metadata: {
          temporary: true,
        },
      });

      res.json({
        ...result,
        aspectRatio,
      });

      return;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown Gemini error";

      errors.push(message);

      req.log.warn(
        {
          userId,
          error: message,
        },
        "Gemini image generation failed; trying Hugging Face",
      );
    }
  } else {
    errors.push("Gemini is not configured.");
  }

  // --------------------------------------------------
  // Provider 2: Hugging Face / FLUX
  // --------------------------------------------------

  if (hfToken) {
    try {
      const result = await generateWithHuggingFace(
        prompt,
        aspectRatio,
        hfToken,
        hfModel,
      );

      req.log.info(
        {
          userId,
          provider: result.provider,
          model: result.model,
        },
        "AI image generated successfully with Hugging Face",
      );

      await db.insert(aiGenerationsTable).values({
        id: crypto.randomUUID(),
        clerkUserId: userId,
        type: "image",
        provider: result.provider,
        model: result.model,
        prompt,
        aspectRatio,
        status: "completed",
        metadata: {
          temporary: true,
        },
      });

      res.json({
        ...result,
        aspectRatio,
      });

      return;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown Hugging Face error";

      errors.push(message);

      req.log.error(
        {
          userId,
          error: message,
        },
        "Hugging Face image generation failed",
      );
    }
  } else {
    errors.push("Hugging Face is not configured.");
  }

  // --------------------------------------------------
  // Both providers failed
  // --------------------------------------------------

  req.log.error(
    {
      userId,
      errors,
    },
    "All AI image providers failed",
  );

  res.status(502).json({
    error:
      "All AI image providers are currently unavailable. Please try again shortly.",
    providers: {
      gemini: Boolean(geminiKey),
      huggingface: Boolean(hfToken),
    },
    details:
      process.env.NODE_ENV === "production"
        ? undefined
        : errors,
  });
});

router.get("/ai/generations", async (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const generations = await db
      .select()
      .from(aiGenerationsTable)
      .where(eq(aiGenerationsTable.clerkUserId, userId))
      .orderBy(desc(aiGenerationsTable.createdAt))
      .limit(50);

    res.json({
      generations,
    });
  } catch (error) {
    req.log.error(
      { error },
      "Failed to load AI generations",
    );

    res.status(500).json({
      error: "Unable to load AI generation history",
    });
  }
});

export default router;