import { Product } from '../models/productModel.js';

async function getProductById(id) {
    return await Product.findById(id);
}

async function addProduct(productDetails) {
    const productToSave = new Product(productDetails);

    return await productToSave.save();
}

export { getProductById, addProduct };