import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profileRouter from "./profile";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profileRouter);

export default router;
