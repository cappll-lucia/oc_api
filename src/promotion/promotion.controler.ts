import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/conn.orm.js';
import { Promotion } from './promotion.entity.js';
import moment from 'moment';
import { promotionSchema } from './promotion.schema.js';
import { ZodError } from 'zod';
import multer from 'multer';

const storage = multer.diskStorage({
	destination: (req: Request, file: Express.Multer.File, cb: (err: Error | null, destination: string) => void) => {
		cb(null, 'uploads/promotions');
	},
	filename: (req: Request, file: Express.Multer.File, cb: (err: Error | null, filename: string) => void) => {
		cb(null, `${Date.now()}-${file.originalname}`);
	},
});

const em = orm.em;
const upload = multer({ storage: storage });

export function normalizePromotionInput(req: Request, res: Response, next: NextFunction) {
	req.body.normalizePromotionInput = {
		title: req.body.title,
		description: req.body.description,
		validFrom: req.body.validFrom ? moment(req.body.validFrom).format('YYYY-MM-DD') : undefined,
		validUntil: req.body.validUntil ? moment(req.body.validUntil).format('YYYY-MM-DD') : undefined,
		discountPercent: req.body.discountPercent,
	};
	Object.keys(req.body.normalizePromotionInput).forEach((key) => {
		if (req.body.normalizePromotionInput[key] === undefined) delete req.body.normalizePromotionInput[key];
	});
	next();
}

export async function findAll(req: Request, res: Response) {
	try {
		const promotions = await em.find(Promotion, {}, { populate: ['products'] });
		res.status(200).json({ message: 'Promociones encontradas', data: promotions });
	} catch (error: any) {
		res.status(500).json({
			message: 'Algo salió mal al obtener datos de las promociones',
			error: error.message,
		});
	}
}

export async function findOngoing(req: Request, res: Response) {
	try {
		const now = new Date();
		const ongoingPromotions = await em.find(Promotion, {}, { filters: { ongoingPromos: { now } } });
		res.status(200).json({ message: 'Promociones vigentes encontradas', data: ongoingPromotions });
	} catch (error: any) {
		res.status(500).json({
			message: 'Algo salió mal al obtener datos de las promociones vigentes.',
			error: error.message,
		});
	}
}

export async function findOngoingForProduct(req: Request, res: Response) {
	try {
		const prodId = Number.parseInt(req.params.prodId);
		const now = new Date();
		const ongoingPromotions = await em.find(Promotion, {}, { filters: { ongoingPromosForPoduct: { now, prodId } } });
		res.status(200).json({ message: 'Promociones vigentes para el producto encontradas.', data: ongoingPromotions });
	} catch (error: any) {
		res.status(500).json({
			message: 'Algo salió mal al obtener los datos de las promociones vigentes para el producto.',
			error: error.message,
		});
	}
}

export async function findOne(req: Request, res: Response) {
	try {
		const id = Number.parseInt(req.params.id);
		const promotion = await em.findOneOrFail(Promotion, { id }, { populate: ['products'] });
		res.status(200).json({ message: 'Promotion found.', data: promotion });
	} catch (error: any) {
		res.status(500).json({
			message: 'Algo salió mal al obtener los datos de la promoción',
			error: error.message,
		});
	}
}

export async function add(req: Request, res: Response) {
	try {
		promotionSchema.parse({
			...req.body.normalizePromotionInput,
			validFrom: new Date(req.body.normalizePromotionInput.validFrom),
			validUntil: new Date(req.body.normalizePromotionInput.validUntil),
		});
		const promotion = await em.create(Promotion, req.body.normalizePromotionInput);
		await em.flush();
		res.status(201).json({ message: 'Promoción creada exitosamente', data: promotion });
	} catch (error: any) {
		if (error instanceof ZodError) {
			const { fieldErrors: errors } = error.flatten();
			res.status(400).json({ message: errors });
		} else {
			res.status(500).json({
				message: 'Algo salió mal al crear una nueva promoción',
				error: error.message,
			});
		}
	}
}

export async function update(req: Request, res: Response) {
	try {
		const id = Number.parseInt(req.params.id);
		const promoToUpdate = await em.findOneOrFail(Promotion, { id });
		const assignedPromo = em.assign(promoToUpdate, req.body.normalizePromotionInput);
		promotionSchema.parse({
			...assignedPromo,
			validFrom: new Date(String(assignedPromo.validFrom)),
			validUntil: new Date(String(assignedPromo.validUntil)),
		});
		em.flush();
		res.status(200).json({
			message: 'Promoción actualizada exitosamente.',
			data: promoToUpdate,
		});
	} catch (error: any) {
		if (error instanceof ZodError) {
			const { fieldErrors: errors } = error.flatten();
			res.status(400).json({ message: errors });
		} else {
			res.status(500).json({
				message: 'Algo salió mal al actualizar promoción',
				error: error.message,
			});
		}
	}
}

export async function remove(req: Request, res: Response) {
	try {
		const id = Number.parseInt(req.params.id);
		const promotion = await em.findOneOrFail(Promotion, id);
		await em.removeAndFlush(promotion);
		res.status(200).json({ message: `Promoción con id=${id} eliminada exitosamente.` });
	} catch (error: any) {
		res.status(500).json({
			message: 'Algo salió mal al eliminar la promoción',
			error: error.message,
		});
	}
}

export const uploadPromoBannerMiddleware = upload.single('banner');
export async function uploadPromoBanner(req: Request, res: Response) {
	try {
		const em = orm.em.fork();
		const id = Number.parseInt(req.params.id);
		const promotion = await em.findOneOrFail(Promotion, id);
		const banners = JSON.parse(promotion.banner_url);
		banners.push(req.file?.filename);
		promotion.banner_url = JSON.stringify(banners);
		await em.flush();
		res.status(200).json({
			message: 'Banner de la promoción almacenado.',
		});
	} catch (error: any) {
		res.status(500).json({
			message: 'Algo salió mal al almacenar el banner de la promoción.',
			error: error.message,
		});
	}
}

export async function getBannerFile(req: Request, res: Response) {
	try {
		const bannerName = req.params.bannerName;
		const path = `/uploads/promotions/${bannerName}`;
		res.sendFile(path, { root: '.' });
	} catch (error: any) {
		res.status(500).json({
			message: 'Algo salió mal al obtener el banner de la promoción.',
			error: error.message,
		});
	}
}
