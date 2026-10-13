import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { adminRouter } from "./admin.routes.js";
import { clubRouter } from "./club.routes.js";
import { publicRouter } from "./public.routes.js";
import { studentRouter } from "./student.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/club", clubRouter);
apiRouter.use("/student", studentRouter);
apiRouter.use("/", publicRouter);

apiRouter.get("/", (_request, response) => {
  response.status(200).json({ name: "CampusConnect API", version: "1" });
});