import * as mongoose from "mongoose";
import mongooseSequence from "mongoose-sequence";

const AutoIncrement = mongooseSequence(mongoose);

const imageSchema = new mongoose.Schema(
    {
        data: Buffer,
        mimeType: String,
        originalName: String,
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }
    }
);

imageSchema.plugin(AutoIncrement, { id: "image_schema_id", inc_field: "id", start_seq: 0 });

const Image = mongoose.model("Image", imageSchema);

export default Image;