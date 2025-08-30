import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try{
        const token = req.cookies.jwt;

        if(!token){
            return res.status(401).json({message: "Unauthorized - No token available"});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(!decoded){
            return res.status(401).json({message: "Unauthorized - Invalid token"});
        }

        const user = await User.findById(decoded.userID).select("-password");

        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        req.user = user;

        next();

    }catch(e){
        console.log("Error in protect route", e);
        res.status(500).json({message: "Internal server error"});
    }
}