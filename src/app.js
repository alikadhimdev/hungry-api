import express from "express";
import path from "path";

import userRoutes from "./routes/user_route.js";
import categoryRoute from "./routes/categoryRoute.js"
import productRoute from "./routes/productRoute.js"
import favoriteRoute from "./routes/favoriteRoute.js"
import { errorHandler } from "./middlewares/errorHandler.js";
import { responseHandler } from "./utils/responseHandler.js";
import toppingRoute from "./routes/toppingRoute.js"
import sideOptionRoute from "./routes/sideOptionRoute.js"
import cartRoute from "./routes/cartRoute.js"
import orderRoute from "./routes/orderRoute.js"

const app = express();
// middlewares
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));

app.use("/uploads", express.static("uploads"))
app.use(responseHandler)
// routes
app.use("/api/auth", userRoutes)
app.use("/api/category", categoryRoute)
app.use("/api/product", productRoute)
app.use("/api/favorite", favoriteRoute)
app.use("/api/toppings", toppingRoute)
app.use("/api/options", sideOptionRoute)
app.use("/api/cart", cartRoute)
app.use("/api/orders", orderRoute)

// Error MiddleWare Handler
app.use(errorHandler);

export default app;