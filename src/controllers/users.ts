import { Request, Response} from "express"
import mongoose from "mongoose"
import {User} from '../models/User';

//GET USERS DATA FROM MONGODB
export const usersData=async(req:Request,res:Response)=>{
    const users=await User.find()
    res.render("users",{
        users:users
    })
}