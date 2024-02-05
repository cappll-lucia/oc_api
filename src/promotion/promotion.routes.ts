import { Router } from 'express';
import { normalizePromotionInput, findAll, findOne, findOngoing, findOngoingForProduct, add, update, remove } from './promotion.controler.js';import { productRouter } from '../product/product.routes.js';
import { jwtAuth } from '../shared/tokenValidator.js';

export const promotionRouter = Router();

promotionRouter.get('/', findAll);
promotionRouter.get('/ongoing', findOngoing);
promotionRouter.get('/ongoing/:prodId', findOngoingForProduct);
promotionRouter.get('/:id', findOne);
promotionRouter.post('/',  [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin, normalizePromotionInput], add)
promotionRouter.put('/:id',  [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin, normalizePromotionInput], update)
promotionRouter.patch('/:id', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin, normalizePromotionInput],  update)
promotionRouter.delete('/:id', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin], remove)