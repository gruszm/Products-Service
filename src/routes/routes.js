import { Router } from "express";
import * as ProductService from "../services/productService.js";

const productRouter = new Router();

productRouter.get("/:id", async (req, res) => {
    const productDb = await ProductService.getProductById(req.params.id);

    if (productDb === null) {
        res.status(404).json({ message: `Product with given ID: ${req.params.id} not found` });
    }
});

export { productRouter };