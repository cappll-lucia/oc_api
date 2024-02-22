import { z } from 'zod';

export const promotionSchema = z
	.object({
		title: z
			.string({ required_error: 'Título de la promoción requerido' })
			.min(3, {
				message: 'El título de la promoción debe tener entre 2 y 25 caracteres',
			})
			.max(25, {
				message: 'El título de la promoción debe tener entre 2 y 25 caracteres',
			}),
		validFrom: z.date({
			invalid_type_error: 'Fecha de inicio de la promoción inválida',
		}),
		validUntil: z.date({
			invalid_type_error: 'Fecha de fin de la promoción inválida',
		}),
	})
	.superRefine(({ validFrom, validUntil }, context) => {
		if (!validFrom) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['validFrom'],
				message: 'Fecha de inicio de la promoción requerida',
			});
		}
		if (!validUntil) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['validUntil'],
				message: 'Fecha de fin de la promoción requerida',
			});
		}
		if (validFrom > validUntil) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['validFrom', 'validUntil'],
				message: 'La fecha de inicio de la promoción no puede ser mayor a la fecha de fin',
			});
		}
	});
