import { Router } from "express";
import {sanitizeBrandInput, findAll, findOne, add, update, remove} from './brand.controler.js';
import { jwtAuth } from "../shared/tokenValidator.js";

export const brandRouter = Router();

brandRouter.get('/', findAll);
brandRouter.get('/:id', findOne);
brandRouter.post('/', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin, sanitizeBrandInput] , add);
brandRouter.put('/:id', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin, sanitizeBrandInput] , update);
brandRouter.patch('/:id', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin, sanitizeBrandInput] , update);
brandRouter.delete('/:id',[jwtAuth.tokenValidator, jwtAuth.restrictToAdmin], remove);