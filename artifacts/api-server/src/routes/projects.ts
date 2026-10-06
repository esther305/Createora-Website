import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { desc, eq, and } from "drizzle-orm";
import { db, projectsTable } from "@workspace/db";

const router: IRouter = Router();

const allowedTypes = new Set(["image", "video", "design", "ai-generation"]);

router.get("/projects", async (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.clerkUserId, userId))
      .orderBy(desc(projectsTable.updatedAt));

    res.json({ projects });
  } catch (error) {
    req.log.error({ err: error, userId }, "Failed to load projects");
    res.status(500).json({ error: "Unable to load projects" });
  }
});

router.post("/projects", async (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const type = typeof req.body?.type === "string" ? req.body.type : "image";
  const width = Number.isInteger(req.body?.width) ? req.body.width : 1080;
  const height = Number.isInteger(req.body?.height) ? req.body.height : 1080;
  const duration = Number.isInteger(req.body?.duration) ? req.body.duration : null;

  if (!name || name.length > 120) {
    res.status(400).json({ error: "Project name must be between 1 and 120 characters" });
    return;
  }

  if (!allowedTypes.has(type)) {
    res.status(400).json({ error: "Invalid project type" });
    return;
  }

  if (width < 1 || width > 10000 || height < 1 || height > 10000) {
    res.status(400).json({ error: "Invalid project dimensions" });
    return;
  }

  try {
    const [project] = await db
      .insert(projectsTable)
      .values({
        clerkUserId: userId,
        name,
        type,
        width,
        height,
        duration,
      })
      .returning();

    res.status(201).json({ project });
  } catch (error) {
    req.log.error({ err: error, userId }, "Failed to create project");
    res.status(500).json({ error: "Unable to create project" });
  }
});

router.delete("/projects/:id", async (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const [deleted] = await db
      .delete(projectsTable)
      .where(and(eq(projectsTable.id, req.params.id), eq(projectsTable.clerkUserId, userId)))
      .returning({ id: projectsTable.id });

    if (!deleted) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    req.log.error({ err: error, userId }, "Failed to delete project");
    res.status(500).json({ error: "Unable to delete project" });
  }
});

export default router;
