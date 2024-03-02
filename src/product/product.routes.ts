import { Router } from 'express';
import {
	normalizeProductInput,
	findAll,
	findOne,
	add,
	update,
	remove,
	getProductColorData,
	updateStock,
	uploadProductImage,
	uploadProductImageMiddleware,
	getImageFile,
	deleteProducImage,
} from './product.controler.js';
import { jwtAuth } from '../shared/tokenValidator.js';

export const productRouter = Router();

productRouter.get('/', findAll);
productRouter.get('/:id', findOne);
productRouter.get('/data/:prodId/:colorId', getProductColorData);
productRouter.post('/', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin, normalizeProductInput], add);
productRouter.put('/:id', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin, normalizeProductInput], update);
productRouter.patch('/:id', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin, normalizeProductInput], update);
productRouter.delete('/:id', [jwtAuth.tokenValidator, jwtAuth.restrictToAdmin], remove);

productRouter.put(
	'/update-stock/:prodId/:colorId',
	[jwtAuth.tokenValidator, jwtAuth.restrictToAdmin, normalizeProductInput],
	updateStock
);
productRouter.put(
	'/upload-image/:prodId/:colorId',
	[jwtAuth.tokenValidator, jwtAuth.restrictToAdmin, uploadProductImageMiddleware],
	uploadProductImage
);

productRouter.put(
	'/delete-image/:prodId/:colorId/:imageName',
	[jwtAuth.tokenValidator, jwtAuth.restrictToAdmin, uploadProductImageMiddleware],
	deleteProducImage
);

productRouter.get('/image/:imageName', getImageFile);
