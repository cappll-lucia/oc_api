import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/conn.orm.js';
import { Product } from './product.entity.js';
import { ProductColor } from './productColor.entity.js';
import { productSchema } from './product.schema.js';
import { ZodError } from 'zod';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (err: Error | null, destination: string) => void
  ) => {
    cb(null, 'uploads/products');
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (err: Error | null, filename: string) => void
  ) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const em = orm.em;
const upload = multer({ storage: storage });

export function normalizeProductInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.normalizeProductInput = {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    brand: req.body.brand,
    promotions: req.body.promotions,
    colors: req.body.colors,
  };
  Object.keys(req.body.normalizeProductInput).forEach((key) => {
    if (req.body.normalizeProductInput[key] === undefined)
      delete req.body.normalizeProductInput[key];
  });
  next();
}

export async function findAll(req: Request, res: Response) {
  try {
    const products = await em.find(
      Product,
      {},
      { populate: ['colors.name', 'promotions'] }
    );
    res.status(200).json({ message: 'Products found.', data: products });
  } catch (error: any) {
    res.status(500).json({
      message: 'Something went wrong while retrieving products data.',
      error: error.message,
    });
  }
}

export async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const product = await em.findOneOrFail(
      Product,
      { id },
      { populate: ['colors', 'promotions'] }
    );
    res.status(200).json({ message: 'Product found.', data: product });
  } catch (error: any) {
    res.status(500).json({
      message: 'Something went wrong while fetching product data.',
      error: error.message,
    });
  }
}

export async function getProductColorData(req: Request, res: Response) {
  try {
    const prodId = Number.parseInt(req.params.prodId);
    const colorId = Number.parseInt(req.params.colorId);
    const qb = orm.em.createQueryBuilder(ProductColor);
    qb.select(['stock', 'images_url']).where({
      product: prodId,
      color: colorId,
    });
    const data = await qb.execute();
    data[0].images_url = JSON.parse(data[0].images_url);
    res
      .status(200)
      .json({ message: 'ProductColor data found.', data: data[0] });
  } catch (error: any) {
    res.status(500).json({
      message: 'Something went wrong while fetching product data.',
      error: error.message,
    });
  }
}

export async function add(req: Request, res: Response) {
  try {
    productSchema.parse({
      ...req.body.normalizeProductInput,
      brand: { id: req.body.normalizeProductInput.brand },
      category: { id: req.body.normalizeProductInput.category },
    });
    const product = await em.create(Product, req.body.normalizeProductInput);
    await em.flush();
    res
      .status(201)
      .json({ message: 'Product successfully created.', data: product });
  } catch (error: any) {
    if (error instanceof ZodError) {
      const { fieldErrors: errors } = error.flatten();
      res.status(500).json({ message: errors });
    }
    res.status(500).json({
      message: 'Something went wrong while adding a new product.',
      error: error.message,
    });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const productToUpdate = await em.findOneOrFail(Product, { id });
    const assignedProduct = em.assign(
      productToUpdate,
      req.body.normalizeProductInput
    );
    await productToUpdate.colors.load();
    productSchema.parse({
      ...assignedProduct,
      colors: assignedProduct.colors.getItems().map((color: any) => color.id),
    });
    await em.flush();
    res.status(201).json({
      message: 'Product successfully updated.',
      data: productToUpdate,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      const { fieldErrors: errors } = error.flatten();
      res.status(500).json({ message: errors });
    }
    res.status(500).json({
      message: 'Something went wrong while updating product data.',
      error: error.message,
    });
  }
}

export async function updateStock(req: Request, res: Response) {
  try {
    const prodId = Number.parseInt(req.params.prodId);
    const colorId = Number.parseInt(req.params.colorId);
    const qb = orm.em.createQueryBuilder(ProductColor);
    qb.update({ stock: req.body.stock }).where({
      product: prodId,
      color: colorId,
    });
    await qb.execute();
    res.status(201).json({
      message: 'Product-color stock successfully updated.',
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Something went wrong while updating product-color stock.',
      error: error.message,
    });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const product = await em.findOneOrFail(
      Product,
      { id },
      { populate: ['colors'] }
    );
    if (product.colors.count() > 0) {
      await em.nativeDelete(ProductColor, { product });
    }
    em.removeAndFlush(product);
    res
      .status(200)
      .json({ message: `Product with id=${id} successfully deleted.` });
  } catch (error: any) {
    res.status(500).json({
      message: 'Something went wrong while removing product.',
      error: error.message,
    });
  }
}

export const uploadProductImageMiddleware = upload.single('image');
export async function uploadProductImage(req: Request, res: Response) {
  try {
    const prodId = Number.parseInt(req.params.prodId);
    const colorId = Number.parseInt(req.params.colorId);
    const qb = orm.em.createQueryBuilder(ProductColor);
    qb.select('images_url').where({ product: prodId, color: colorId });
    const image_url_result = await qb.execute();
    const image_url_list = JSON.parse(image_url_result[0].images_url);
    image_url_list.push(req.file?.filename);
    const qb2 = orm.em.createQueryBuilder(ProductColor);
    qb2.update({ images_url: JSON.stringify(image_url_list) }).where({
      product: prodId,
      color: colorId,
    });
    await qb2.execute();
    res.status(201).json({
      message: 'Product image successfully uploaded.',
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Something went wrong while uploading product image',
      error: error.message,
    });
  }
}

export async function getImageFile(req: Request, res: Response) {
  try {
    const imageName = req.params.imageName;
    const path = `/uploads/products/${imageName}`;
    res.sendFile(path, { root: '.' });
  } catch (error: any) {
    res.status(500).json({
      message: 'Something went wrong while getting product image',
      error: error.message,
    });
  }
}
