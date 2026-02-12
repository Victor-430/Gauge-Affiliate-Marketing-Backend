import { Router } from "express"
import { createAdmin } from "../controller/createAdmin.js"


const router = Router()

router.post("/auth/create-admin",createAdmin)

export default router