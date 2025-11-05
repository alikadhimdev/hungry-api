import express from "express";

import userRoutes from "./routes/user_route.js";

const app = express();

// middlewares
app.use(express.json());


// routes
app.use("/api/auth", userRoutes)



export default app;