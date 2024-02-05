import { Router } from "express";
import {normalizeProductInput, findAll, findOne, add, update, remove} from './product.controler.js';
import { jwtAuth } from "../shared/tokenValidator.js";

export const productRouter = Router();

productRouter.get('/', findAll);
productRouter.get('/:id',  findOne);
productRouter.post('/', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin, normalizeProductInput], add);
productRouter.put('/:id', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin, normalizeProductInput], update);
productRouter.patch('/:id', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin, normalizeProductInput], update);
productRouter.delete('/:id', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin], remove);