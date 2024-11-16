import { Product } from '../models/productModel.js';

async function getProductById(id) {
    return await Product.findOne({ id: id });
}

async function addProduct(productDetails) {
    const productToSave = new Product(productDetails);

    return await productToSave.save();
}

async function getAllProducts() {
    return await Product.find();
}

async function deleteProductById(id) {
    const deleteResult = await Product.deleteOne({ id: id });

    return deleteResult.deletedCount;
}

export { getProductById, addProduct, getAllProducts, deleteProductById };