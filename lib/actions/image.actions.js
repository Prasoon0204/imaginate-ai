"use server";

import { revalidatePath } from "next/cache";
import { connect } from "../database/mongoose";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";
import { v2 as cloudinary } from "cloudinary";

const populateUser = (query) => query.populate({
    path: 'author',
    model: User,
    select: '_id firstName lastName clerkId'
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
        console.log('Error Getting an Image:', error);
    }
}

export const getAllImages = async({limit = 9, page = 1, searchQuery = ''}) => {
    try {
        await connect();

        cloudinary.config({
            cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true,
        })

        let expression = 'folder=imaginate_AI';

        if(searchQuery){
            expression += ` AND ${searchQuery}`
        }

        const { resources } = await cloudinary.search.expression(expression).execute();
        
        const resourceIds = resources.map((resource) => resource.public_id);

        let query = {};

        if(searchQuery){
            query = {
                publicId: {
                    $in: resourceIds
                }
            }
        }

        const skipAmount = (Number(page)-1) * limit;

        const images = await populateUser(Image.find(query)).sort({updatedAt : -1}).skip(skipAmount).limit(limit);

        const totalImages = await Image.find(query).countDocuments();
        const savedImages = await Image.find().countDocuments();

        return {
            data : JSON.parse(JSON.stringify(images)),
            totalPage: Math.ceil(totalImages/limit),
            savedImages,
        }
    } catch (error) {
        console.log('Error getting All the Images:', error);
    }
}

export const getUserImages = async({
    limit = 9,
    page = 1,
    userId,
  }) => {
    try {
      await connect();
  
      const skipAmount = (Number(page) - 1) * limit;
  
      const images = await populateUser(Image.find({ author: userId }))
        .sort({ updatedAt: -1 })
        .skip(skipAmount)
        .limit(limit);
  
      const totalImages = await Image.find({ author: userId }).countDocuments();
  
      return {
        data: JSON.parse(JSON.stringify(images)),
        totalPages: Math.ceil(totalImages / limit),
      };
    } catch (error) {
      console.log("Error getting user images : ", error);
    }
  }