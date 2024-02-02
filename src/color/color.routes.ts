import { Router } from "express";
import {sanitizeColorInput, findAll, findOne, add, update, remove} from './color.controler.js';
import { jwtAuth } from "../shared/tokenValidator.js";

export const colorRouter = Router();

colorRouter.get('/', findAll);
colorRouter.get('/:id', findOne);
colorRouter.post('/', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin, sanitizeColorInput] , add);
colorRouter.put('/:id', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin, sanitizeColorInput] , update);
colorRouter.patch('/:id', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin, sanitizeColorInput] , update);
colorRouter.delete('/:id', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin] ,remove);