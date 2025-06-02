import { Router } from "express";
import * as ProductService from "../services/productService.js";
import { StatusCodes as HttpStatus } from "http-status-codes";
import multer from "multer";

const secureProductRouter = new Router();
const upload = multer({ storage: multer.memoryStorage() });

function checkUserHeader(req, res, next) {
    if (!req.headers["x-user"]) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: "User header is not present." });

        return;
    }
    else {
        next();
    }
}

secureProductRouter.post("/", checkUserHeader, upload.array("images"), async (req, res) => {
    const userHeader = JSON.parse(req.headers["x-user"]);

    if (!userHeader.hasElevatedRights) {
        res.status(HttpStatus.UNAUTHORIZED).json({ message: "User is not authorized to add a new product." });

        return;
    }

    try {
        const productDetails = {
            name: req.body.name,
            price: req.body.price,
            amount: req.body.amount,
            categoryId: req.body.categoryId
        };

        const images = req.files.map(image => ({
            data: image.buffer,
            mimeType: image.mimetype,
            originalName: image.originalname
        }));

        await ProductService.addProduct(productDetails, images);

        res.status(201).end();
    } catch (error) {
        if (error.name === "ValidationError") {
            res.status(400).json({ message: error.message });
        } else {
            console.error(`Error on endpoint: ${req.baseUrl + req.url}\n${error.message}`);

            res.status(500).json({ message: "Internal server error." });
        }
    }
});

secureProductRouter.delete("/:id", checkUserHeader, async (req, res) => {
    const userHeader = JSON.parse(req.headers["x-user"]);

    if (!userHeader.hasElevatedRights) {
        res.status(HttpStatus.UNAUTHORIZED).json({ message: "User is not authorized to delete a product." });

        return;
    }

    try {
        const productId = req.params.id;
        const deletedCount = await ProductService.deleteProductById(productId);

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

export { secureProductRouter };