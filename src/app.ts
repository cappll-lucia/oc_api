import 'reflect-metadata';
import express from 'express';
import { orm, syncSchema } from './shared/db/conn.orm.js';
import { RequestContext } from '@mikro-orm/core';
import { productRouter } from './product/product.routes.js';
import { promotionRouter } from './promotion/promotion.routes.js';
import { colorRouter } from './color/color.routes.js';
import { categoryRouter } from './category/category.routes.js';
import { brandRouter } from './brand/brand.routes.js';



const app = express();

app.use(express.json());

app.use((req, res, next)=>{
    RequestContext.create(orm.em, next);
})

app.use('/api/products', productRouter); 
app.use('/api/categories', categoryRouter); 
app.use('/api/brands', brandRouter); 
app.use('/api/promotions', promotionRouter); 
app.use('/api/colors', colorRouter); 

app.use((_, res)=>{
    res.status(404).send({message: 'Resource not found'});
})

await syncSchema();

const PORT = 3000;
app.listen(PORT, ()=>{
    console.log(`Server running at http://localhost:${PORT}`)
})