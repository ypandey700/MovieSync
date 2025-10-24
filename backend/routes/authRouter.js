import jwt  from "jsonwebtoken";
import express from 'express'; 
import User from '../models/User'


const router = express.Router(); 

function auth(req,res,next){
  const token = req.cookies.token; 
  if(!token) return res.status(401).json({message:"No token provided"} ); 
  
  try {
   req.user = jwt.verify(token, process.env.JWT_SECRET);
   next();  
  } catch (error) {
  res.status(401).json({message: "Invalid token "})
  }

}