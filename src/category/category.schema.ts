import { z } from 'zod';

export const categorySchema = z.object({
	name: z
		.string({ required_error: 'Nombre de la categoría requerido' })
		.min(2, {
			message: 'El nombre de la categoría debe tener entre 2 y 30 caracteres',
		})
		.max(30, {
			message: 'El nombre de la categoría debe tener entre 2 y 30 caracteres',
		}),
});
