import { Request, Response, NextFunction } from "express";
import { orm } from "../shared/db/conn.orm.js";
import { rmSync } from "fs";
import { Category } from "./category.entity.js";

const em = orm.em;

export function sanitizeCategoryInput(req: Request, res: Response, next: NextFunction){
    req.body.sanitizeCategoryInput = {
        name: req.body.name,
        description: req.body.description,
        products: req.body.products
    }
    Object.keys(req.body.sanitizeCategoryInput).forEach(key=>{
        if(req.body.sanitizeCategoryInput[key]===undefined) delete req.body.sanitizeCategoryInput[key];
    })
    next();
}


export async function findAll(req: Request, res: Response) {
    try{
        const categoties = await em.find(Category, {});
        res.status(200).json({message: 'Categories found', data: categoties});
    }catch(error: any){
        res.status(500).json({message: 'Something went wrong while retrieving categories data.', error: error.message})
    }
    
}

export async function findOne(req: Request, res: Response) {
    try{
        const id = Number.parseInt(req.params.id);
        const category = await em.findOneOrFail(Category, {id});
        res.status(200).json({message: 'Category found', data: category});
    }catch(error: any){
        res.status(500).json({message: 'Something went wrong while retrieving category data.', error: error.message})
    }
    
}

export async function add(req: Request, res: Response) {
    try{
        const category = em.create(Category, req.body.sanitizeCategoryInput);
        await em.flush();
        res.status(201).json({message: 'Category successfully created', data: category})
    }catch(error: any){
        res.status(500).json({message: 'Something went wrong while adding a new category.', error: error.message})
    }
    
}

export async function update(req: Request, res: Response) {
    try{
        const id = Number.parseInt(req.params.id);
        const categoryToUpdate = await em.findOneOrFail(Category, {id});
        em.assign(categoryToUpdate, req.body.sanitizeCategoryInput);
        await em.flush();
        res.status(200).json({message: 'Product successfully updated', data: categoryToUpdate});
    }catch(error: any){
        res.status(500).json({message: 'Something went wrong while updating category data.', error: error.message})
    }
    
}

export async function remove(req: Request, res: Response) {
    try{
        const id = Number.parseInt(req.params.id);
        const category = em.getReference(Category, id);
        em.removeAndFlush(category);
        res.status(200).send({message: `Category with id=${id} successfully deleted`})
    }catch(error: any){
        res.status(500).json({message: 'Something went wrong while removing category.', error: error.message})
    }
    
}
