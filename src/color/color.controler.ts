import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/conn.orm.js';
import { Color } from './color.entity.js';
import { ZodError } from 'zod';
import { colorSchema } from './color.schema.js';

const em = orm.em;

export function normalizeColorInput(req: Request, res: Response, next: NextFunction) {
	req.body.normalizeColorInput = {
		name: req.body.name,
		background: req.body.background,
	};
	Object.keys(req.body.normalizeColorInput).forEach((key) => {
		if (req.body.normalizeColorInput[key] === undefined) delete req.body.normalizeColorInput[key];
	});
	next();
}

export async function findAll(req: Request, res: Response) {
	try {
		const colors = await em.find(Color, {}, { populate: ['products'] });
		res.status(200).json({ message: 'Colores encontrados', data: colors });
	} catch (error: any) {
		res.status(500).json({
			message: 'Algo salió mal al obtener los datos de los colores.',
			error: error.message,
		});
	}
}

export async function findOne(req: Request, res: Response) {
	try {
		const id = Number.parseInt(req.params.id);
		const color = await em.findOneOrFail(Color, { id }, { populate: ['products'] });
		res.status(200).json({ message: 'Color encontrado', data: color });
	} catch (error: any) {
		res.status(500).json({
			message: 'Algo salió mal al obtener los datos del color.',
			error: error.message,
		});
	}
}

export async function add(req: Request, res: Response) {
	try {
		colorSchema.parse(req.body.normalizeColorInput);
		const color = await em.create(Color, req.body.normalizeColorInput);
		await em.flush();
		res.status(201).json({ message: 'Color creado exitosamente.', data: color });
	} catch (error: any) {
		if (error instanceof ZodError) {
			const { fieldErrors: errors } = error.flatten();
			res.status(400).json({ message: errors });
		} else {
			res.status(500).json({
				message: 'Algo salió mal al crear un nuevo color.',
				error: error.message,
			});
		}
	}
}

export async function update(req: Request, res: Response) {
	try {
		const id = Number.parseInt(req.params.id);
		const colorToUpdate = await em.findOneOrFail(Color, { id });
		const assignedColor = em.assign(colorToUpdate, req.body.normalizeColorInput);
		colorSchema.parse(assignedColor);
		em.flush();
		res.status(200).json({ message: 'Color actualizado exitosamente.', data: colorToUpdate });
	} catch (error: any) {
		if (error instanceof ZodError) {
			const { fieldErrors: errors } = error.flatten();
			res.status(400).json({ message: errors });
		} else {
			res.status(500).json({
				message: 'Algo salió mal al actualizar datos del color.',
				error: error.message,
			});
		}
	}
}

export async function remove(req: Request, res: Response) {
	try {
		const id = Number.parseInt(req.params.id);
		const color = em.getReference(Color, id);
		try {
			await em.removeAndFlush(color);
			res.status(200).json({ message: `Color con id=${id} eliminado exitosamente` });
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
		res.status(400).json({
			message: 'Algo salió mal al eliminar el color',
			error: error.message,
		});
	}
}
