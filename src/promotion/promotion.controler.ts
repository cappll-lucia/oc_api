import { Request, Response, NextFunction } from "express";
import { orm } from "../shared/db/conn.orm.js";
import { Promotion } from "./promotion.entity.js";
import moment from "moment";

const em = orm.em;


export function normalizePromotionInput(req: Request, res: Response, next: NextFunction){
    req.body.normalizePromotionInput={
        title: req.body.title,
        description: req.body.description,
        validFrom: moment(req.body.validFrom).format('YYYY-MM-DD'),
        validUntil: moment(req.body.validUntil).format('YYYY-MM-DD'),
        discountPercent: req.body.discountPercent,
        banner: req.body.banner
    }
    Object.keys(req.body.normalizePromotionInput).forEach(key=>{
        if(req.body.normalizePromotionInput[key]===undefined) delete req.body.normalizePromotionInput[key];
    })
    next();
}

export async function findAll(req: Request, res: Response) {
    try{
        const promotions = await em.find(Promotion, {}, {populate: ['products']});
        res.status(200).json({message: 'Promotions found.', data: promotions})
    }catch(error: any){
        res.status(500).json({message: 'Something went wrong while fetching promotions data.', error: error.message})
    }
}

export async function findOngoing(req: Request, res: Response){
    try {
        const now = new Date();
        const ongoingPromotions = await em.find(Promotion, {}, {filters: {ongoingPromos: {now}}})
        res.status(200).json({message: 'Ongoing promotions found', data: ongoingPromotions})
    } catch (error: any) {
        res.status(500).json({message: 'Something went wrong while fetching promotions data.', error: error.message})
    }
}

export async function findOngoingForProduct(req: Request, res: Response){
    try {
        const prodId = Number.parseInt(req.params.prodId);
        const now = new Date();
        const ongoingPromotions = await em.find(Promotion, {}, {filters: {ongoingPromosForPoduct: {now, prodId}}})
        res.status(200).json({message: 'Ongoing promotions found', data: ongoingPromotions})
    } catch (error: any) {
        res.status(500).json({message: 'Something went wrong while fetching promotions data.', error: error.message})
    }
}

export async function findOne(req: Request, res: Response) {
    try{
        const id = Number.parseInt(req.params.id);
        const promotion = await em.findOneOrFail(Promotion, {id}, {populate: ['products']});
        res.status(200).json({message: 'Promotion found.', data: promotion})
    }catch(error: any){
        res.status(500).json({message: 'Something went wrong while fetching promotion data.', error: error.message})
    }
    
}

export async function add(req: Request, res: Response) {
    try{
        const promotion = await em.create(Promotion, req.body.normalizePromotionInput);
        await em.flush();
        res.status(200).json({message: 'Promotion successfully created.', data: promotion});
    }catch(error: any){
        res.status(500).json({message: 'Something went wrong while adding a new promotion.', error: error.message})
    }
    
}

export async function update(req: Request, res: Response) {
    try{
        const id = Number.parseInt(req.params.id);
        const promoToUpdate = await em.findOneOrFail(Promotion, {id});
        em.assign(promoToUpdate, req.body.normalizePromotionInput);
        em.flush();
        res.status(201).json({message: 'Promotion successfully updated.', data: promoToUpdate});
    }catch(error: any){
        res.status(500).json({message: 'Something went wrong while updating promotion data.', error: error.message})
    }
    
}

export async function remove(req: Request, res: Response) {
    try{
        const id = Number.parseInt(req.params.id);
        const promotion = await em.findOneOrFail(Promotion, id);
        await em.removeAndFlush(promotion);
        res.status(200).json({message: `Promotion with id=${id} successfully deleted.`})
    }catch(error: any){
        res.status(500).json({message: 'Something went wrong while removing promotion.', error: error.message})
    }
    
}