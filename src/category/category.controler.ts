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
		res.status(200).json({ message: 'Categories found', data: categoties });
	} catch (error: any) {
		res.status(400).json({
			message: 'Something went wrong while retrieving categories data.',
			error: error.message,
		});
	}
}

export async function findOne(req: Request, res: Response) {
	try {
		const id = Number.parseInt(req.params.id);
		const category = await em.findOneOrFail(Category, { id });
		res.status(200).json({ message: 'Category found', data: category });
	} catch (error: any) {
		res.status(400).json({
			message: 'Something went wrong while retrieving category data.',
			error: error.message,
		});
	}
}

export async function add(req: Request, res: Response) {
	try {
		categorySchema.parse(req.body.normalizeCategoryInput);
		const category = em.create(Category, req.body.normalizeCategoryInput);
		await em.flush();
		res.status(201).json({ message: 'Category successfully created', data: category });
	} catch (error: any) {
		if (error instanceof ZodError) {
			const { fieldErrors: errors } = error.flatten();
			res.status(400).json({ message: errors });
		} else {
			res.status(400).json({
				message: 'Something went wrong while adding a new category.',
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
			message: 'Product successfully updated',
			data: categoryToUpdate,
		});
	} catch (error: any) {
		if (error instanceof ZodError) {
			const { fieldErrors: errors } = error.flatten();
			res.status(400).json({ message: errors });
		} else {
			res.status(400).json({
				message: 'Something went wrong while updating category data.',
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
			res.status(200).json({ message: `Category with id=${id} successfully deleted.` });
		} catch (error: any) {
			if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.sqlState === '23000') {
				res.status(400).json({
					message: 'Unable to delete category due to associated products',
				});
			} else {
				throw error;
			}
		}
	} catch (error: any) {
		res.status(400).json({
			message: 'Something went wrong while removing category.',
			error: error.message,
		});
	}
}
