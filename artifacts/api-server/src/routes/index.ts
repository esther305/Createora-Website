import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profileRouter from "./profile";
import aiRouter from "./ai";
import assetsRouter from "./assets";
import projectsRouter from "./projects";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profileRouter);
router.use(aiRouter);
router.use(assetsRouter);
router.use(projectsRouter);

export default router;
