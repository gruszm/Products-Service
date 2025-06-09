import Image from "../models/imageModel.js";

async function getImageById(id) {
    return await Image.findOne({ id: id }).select("-_id -__v");
}

export { getImageById };