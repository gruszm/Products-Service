import { Router } from "express";
import * as ProductService from "../services/productService.js";

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

publicProductRouter.post("/", async (req, res) => {
    console.log("Received request body:", req.body);

    try {
        const productDetails = {
            name: req.body.name,
            price: req.body.price,
            amount: req.body.amount,
            categoryId: req.body.categoryId
        };

        const productDb = await ProductService.addProduct(productDetails);

        res.status(201).json(productDb);
    } catch (error) {
        if (error.name === "ValidationError") {
            res.status(400).json({ message: error.message });
        } else {
            console.error(`Error on endpoint: ${req.baseUrl + req.url}\n${error.message}`);

            res.status(500).json({ message: "Internal server error." });
        }
    }
});

publicProductRouter.delete("/:id", async (req, res) => {
    try {
        const productId = req.params.id;
        const deletedCount = await ProductService.deleteById(productId);

        if (deletedCount === 0) {
            res.status(404).json({ message: `Product with given ID: ${productId} not found.` });
        }
        else {
            res.status(200).json({ message: `Product with ID: ${productId} has been deleted.` });
        }
    } catch (error) {
        console.error(`Error on endpoint: ${req.baseUrl + req.url}\n${error.message}`);

        res.status(500).json({ message: "Internal server error." });
    }
});

export { publicProductRouter };