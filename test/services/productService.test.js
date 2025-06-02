import { addProduct, deleteProductById, getAllProducts, getProductById } from '../../src/services/productService.js';
import { MongoMemoryServer } from "mongodb-memory-server";
import * as mongoose from 'mongoose';
import * as chai from "chai";
import chaiAsPromised from 'chai-as-promised';
import Product from '../../src/models/productModel.js';
const { expect } = chai;
const { ValidationError } = mongoose.Error;

chai.use(chaiAsPromised);

describe("Product Service", () => {
    let mongoMemoryServer, mongooseConnection;

    describe("Add product method", () => {

        before(async () => {
            mongoMemoryServer = await MongoMemoryServer.create();
            mongooseConnection = await mongoose.connect(mongoMemoryServer.getUri());
        });

        after(async () => {
            await mongooseConnection.disconnect();
            await mongoMemoryServer.stop();
        });

        afterEach(async () => {
            await Product.deleteMany();
        });

        it("should throw ValidationError when invoked without arguments", async () => {
            await expect(addProduct()).to.be.rejectedWith(ValidationError);
        });

        it("should throw ValidationError when invoked only with product name", async () => {
            const productDetails = { name: "product name" };

            await expect(addProduct(productDetails)).to.be.rejectedWith(ValidationError);
        });

        it("should throw ValidationError when invoked only with product name and price", async () => {
            const productDetails = { name: "product name", price: 10.00 };

            await expect(addProduct(productDetails)).to.be.rejectedWith(ValidationError);
        });

        it("should throw ValidationError when invoked with product name, price and amount", async () => {
            const productDetails = { name: "product name", price: 10.00, amount: 10 };

            await expect(addProduct(productDetails)).to.be.rejectedWith(ValidationError);
        });

        it("should add new product", async () => {
            const productDetails = { name: "product name", price: 10.00, amount: 10, categoryId: 0 };

            await expect(addProduct(productDetails)).to.not.be.rejected;

            const numberOfProductsInDb = await Product.countDocuments();

            expect(numberOfProductsInDb).to.be.equal(1);
        });

        it("should add new product and not throw when invoked without price and amount", async () => {
            const productDetails = { name: "product name", categoryId: 0 };

            const productDb = await expect(addProduct(productDetails)).to.be.fulfilled;
            const numberOfProductsInDb = await Product.countDocuments();

            expect(numberOfProductsInDb).to.be.equal(1);
            expect(Number(productDb.price)).to.be.equal(0);
            expect(Number(productDb.amount)).to.be.equal(0);
        });

        it("should throw ValidationError when invoked with negative amount", async () => {
            const productDetails = { name: "product name", categoryId: 0, amount: -1 };

            await expect(addProduct(productDetails)).to.be.rejectedWith(ValidationError, "Amount cannot be negative");
        });

        it("should throw ValidationError when invoked with floating point amount", async () => {
            const productDetails = { name: "product name", categoryId: 0, amount: 5.5 };

            await expect(addProduct(productDetails)).to.be.rejectedWith(ValidationError, "The value must be an integer");
        });

        it("should throw ValidationError when invoked with negative category", async () => {
            const productDetails = { name: "product name", categoryId: -1, amount: 1 };

            await expect(addProduct(productDetails)).to.be.rejectedWith(ValidationError, "Category ID cannot be negative");
        });

        it("should throw ValidationError when invoked with floating point category", async () => {
            const productDetails = { name: "product name", categoryId: 1.23, amount: 1 };

            await expect(addProduct(productDetails)).to.be.rejectedWith(ValidationError, "ID must be an integer");
        });

        it("should ignore decimals in price after 2nd decimal", async () => {
            const productDetails = { name: "product name", categoryId: 0, price: 10.001 };

            const productDb = await expect(addProduct(productDetails)).to.be.fulfilled;

            expect(Number(productDb.price)).to.be.equal(10.00);
        });

        it("should trim the name of the product", async () => {
            const productDetails = { name: "      product name   ", categoryId: 0 };

            const productDb = await expect(addProduct(productDetails)).to.be.fulfilled;

            expect(productDb.name).to.be.equal("product name");
        });
    });

    describe("Get product by ID method", () => {

        before(async () => {
            mongoMemoryServer = await MongoMemoryServer.create();
            mongooseConnection = await mongoose.connect(mongoMemoryServer.getUri());

            const productDetails = { name: "product name", categoryId: 0 };

            await expect(addProduct(productDetails)).to.be.fulfilled;
            await expect(Product.countDocuments()).to.eventually.be.equal(1);
        });

        after(async () => {
            await Product.deleteMany();
            await mongooseConnection.disconnect();
            await mongoMemoryServer.stop();
        });

        it("should return product from the database with given ID", async () => {
            const productDb = await getProductById(0);

            expect(productDb).to.not.be.null;
            expect(productDb.id).to.be.equal(0);
        });

        it("should return null when product with given ID does not exist", async () => {
            const productDb = await getProductById(1);

            expect(productDb).to.be.null;
        });
    });

    describe("Delete product by ID method", () => {
        const productDetails = { name: "product name", categoryId: 0 };

        before(async () => {
            mongoMemoryServer = await MongoMemoryServer.create();
            mongooseConnection = await mongoose.connect(mongoMemoryServer.getUri());
        });

        after(async () => {
            await mongooseConnection.disconnect();
            await mongoMemoryServer.stop();
        });

        beforeEach(async () => {
            await expect(addProduct(productDetails)).to.be.fulfilled;
            await expect(Product.countDocuments()).to.eventually.be.equal(1);
        });

        afterEach(async () => {
            await Product.deleteMany();
        });

        it("should delete the product with given ID and return 1 as the deleted count", async () => {
            await expect(deleteProductById(0)).to.eventually.be.equal(1);
        });

        it("should return 0 as the deleted count when the product with given ID does not exist", async () => {
            await expect(deleteProductById(100)).to.eventually.be.equal(0);
        });
    });

    describe("Get all products method", () => {

        before(async () => {
            mongoMemoryServer = await MongoMemoryServer.create();
            mongooseConnection = await mongoose.connect(mongoMemoryServer.getUri());
        });

        after(async () => {
            await mongooseConnection.disconnect();
            await mongoMemoryServer.stop();
        });

        beforeEach(async () => {
            const productsDetails = [
                { name: "product 1", categoryId: 0 },
                { name: "product 2", categoryId: 0 },
                { name: "product 3", categoryId: 0 },
                { name: "product 4", categoryId: 0 },
                { name: "product 5", categoryId: 0 }
            ];

            for (let i = 0; i < productsDetails.length; i++) {
                await expect(addProduct(productsDetails[i])).to.be.fulfilled;
            }

            await expect(Product.countDocuments()).to.be.eventually.equal(5);
        });

        afterEach(async () => {
            await Product.deleteMany();
        });

        it("should return a list of all products contained in the database", async () => {
            const productsInDb = await getAllProducts();

            expect(productsInDb.length).to.be.equal(5);

            for (let i = 0; i < productsInDb.length; i++) {
                const currentProductName = `product ${i + 1}`;

                expect(productsInDb[i].name).to.be.equal(currentProductName);
            }
        });
    });
});