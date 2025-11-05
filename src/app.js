import express from "express";

import userRoutes from "./routes/user_route.js";
import categoryRoute from "./routes/categoryRoute.js"

const app = express();
categoryRoute
// middlewares
app.use(express.json());


// routes
app.use("/api/auth", userRoutes)
app.use("/api/category", categoryRoute)



export default app;