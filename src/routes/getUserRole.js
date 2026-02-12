import { Router } from "express"
import { getUserRole } from "../controller/getUserRole.js"


const router = Router()

router.post("/get-user-role",getUserRole)

export default router