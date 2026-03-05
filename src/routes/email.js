import { Router } from "express";
import sendWelcomeEmail from "../controller/email.js";

const router = Router()

router.post("/activate",sendWelcomeEmail )

export default router