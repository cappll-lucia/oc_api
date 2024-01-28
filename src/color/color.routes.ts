import { Router } from "express";
import {sanitizeColorInput, findAll, findOne, add, update, remove} from './color.controler.js';

export const colorRouter = Router();

colorRouter.get('/', findAll);
colorRouter.get('/:id', findOne);
colorRouter.post('/', sanitizeColorInput , add);
colorRouter.put('/:id', sanitizeColorInput , update);
colorRouter.patch('/:id', sanitizeColorInput , update);
colorRouter.delete('/:id', remove);