import { Router } from "express";
import sendVerificationEmail from "../controller/email.js";

const router = Router()

router.post("/send-verification",sendVerificationEmail() )