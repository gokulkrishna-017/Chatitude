import cloudinary from "../libs/cloudinary.js";
import { getReceiverSocketId, io } from "../libs/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
    try{
        const loggedInUserID = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: loggedInUserID}}).select("-password");

        res.status(200).json(filteredUsers);
    }catch(e){
        console.log("Error in getusersforsidebar controller", e);
        res.status(500).json({message: "Internal server error"});
    }
};

export const getMessages = async (req, res) => {
    try{
        const {id: userToChatID} = req.params;
        const myID = req.user._id;
        const messages = await Message.find({
            $or: [
                {senderID: myID, receiverID: userToChatID},
                {senderID: userToChatID, receiverID: myID}
            ]
        })
        res.status(200).json(messages);
    }catch(e){
        console.log("Error while fetching messages", e);
        res.status(500).json({message: "Internal server error"});
    }
};

export const sendMessage = async (req, res) => {
    try{
        const {text, image} = req.body;
        const {id: receiverID} = req.params;
        const senderID = req.user._id;

        let imageURL;
        if(image){
            const Uploadresponse = await cloudinary.uploader.upload(image);
            imageURL = Uploadresponse.secure_url;
        }

        const newMessage = new Message({
            senderID, 
            receiverID,
            text,
            image: imageURL,
        })

        await newMessage.save();

        res.status(201).json(newMessage);

        //socket.io

        const receiverSocketId = getReceiverSocketId(receiverID);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }
        
    }catch(e){
        console.log("Error while sending message", e);
        res.status(500).json({message: "Internal server error"});
    }
}