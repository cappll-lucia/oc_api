import { z } from 'zod';

export const loginSchema = z.object({
	email: z
		.string({ required_error: 'Ingrese su email' })
		.min(1, { message: 'Ingrese su email' })
		.email({ message: 'Email inválido' }),
	password: z.string({ required_error: 'Ingrese su contraseña' }),
});

export const signUpSchema = z.object({
	email: z
		.string({ required_error: 'Email requerido' })
		.min(1, { message: 'Email requerido' })
		.email({ message: 'Email inválido' }),
	firstName: z
		.string({ required_error: 'Nombre requerido' })
		.min(1, { message: 'Nombre requerido' })
		.max(30, { message: 'Su nombre no puede exceder los 30 caracteres' })
		.trim(),
	lastName: z
		.string({ required_error: 'Apellido requerido' })
		.min(1, { message: 'Apellido requerido' })
		.max(50, { message: 'Su apellido no puede exceder los 50 caracteres' })
		.trim(),
	role: z.enum(['admin', 'user'], { required_error: 'Rol inválido' }),
	password: z
		.string({ required_error: 'Contraseña requerida' })
		.min(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
		.max(20, { message: 'La contraseña puede tener hasta 20 caracteres' })
		.trim(),
});
