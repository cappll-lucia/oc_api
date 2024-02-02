import { Request, Response, NextFunction } from "express";
import { orm } from "../shared/db/conn.orm.js";
import { Color } from "./color.entity.js";
import { rmSync } from "fs";

const em = orm.em;


export function sanitizeColorInput(req: Request, res: Response, next: NextFunction){
    req.body.sanitizeColorInput = {
        name: req.body.name,
        background: req.body.background
    }
    Object.keys(req.body.sanitizeColorInput).forEach(key=>{
        if(req.body.sanitizeColorInput[key]===undefined) delete req.body.sanitizeColorInput[key];
    })
    next();
}


export async function findAll(req: Request, res: Response) {
    try{
        const colors = await em.find(Color, {});
        res.status(200).json({message: 'Colors found.', data: colors});
    }catch(error: any){
        res.status(500).json({message: 'Something went wrong while fetching colors data.', error: error.message})
    }
    
}

export async function findOne(req: Request, res: Response) {
    try{
        const id = Number.parseInt(req.params.id);
        const color = await em.findOneOrFail(Color, {id});
        res.status(200).json({message: 'Color found.', data: color});
    }catch(error: any){
        res.status(500).json({message: 'Something went wrong while fetching color data.', error: error.message})
    }
    
}

export async function add(req: Request, res: Response) {
    try{
        const color = await em.create(Color, req.body.sanitizeColorInput);
        await em.flush();
        res.status(201).json({message: 'Color successfully created.', data: color});
    }catch(error: any){
        res.status(500).json({message: 'Something went wrong while adding a new color.', error: error.message})
    }
    
}

export async function update(req: Request, res: Response) {
    try{
        const id = Number.parseInt(req.params.id);
        const colorToUpdate = await em.findOneOrFail(Color, {id});
        em.assign(colorToUpdate, req.body.sanitizeColorInput);
        em.flush();
        res.status(201).json({message: 'Color successfully updated.', data: colorToUpdate});
    }catch(error: any){
        res.status(500).json({message: 'Something went wrong while updating color data.', error: error.message})
    }
    
}

export async function remove(req: Request, res: Response) {
    try{
        const id = Number.parseInt(req.params.id);
        const color = em.getReference(Color,id);
        try {
            await em.removeAndFlush(color);
            res.status(200).json({message: `Color with id=${id} successfully deleted.`})
        } catch (error: any) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.sqlState === '23000') {
                res.status(400).json({ message: 'Unable to delete color due to associated products.' });
            } else {
                throw error; 
            }
        }
    }catch(error: any){
        res.status(500).json({message: 'Something went wrong while removing color.', error: error.message})
    }
    
}
