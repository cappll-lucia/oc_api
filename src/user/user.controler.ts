import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/conn.orm.js';
import { User, hashPsw } from './user.entity.js';
import { loginSchema, signUpSchema } from './user.schema.js';
import { ZodError } from 'zod';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();
const em = orm.em;

export async function login(req: Request, res: Response, next: NextFunction) {
	try {
		const { email, password } = req.body as { email: string; password: string };
		loginSchema.parse({ email, password });
		const user = await em.findOne(User, { email });
		if (user && user.password === hashPsw(password)) {
			const token = jwt.sign(
				{
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					role: user.role,
				},
				process.env.JWT_SECRET_KEY!,
				{
					expiresIn: 10800,
				}
			);
			res.status(200).json({ message: 'Bienvenido!', token });
		} else {
			res.status(401).json({ message: 'Email y/o contraseña incorrectos.' });
		}
	} catch (error: any) {
		if (error instanceof ZodError) {
			const { fieldErrors: errors } = error.flatten();
			res.status(400).json({ message: errors });
		} else {
			res.status(500).json({
				message: 'Algo salió mal al iniciar sesión.',
				error: error.message,
			});
		}
	}
}

export async function signUp(req: Request, res: Response) {
	res.status(403).json({ message: 'Operación no disponible' });
}
