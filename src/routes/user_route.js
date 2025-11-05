import { Router } from "express";
import { login, register } from "../controllers/user.js";

const route = Router();

route.get("/", login)
route.post("/", register)

export default route;