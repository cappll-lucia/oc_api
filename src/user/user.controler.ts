import { Request, Response, NextFunction } from "express";
import { orm } from "../shared/db/conn.orm.js";
import { User, hashPsw } from "./user.entity.js";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();
const em = orm.em;



export async function login(req: Request, res: Response, next: NextFunction){
    try{
        const { email, password } = req.body as { email: string; password: string };
        const user = await em.findOne(User, {email});
        if(user && user.password === hashPsw(password)){
            const token = jwt.sign({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            }, process.env.JWT_SECRET_KEY!,{
                expiresIn: 10800
            })
            res.status(200).json({message: 'Adentro!', token})
        }else{
            res.status(500).json({message: 'Incorrect email or password.'})
        }
    }catch(error: any){
        res.status(500).json({message: 'Something went wrong while fetching users data.', error: error.message})    
    }
}


export async function signUp(req: Request, res: Response) {
    try{
        const user = await em.create(User, req.body);
        await em.flush();
        res.status(201).json({message: 'User successfully created.', data: user})
    }catch(error: any){
        res.status(500).json({message: 'Something went wrong while adding a new user.', error: error.message})
    }
    
}

