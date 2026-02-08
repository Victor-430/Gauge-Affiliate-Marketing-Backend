import { Router } from "express";
import sendWelcomeEmail from "../controller/email.js";

const router = Router()

router.post("/activate-associate",sendWelcomeEmail )

export default router