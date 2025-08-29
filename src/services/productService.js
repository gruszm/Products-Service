import Product from '../models/productModel.js';
import Image from '../models/imageModel.js';
import mongoose from 'mongoose';

export class DecrementHigherThanAmountError extends Error {
    constructor(message) {
        super(message);

        this.name = "DecrementHigherThanAmountError";
    }
}

async function decreaseProductAmount(id, decrement) {

    // Retrieve the product
    const product = await Product.findOne({ id: id }).select("-__v");

    if (!product) {
        return null;
    }

    if (decrement > product.amount) {
        throw new DecrementHigherThanAmountError(`Decrement is higher than the amount in stock (decrement=${decrement}, amount=${product.amount})`);
    }

    // Decrease the amount of product in stock
    product.amount -= decrement;

    // Save the updated product
    const updatedProduct = await product.save();

    return updatedProduct;
}

async function getProductById(id) {

    // Retrieve the product
    const product = await Product.findOne({ id: id }).select("-__v");

    if (!product) {
        return null;
    }

    // Convert Mongoose document to plain JS object to ensure getters are applied
    const productObj = product.toObject();

    // Retrieve image IDs asssigned to this product
    const images = await Image.find({ productId: productObj._id }).select("-__v -data -mimeType");

    // Extract image IDs and assign them to the product object
    if (images && images.length > 0) {
        productObj.imageIds = images.map(i => i.id);
    }

    // Delete _id and return modified product
    delete productObj._id;

    return productObj;
}

async function getProductPriceByProductId(id) {

    // Retrieve the product
    const product = await Product.findOne({ id: id }).select("price");

    if (!product) {
        return null;
    }

    return product.toObject().price;
}

async function addProduct(productDetails, imagesDetails) {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const savedProduct = await new Product(productDetails).save({ session });

        if (imagesDetails) {

            const savedImages = await Promise.all(
                imagesDetails.map(img => {
                    img.productId = savedProduct._id;

                    return new Image(img).save({ session });
                })
            );

            await Product.updateOne(
                { _id: savedProduct._id },
                { $set: { imageIds: savedImages.map(i => i._id) } },
                { session }
            );
        }

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();

        throw error;
    } finally {
        await session.endSession();
    }
}

async function getAllProducts() {

    // Retrieve the products
    const products = await Product.find().select("-__v");

    if (!products || products.length === 0) {
        return null;
    }

    // Retrieve images asssigned to each product
    for (let i = 0; i < products.length; i++) {

        // Convert Mongoose document to plain JS object to ensure getters are applied
        const productObj = products[i].toObject();

        const images = await Image.find({ productId: products[i]._id }).select("-__v -data -mimeType");

        // Extract image IDs and assign them to the product object
        if (images && images.length > 0) {
            productObj.imageIds = images.map(i => i.id);
        }

        // Delete _id for each product
        delete productObj._id;

        // Replace original document with plain object
        products[i] = productObj;
    }

    return products;
}


async function deleteProductById(id) {
    const deleteResult = await Product.deleteOne({ id: id });

    return deleteResult.deletedCount;
}

export { getProductById, addProduct, getAllProducts, deleteProductById, getProductPriceByProductId, decreaseProductAmount };