import * as mongoose from "mongoose";
import mongooseSequence from "mongoose-sequence";

const AutoIncrement = mongooseSequence(mongoose);

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxLength: 255
        },
        price: {
            type: Number,
            required: true,
            default: 0,
            validate: {
                validator: value => (value !== undefined) && (value >= 0),
                message: "The price cannot be negative"
            },
            get: v => (v / 100).toFixed(2),
            set: v => (v * 100).toFixed(0)
        },
        amount: {
            type: Number,
            required: true,
            min: [0, "Amount cannot be negative, got {VALUE}"],
            default: 0,
            validate: {
                validator: Number.isInteger,
                message: "The value must be an integer, got {VALUE}"
            }
        },
        categoryId: {
            type: Number,
            required: true,
            min: [0, "Category ID cannot be negative, got {VALUE}"],
            validate: {
                validator: Number.isInteger,
                message: "The ID must be an integer, got {VALUE}"
            }
        },
        imageIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }]
    },
    {
        toJSON: { getters: true }
    }
);

productSchema.plugin(AutoIncrement, { id: "product_schema_id", inc_field: "id", start_seq: 0 });

const Product = mongoose.model("Product", productSchema);

export default Product;