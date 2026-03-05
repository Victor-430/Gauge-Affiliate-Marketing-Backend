import { Router } from "express"
import { createAdmin } from "../controller/createAdmin.js"


const router = Router()

router.post("/create",createAdmin)

export default router