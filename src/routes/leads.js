import { Router } from "express";
import { leads } from "../controller/leads.js";

const router = Router()

router.post("/submit", leads)

export default router