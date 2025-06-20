
// import createError from "http-errors";
// import { jwtSecret } from "../secret.js";
import jwt from "jsonwebtoken";
// import { errorResponse } from "../controllers/response.controller.js";

const authUser = async (req, res, next) => {
  
    const { token } = req.headers;
    if(!token){
        return res.json({success:false , message:"Not Authorised Login Again"})

    }
    try {
        const token_decode = jwt.verify(token,process.env.JWT_SECRET)
        req.body.userId = token_decode.id
        next()
    } catch (error) {
        console.log(error)
        res.json({success:false , message: error.message})

        
    }
  
};

export default authUser;
