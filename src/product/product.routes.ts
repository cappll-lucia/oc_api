import { Router } from "express";
import {sanitizeProductInput, findAll, findOne, add, update, remove} from './product.controler.js';
import { tokenValidator } from "../shared/tokenValidator.js";

export const productRouter = Router();

productRouter.get('/', tokenValidator, findAll);
productRouter.get('/:id', findOne);
productRouter.post('/', sanitizeProductInput , add);
productRouter.put('/:id', sanitizeProductInput , update);
productRouter.patch('/:id', sanitizeProductInput , update);
productRouter.delete('/:id', remove);