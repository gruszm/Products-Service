import Product from '../models/productModel.js';
import Image from '../models/imageModel.js';
import mongoose from 'mongoose';

async function getProductById(id) {
    return await Product.findOne({ id: id }).select("-__v -_id");
}

async function addProduct(productDetails, imagesDetails) {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const savedProduct = await new Product(productDetails).save({ session });

        if (imagesDetails) {
            imagesDetails.forEach(image => {
                image.productId = savedProduct._id;
            });

            const savedImages = await Image.insertMany(imagesDetails, { session });

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
    return await Product.find().select("-__v -_id");
}

async function deleteProductById(id) {
    const deleteResult = await Product.deleteOne({ id: id });

    return deleteResult.deletedCount;
}

export { getProductById, addProduct, getAllProducts, deleteProductById };