import { Router } from "express";
import {normalizeBrandInput, findAll, findOne, add, update, remove} from './brand.controler.js';
import { jwtAuth } from "../shared/tokenValidator.js";

export const brandRouter = Router();

brandRouter.get('/', findAll);
brandRouter.get('/:id', findOne);
brandRouter.post('/', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin, normalizeBrandInput] , add);
brandRouter.put('/:id', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin, normalizeBrandInput] , update);
brandRouter.patch('/:id', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin, normalizeBrandInput] , update);
brandRouter.delete('/:id',[jwtAuth.tokenValidator, jwtAuth.restrictToAdmin], remove);