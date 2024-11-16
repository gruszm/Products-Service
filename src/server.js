import express from "express";
import { publicProductRouter } from "./routes/publicRoutes.js";
import * as MongoConnection from "./config/db.js";

const app = express();

app.use(express.json());
app.use("/api/public/products", publicProductRouter);

MongoConnection.connect(process.env.PRODUCTS_DB_SERVICE_NAME).then(() => {
    app.listen(process.env.PRODUCTS_SERVICE_PORT, () => {
        console.log("Products service is running on port: " + process.env.PRODUCTS_SERVICE_PORT);
    });
});