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
		res.status(200).json({ message: 'Marcas encontradas.', data: brands });
	} catch (error: any) {
		res.status(500).json({
			message: 'Algo salió mal al obtener los datos de las marcas.',
			error: error.message,
		});
	}
}

export async function findOne(req: Request, res: Response) {
	try {
		const id = Number.parseInt(req.params.id);
		const brand = await em.findOneOrFail(Brand, { id });
		res.status(200).json({ message: 'Marca encontrada', data: brand });
	} catch (error: any) {
		res.status(500).json({
			message: 'Algo salió mal al obtener los datos de la marca.',
			error: error.message,
		});
	}
}

export async function add(req: Request, res: Response) {
	try {
		const newBrand = req.body.normalizeBrandInput;
		newBrand.logo = req.file?.filename;
		brandSchema.parse(newBrand);
		const em = orm.em.fork();
		const brand = em.create(Brand, req.body.normalizeBrandInput);
		await em.flush();
		res.status(201).json({ message: 'Marca creada exitosamente.', data: brand });
	} catch (error: any) {
		if (error instanceof ZodError) {
			const { fieldErrors: errors } = error.flatten();
			res.status(400).json({ message: errors });
		} else {
			res.status(500).json({
				message: 'Algo salió mal al crear una nueva marca.',
				error: error.message,
			});
		}
	}
}

export async function update(req: Request, res: Response) {
	try {
		const em = orm.em.fork();
		const id = Number.parseInt(req.params.id);
		const brandToUpdate = await em.findOneOrFail(Brand, { id });
		if (req.file) {
			if (brandToUpdate.logo) {
				const prevLogoPath = `uploads/brandsLogos/${brandToUpdate.logo}`;
				fs.unlinkSync(prevLogoPath);
			}
			brandToUpdate.logo = req.file.filename;
		}
		const assignedBrand = em.assign(brandToUpdate, req.body.normalizeBrandInput);
		brandSchema.parse(assignedBrand);
		await em.flush();
		res.status(200).json({ message: 'Marca actualizada exitosamente.', data: brandToUpdate });
	} catch (error: any) {
		if (error instanceof ZodError) {
			const { fieldErrors: errors } = error.flatten();
			res.status(400).json({ message: errors });
		} else {
			res.status(500).json({
				message: 'Algo salió mal al actualizar la marca',
				error: error.message,
			});
		}
	}
}

export async function remove(req: Request, res: Response) {
	try {
		const id = Number.parseInt(req.params.id);
		const brand = await em.findOneOrFail(Brand, id);
		try {
			await em.removeAndFlush(brand);
			if (brand.logo) {
				const prevLogoPath = `uploads/brandsLogos/${brand.logo}`;
				fs.unlinkSync(prevLogoPath);
			}
			res.status(200).json({ message: `Marca con id=${id} eliminada exitosamente.` });
		} catch (error: any) {
			if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.sqlState === '23000') {
				res.status(400).json({
					message: 'No es posible eliminar el color debido a que tiene productos asociados.',
				});
			} else {
				throw error;
			}
		}
	} catch (error: any) {
		res.status(500).json({
			message: 'Algo salió mal al eliminar la marca',
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
		res.status(200).json({
			message: 'Logo de la marca actualizado con éxito',
		});
	} catch (error: any) {
		res.status(500).json({
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
		res.status(500).json({
			message: 'Algo salió mal al obtener la imagen del logo.',
			error: error.message,
		});
	}
}
