import * as mongoose from "mongoose";

async function connect(hostname) {
    const url = `mongodb://${hostname}:27017/products`;

    try {
        await mongoose.connect(url);

        console.log("Successfully connected to products database on url " + url);
    } catch (error) {
        console.log(`Could not connect to products database on url ${url}: ${error.message}`);

        process.exit(1);
    }
}

export { connect };