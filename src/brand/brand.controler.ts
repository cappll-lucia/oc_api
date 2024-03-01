import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/conn.orm.js';
import { Brand } from './brand.entity.js';
import { ZodError } from 'zod';
import { brandSchema } from './brand.schema.js';
import multer from 'multer';
import fs from 'fs';

const storage = multer.diskStorage({
	destination: (req: Request, file: Express.Multer.File, cb: (err: Error | null, destination: string) => void) => {
		cb(null, 'uploads/brandsLogos');
	},
	filename: (req: Request, file: Express.Multer.File, cb: (err: Error | null, filename: string) => void) => {
		cb(null, `${Date.now()}-${file.originalname}`);
	},
});

const em = orm.em;
const upload = multer({ storage: storage });

export function normalizeBrandInput(req: Request, res: Response, next: NextFunction) {
	req.body.normalizeBrandInput = {
		name: req.body.name,
		logo: req.body.logo,
	};
	Object.keys(req.body.normalizeBrandInput).forEach((key) => {
		if (req.body.normalizeBrandInput[key] === undefined) delete req.body.normalizeBrandInput[key];
	});
	next();
}

export async function findAll(req: Request, res: Response) {
	try {
		const brands = await em.find(Brand, {});
		res.status(200).json({ message: 'Brands found.', data: brands });
	} catch (error: any) {
		res.status(400).json({
			message: 'Something went wrong while retrieving brands data.',
			error: error.message,
		});
	}
}

export async function findOne(req: Request, res: Response) {
	try {
		const id = Number.parseInt(req.params.id);
		const brand = await em.findOneOrFail(Brand, { id });
		res.status(200).json({ message: 'Brand found.', data: brand });
	} catch (error: any) {
		res.status(400).json({
			message: 'Something went wrong while retrieving brands data.',
			error: error.message,
		});
	}
}

export async function add(req: Request, res: Response) {
	try {
		const newBrand = req.body.normalizeBrandInput;
		newBrand.logo = req.file?.filename;
		brandSchema.parse(newBrand);
		const brand = em.create(Brand, req.body.normalizeBrandInput);
		await em.flush();
		res.status(201).json({ message: 'Brand successfully created.', data: brand });
	} catch (error: any) {
		if (error instanceof ZodError) {
			const { fieldErrors: errors } = error.flatten();
			res.status(400).json({ message: errors });
		} else {
			res.status(400).json({
				message: 'Something went wrong while adding a new brand.',
				error: error.message,
			});
		}
	}
}

export async function update(req: Request, res: Response) {
	try {
		const id = Number.parseInt(req.params.id);
		const brandToUpdate = await em.findOneOrFail(Brand, { id });
		const assignedBrand = em.assign(brandToUpdate, req.body.normalizeBrandInput);
		brandSchema.parse(assignedBrand);
		await em.flush();
		res.status(201).json({ message: 'Brand successfully updated.', data: brandToUpdate });
	} catch (error: any) {
		if (error instanceof ZodError) {
			const { fieldErrors: errors } = error.flatten();
			res.status(400).json({ message: errors });
		} else {
			res.status(400).json({
				message: 'Something went wrong while updating brand data.',
				error: error.message,
			});
		}
	}
}

export async function remove(req: Request, res: Response) {
	try {
		const id = Number.parseInt(req.params.id);
		const brand = await em.findOneOrFail(Brand, id);
		if (brand.logo) {
			const prevLogoPath = `uploads/brandsLogos/${brand.logo}`;
			fs.unlinkSync(prevLogoPath);
		}
		try {
			await em.removeAndFlush(brand);
			res.status(200).json({ message: `Brand with id=${id} successfully deleted.` });
		} catch (error: any) {
			if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.sqlState === '23000') {
				res.status(400).json({
					message: 'Unable to delete brand due to associated products',
				});
			} else {
				throw error;
			}
		}
	} catch (error: any) {
		res.status(400).json({
			message: 'Something went wrong while removing brand.',
			error: error.message,
		});
	}
}

export const uploadBrandLogoMiddleware = upload.single('logo');
export async function uploadBrandLogo(req: Request, res: Response) {
	try {
		const em = orm.em.fork();
		const id = Number.parseInt(req.params.id);
		const brand = await em.findOneOrFail(Brand, id);
		if (brand.logo) {
			const prevLogoPath = `uploads/brandsLogos/${brand.logo}`;
			fs.unlinkSync(prevLogoPath);
		}
		brand.logo = req.file?.filename;
		await em.flush();
		res.status(201).json({
			message: 'Logo de la marca actualizado con éxito',
		});
	} catch (error: any) {
		res.status(400).json({
			message: 'Algo salió mal al actualizar el logo de la marca.',
			error: error.message,
		});
	}
}

export async function getLogoImage(req: Request, res: Response) {
	try {
		const logoFileName = req.params.logoFileName;
		const path = `/uploads/brandsLogos/${logoFileName}`;
		res.sendFile(path, { root: '.' });
	} catch (error: any) {
		res.status(400).json({
			message: 'Something went wrong while getting brand logo image.',
			error: error.message,
		});
	}
}
