import express from "express";

import userRoutes from "./routes/user_route.js";
import categoryRoute from "./routes/categoryRoute.js"
import productRoute from "./routes/productRoute.js"

const app = express();
// middlewares
app.use(express.json());


app.use("/uploads", express.static("uploads"))
// routes
app.use("/api/auth", userRoutes)
app.use("/api/category", categoryRoute)
app.use("/api/product", productRoute)



export default app;