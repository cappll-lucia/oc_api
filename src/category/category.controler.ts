import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/conn.orm.js';
import { Category } from './category.entity.js';
import { categorySchema } from './category.schema.js';
import { ZodError } from 'zod';

const em = orm.em;

export function normalizeCategoryInput(req: Request, res: Response, next: NextFunction) {
	req.body.normalizeCategoryInput = {
		name: req.body.name,
		description: req.body.description,
		products: req.body.products,
	};
	Object.keys(req.body.normalizeCategoryInput).forEach((key) => {
		if (req.body.normalizeCategoryInput[key] === undefined) delete req.body.normalizeCategoryInput[key];
	});
	next();
}

export async function findAll(req: Request, res: Response) {
	try {
		const categoties = await em.find(Category, {});
		res.status(200).json({ message: 'Categorías encontradas.', data: categoties });
	} catch (error: any) {
		res.status(500).json({
			message: 'Algo salió mal al recuperar los datos de las categorías.',
			error: error.message,
		});
	}
}

export async function findOne(req: Request, res: Response) {
	try {
		const id = Number.parseInt(req.params.id);
		const category = await em.findOneOrFail(Category, { id });
		res.status(200).json({ message: 'Categoría encontrada', data: category });
	} catch (error: any) {
		res.status(500).json({
			message: 'Algo salió mal al recuperar los datos de la categoría.',
			error: error.message,
		});
	}
}

export async function add(req: Request, res: Response) {
	try {
		categorySchema.parse(req.body.normalizeCategoryInput);
		const category = em.create(Category, req.body.normalizeCategoryInput);
		await em.flush();
		res.status(201).json({ message: 'Categoría creada exitosamente', data: category });
	} catch (error: any) {
		if (error instanceof ZodError) {
			const { fieldErrors: errors } = error.flatten();
			res.status(400).json({ message: errors });
		} else {
			res.status(500).json({
				message: 'Algo salió mal al crear nueva categoría.',
				error: error.message,
			});
		}
	}
}

export async function update(req: Request, res: Response) {
	try {
		const id = Number.parseInt(req.params.id);
		const categoryToUpdate = await em.findOneOrFail(Category, { id });
		const assignedCateg = em.assign(categoryToUpdate, req.body.normalizeCategoryInput);
		categorySchema.parse(assignedCateg);
		await em.flush();
		res.status(200).json({
			message: 'Producto actualizado exitosamente',
			data: categoryToUpdate,
		});
	} catch (error: any) {
		if (error instanceof ZodError) {
			const { fieldErrors: errors } = error.flatten();
			res.status(400).json({ message: errors });
		} else {
			res.status(500).json({
				message: 'Algo salió mal al actualizar la categoría',
				error: error.message,
			});
		}
	}
}

export async function remove(req: Request, res: Response) {
	try {
		const id = Number.parseInt(req.params.id);
		const category = em.getReference(Category, id);
		try {
			await em.removeAndFlush(category);
			res.status(200).json({ message: `Categoría con id=${id} eliminada exitosamente` });
		} catch (error: any) {
			if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.sqlState === '23000') {
				res.status(400).json({
					message: 'No es posible eliminar la categoría debido a que tiene productos asociados.',
				});
			} else {
				throw error;
			}
		}
	} catch (error: any) {
		res.status(500).json({
			message: 'Algo salió mal al eliminar la categoría',
			error: error.message,
		});
	}
}
