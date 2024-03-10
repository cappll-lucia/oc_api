import 'reflect-metadata';
import dotenv from 'dotenv';
import express from 'express';
import { orm, syncSchema } from './shared/db/conn.orm.js';
import { RequestContext } from '@mikro-orm/core';
import { userRouter } from './user/user.routes.js';
import { productRouter } from './product/product.routes.js';
import { promotionRouter } from './promotion/promotion.routes.js';
import { colorRouter } from './color/color.routes.js';
import { categoryRouter } from './category/category.routes.js';
import { brandRouter } from './brand/brand.routes.js';

dotenv.config();

const app = express();

app.use(express.json());

app.use((req, res, next) => {
	RequestContext.create(orm.em, next);
});

if (process.env.APP_ENV === 'dev') {
	app.use((req, res, next) => {
		res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		next();
	});
}

if (process.env.APP_ENV === 'production') {
	app.use((req, res, next) => {
		res.setHeader('Access-Control-Allow-Origin', 'http://vps-3961237-x.dattaweb.com');
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		next();
	});
}

app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/brands', brandRouter);
app.use('/api/promotions', promotionRouter);
app.use('/api/colors', colorRouter);

app.use((_, res) => {
	res.status(400).send({ message: 'Resource not found' });
});

await syncSchema();

const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`Server running at http://${process.env.APP_HOST}:${PORT}`);
});
