import { z } from 'zod';
import { colorSchema } from '../color/color.schema.js';
import { Color } from '../color/color.entity.js';

export const productSchema = z.object({
	name: z
		.string({ required_error: 'Nombre del producto requerido' })
		.min(2, {
			message: 'El nombre del producto debe tener entre 2 y 30 caracteres',
		})
		.max(30, {
			message: 'El nombre del producto debe tener entre 2 y 30 caracteres',
		}),
	price: z
		.number({ required_error: 'Precio del producto requerido' })
		.positive({ message: 'El precio del producto debe ser mayor a 0' }),
	category: z.object({
		id: z.number({ required_error: 'Categoría del producto requerida' }),
	}),
	brand: z.object({
		id: z.number({ required_error: 'Marca del producto requerida' }),
	}),
	colors: z.number().array().nonempty({ message: 'El producto debe tener al menos un color' }),
});
