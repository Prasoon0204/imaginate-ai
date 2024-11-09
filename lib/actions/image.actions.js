"use server";

import { revalidatePath } from "next/cache";
import { connect } from "../database/mongoose";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";

const populateUser = (query) => query.populate({
    path: 'author',
    model: User,
    select: '_id firstName lastName'
})

export const addImage = async({image, userId, path}) => {
    try {
        await connect();

        const author = await User.findById(userId);

        if(!author) throw new Error("User not Found")

        const newImage = await Image.create({
            ...image,
            author: author._id,
        })

        revalidatePath(path);

        return JSON.parse(JSON.stringify(newImage));
    } catch (error) {
        console.log('Error Adding an Image:', error);
    }
}

export const updateImage = async({image, userId, path}) => {
    try {
        await connect();

        const imageToUpdate = Image.findById(image._id);

        if(!imageToUpdate || imageToUpdate.author.toHexString() !== userId) throw new Error("Unauthorized or image not Found");
        revalidatePath(path);

        const updatedImage = await Image.findByIdAndUpdate(
            imageToUpdate._id,
            image,
            {new: true}
        )
        return JSON.parse(JSON.stringify(updatedImage));
    } catch (error) {
        console.log('Error updating an Image:', error);
    }
}

export const deleteImage = async(imageId) => {
    try {
        await connect();

        await Image.findByIdAndDelete(imageId);

    } catch (error) {
        console.log('Error deleting an Image:', error);
    } finally{
        redirect('/')
    }
}

export const getImageById = async(imageId) => {
    try {
        await connect();

        const image = await populateUser(Image.findById(imageId));

        if(!image) throw new Error("Image Not Found");

        return JSON.parse(JSON.stringify(image));
    } catch (error) {
        console.log('Error Adding an Image:', error);
    }
}