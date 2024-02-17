import { z } from 'zod';

export const brandSchema = z.object({
  name: z
    .string({ required_error: 'Nombre de la marca requerido' })
    .min(2, {
      message: 'El nombre de la marca debe tener entre 2 y 30 caracteres',
    })
    .max(30, {
      message: 'El nombre de la marca debe tener entre 2 y 30 caracteres',
    }),
});
