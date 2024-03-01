import { z } from 'zod';

export const colorSchema = z.object({
	name: z
		.string({ required_error: 'Nombre del color requerido' })
		.min(2, {
			message: 'El nombre del color debe tener entre 2 y 15 caracteres',
		})
		.max(15, {
			message: 'El nombre del color debe tener entre 2 y 15 caracteres',
		}),
	background: z.string({ required_error: 'Backgroud del color requerido' }),
});
