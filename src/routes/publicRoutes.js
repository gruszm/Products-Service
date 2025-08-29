import { Router } from "express";
import * as ProductService from "../services/productService.js";
import * as ImageService from "../services/imageService.js";

const publicProductRouter = new Router();

publicProductRouter.get("/:id", async (req, res) => {
    try {
        const productDb = await ProductService.getProductById(req.params.id);

        if (productDb === null) {
            res.status(404).json({ message: `Product with given ID: ${req.params.id} not found.` });

            return;
        }

        res.status(200).json(productDb);
    }
    catch (error) {
        console.error(`Error on endpoint: ${req.baseUrl + req.url}\n${error.message}`);

        res.status(500).json({ message: "Internal server error." });
    }
});

publicProductRouter.get("/price/:id", async (req, res) => {
    try {
        const productDbPrice = await ProductService.getProductPriceByProductId(req.params.id);

        if (productDbPrice === null) {
            res.status(404).json({ message: `Product with given ID: ${req.params.id} not found.` });

            return;
        }

        res.status(200).json(productDbPrice);
    }
    catch (error) {
        console.error(`Error on endpoint: ${req.baseUrl + req.url}\n${error.message}`);

        res.status(500).json({ message: "Internal server error." });
    }
});

publicProductRouter.get("/", async (req, res) => {
    try {
        const allProducts = await ProductService.getAllProducts();

        res.status(200).json(allProducts);
    }
    catch (error) {
        console.error(`Error on endpoint: ${req.baseUrl + req.url}\n${error.message}`);

        res.status(500).json({ message: "Internal server error." });
    }
});

publicProductRouter.get("/images/:id", async (req, res) => {
    try {
        const imageDb = await ImageService.getImageById(req.params.id);

        if (imageDb === null) {
            res.status(404).json({ message: `Image with given ID: ${req.params.id} not found.` });

            return;
        }

        res.status(200).contentType(imageDb.mimeType).send(imageDb.data);
    }
    catch (error) {
        console.error(`Error on endpoint: ${req.baseUrl + req.url}\n${error.message}`);

        res.status(500).json({ message: "Internal server error." });
    }
});

export { publicProductRouter };