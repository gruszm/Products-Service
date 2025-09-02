import * as express from "express";
import * as ProductService from "../services/productService.js";
import { StatusCodes as HttpStatus } from "http-status-codes";
import multer from "multer";

const secureProductRouter = new express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function checkUserHeader(req, res, next) {
    if (!req.headers["x-user"]) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: "User header is missing." });

        return;
    }
    else {
        next();
    }
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
secureProductRouter.put("/decrease", checkUserHeader, async (req, res) => {
    const userHeader = JSON.parse(req.headers["x-user"]);

    if (!userHeader.hasElevatedRights) {
        res.status(HttpStatus.UNAUTHORIZED).json({ message: "User is not authorized to decrease the amount of a product." });

        return;
    }

    if (req.body.productId === undefined || req.body.amount === undefined) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: "Product ID and amount are required." });

        return;
    }

    if (req.body.productId < 0 || req.body.amount <= 0) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: "Product ID cannot be negative, amount must be positive." });

        return;
    }

    try {
        const updatedProduct = await ProductService.decreaseProductAmount(req.body.productId, req.body.amount);

        if (!updatedProduct) {
            throw new Error("Product's amount could not be decreased.");
        }

        res.status(HttpStatus.OK).send();
    } catch (error) {
        if (error instanceof ProductService.DecrementHigherThanAmountError) {
            res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
        } else {
            console.log(`Error on endpoint: ${req.baseUrl + req.url}\n${error.message}`);

            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }
});

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

        let images = null;

        if (req.files) {
            images = req.files.map(image => ({
                data: image.buffer,
                mimeType: image.mimetype,
                originalName: image.originalname
            }));
        }

        await ProductService.addProduct(productDetails, images);

        res.status(HttpStatus.CREATED).end();
    } catch (error) {
        if (error.name === "ValidationError") {
            res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
        } else {
            console.log(`Error on endpoint: ${req.baseUrl + req.url}\n${error.message}`);

            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
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
            res.status(HttpStatus.NOT_FOUND).json({ message: `Product with given ID: ${productId} not found.` });
        }
        else {
            res.status(HttpStatus.OK).json({ message: `Product with ID: ${productId} has been deleted.` });
        }
    } catch (error) {
        console.log(`Error on endpoint: ${req.baseUrl + req.url}\n${error.message}`);

        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
});

export { secureProductRouter };