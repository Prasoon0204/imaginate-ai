import User from "../database/models/user.model";
import { connect } from "../database/mongoose";

export const createOrUpdateUser = async (
  id,
  first_name,
  last_name,
  image_url,
  email_addresses,
  username
) => {
  try {
    await connect();

    const user = await User.findOneAndUpdate(
      { clerkId: id },
      {
        $set: {
          firstName: first_name,
          lastName: last_name,
          photo: image_url,
          email: email_addresses[0].email_address,
          username: username,
        },
      },
      { new: true, upsert: true }
    );

    return user;
  } catch (error) {
    console.log('Error creating or updating user:', error);
  }
};

export const deleteUser = async (id) => {
  try {
    await connect();

    await User.findOneAndDelete({ clerkId: id });
  } catch (error) {
    console.log('Error deleting user:', error);
  }
};

export const getUserById = async (id) => {
  try {
    await connect();

    const user = await User.findOne({ clerkId: id });

    if (!user) throw new Error("User not found");

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.log('Error getting userId:', error);
  }
}

export const updateCredits = async (id, creditFee) => {
  try {
    await connect();

    const updatedUserCredits = await User.findByIdAndUpdate(
      id,
      {$inc: {creditBalance: creditFee} },
      {new: true}
    );

    if(!updatedUserCredits) throw new Error("User credits Update Failed");

    return JSON.parse(JSON.stringify(updatedUserCredits));

  } catch (error) {
    console.log('Error while updating credits:', error);
  }
}