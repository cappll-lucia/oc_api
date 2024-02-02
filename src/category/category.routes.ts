import { Router } from "express";
import {sanitizeCategoryInput, findAll, findOne, add, update, remove} from './category.controler.js';
import { jwtAuth } from "../shared/tokenValidator.js";

export const categoryRouter = Router();

categoryRouter.get('/', findAll);
categoryRouter.get('/:id', findOne);
categoryRouter.post('/', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin, sanitizeCategoryInput ] , add);
categoryRouter.put('/:id', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin, sanitizeCategoryInput ] , update);
categoryRouter.patch('/:id', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin, sanitizeCategoryInput]  , update);
categoryRouter.delete('/:id', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin] , remove);