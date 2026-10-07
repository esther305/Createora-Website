import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db, projectsTable } from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";

const router: IRouter = Router();

const validTypes = new Set(["image", "video", "design"]);

const getString = (value: unknown, fallback = "") =>
  typeof value === "string" ? value.trim() : fallback;

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
      .orderBy(desc(projectsTable.updatedAt))
      .limit(100);

    res.json({ projects });
  } catch (error) {
    req.log.error({ error, userId }, "Failed to load projects");
    res.status(500).json({ error: "Unable to load projects" });
  }
});

router.post("/projects", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const name = getString(req.body?.name, "Untitled project").slice(0, 180);
  const type = getString(req.body?.type, "image");
  const width = Number.isFinite(req.body?.width) ? Number(req.body.width) : 1080;
  const height = Number.isFinite(req.body?.height) ? Number(req.body.height) : 1080;
  const duration = Number.isFinite(req.body?.duration) ? Number(req.body.duration) : null;

  if (!validTypes.has(type)) {
    res.status(400).json({ error: "Unsupported project type" });
    return;
  }

  try {
    const [project] = await db
      .insert(projectsTable)
      .values({
        id: crypto.randomUUID(),
        clerkUserId: userId,
        name,
        type,
        width,
        height,
        duration,
        document: { version: 1, elements: [] },
      })
      .returning();

    res.status(201).json({ project });
  } catch (error) {
    req.log.error({ error, userId }, "Failed to create project");
    res.status(500).json({ error: "Unable to create project" });
  }
});

router.get("/projects/:id", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(and(
        eq(projectsTable.id, req.params.id),
        eq(projectsTable.clerkUserId, userId),
      ))
      .limit(1);

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.json({ project });
  } catch (error) {
    req.log.error({ error, userId }, "Failed to load project");
    res.status(500).json({ error: "Unable to load project" });
  }
});

router.patch("/projects/:id", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (typeof req.body?.name === "string") updates.name = req.body.name.trim().slice(0, 180);
  if (typeof req.body?.thumbnail === "string") updates.thumbnail = req.body.thumbnail;
  if (req.body && Object.prototype.hasOwnProperty.call(req.body, "document")) {
    updates.document = req.body.document;
  }

  if (!Object.keys(updates).length) {
    res.status(400).json({ error: "No project changes supplied" });
    return;
  }

  updates.updatedAt = new Date();

  try {
    const [project] = await db
      .update(projectsTable)
      .set(updates)
      .where(and(
        eq(projectsTable.id, req.params.id),
        eq(projectsTable.clerkUserId, userId),
      ))
      .returning();

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.json({ project });
  } catch (error) {
    req.log.error({ error, userId }, "Failed to update project");
    res.status(500).json({ error: "Unable to save project" });
  }
});

router.delete("/projects/:id", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const deleted = await db
      .delete(projectsTable)
      .where(and(
        eq(projectsTable.id, req.params.id),
        eq(projectsTable.clerkUserId, userId),
      ))
      .returning({ id: projectsTable.id });

    if (!deleted.length) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    req.log.error({ error, userId }, "Failed to delete project");
    res.status(500).json({ error: "Unable to delete project" });
  }
});

export default router;
