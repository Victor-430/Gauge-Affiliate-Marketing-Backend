import { Router } from "express"
import { getUserRole } from "../controller/getUserRole.js"


const router = Router()

router.post("/get-role",getUserRole)

export default router