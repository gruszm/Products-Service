import Product from '../models/productModel.js';
import Image from '../models/imageModel.js';
import mongoose from 'mongoose';

async function getProductById(id) {

    // Retrieve the product
    const product = await Product.findOne({ id: id }).select("-__v").lean();

    if (!product) {
        return null;
    }

    // Retrieve images asssigned to this product
    const images = await Image.find({ productId: product._id }).select("-__v");

    // Extract image IDs and assign them to the product object
    if (images) {
        product.imageIds = images.map(i => i.id);
    }

    // Delete _id and return modified product
    delete product._id;

    return product;
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
    const products = await Product.find().select("-__v").lean();

    if (!products || products.length === 0) {
        return null;
    }

    // Retrieve images asssigned to each product
    for (let i = 0; i < products.length; i++) {
        const images = await Image.find({ productId: products[i]._id }).select("-__v");

        // Extract image IDs and assign them to the product object
        if (images && images.length > 0) {
            products[i].imageIds = images.map(i => i.id);
        }
    }

    // Delete _id for each product and return modified array
    products.forEach(p => delete p._id);

    return products;
}

async function deleteProductById(id) {
    const deleteResult = await Product.deleteOne({ id: id });

    return deleteResult.deletedCount;
}

export { getProductById, addProduct, getAllProducts, deleteProductById };