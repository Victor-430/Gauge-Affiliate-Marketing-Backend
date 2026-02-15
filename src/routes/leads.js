import { Router } from "express";
import { leads } from "../controller/leads.js";

const router = Router()

router.post("/leads/submit", leads)

export default router