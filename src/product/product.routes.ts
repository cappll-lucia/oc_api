import { Router } from "express";
import {sanitizeProductInput, findAll, findOne, add, update, remove} from './product.controler.js';
import { jwtAuth } from "../shared/tokenValidator.js";

export const productRouter = Router();

productRouter.get('/', findAll);
productRouter.get('/:id',  findOne);
productRouter.post('/', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin, sanitizeProductInput], add);
productRouter.put('/:id', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin, sanitizeProductInput], update);
productRouter.patch('/:id', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin, sanitizeProductInput], update);
productRouter.delete('/:id', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin], remove);