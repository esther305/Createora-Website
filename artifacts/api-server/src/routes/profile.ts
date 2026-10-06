import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db, userProfilesTable } from "@workspace/db";
import { GetProfileResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/profile", async (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const [profile] = await db
      .insert(userProfilesTable)
      .values({ clerkUserId: userId })
      .onConflictDoUpdate({
        target: userProfilesTable.clerkUserId,
        set: { updatedAt: new Date() },
      })
      .returning();

    res.json(GetProfileResponse.parse(profile));
  } catch (error) {
    req.log.error({ err: error, userId }, "Failed to load workspace profile");
    res.status(500).json({ error: "Unable to load workspace profile" });
  }
});

export default router;