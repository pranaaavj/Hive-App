import { Router } from "express";
import authRouter from "../userRoutes/authRoute"
import postRouter from "../userRoutes/postRoute"
const router = Router()

router.use("/auth", authRouter)
router.use("/post", postRouter)

export default router
