import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/conn.orm.js';
import { rmSync } from 'fs';
import { Brand } from './brand.entity.js';
import { ZodError } from 'zod';
import { brandSchema } from './brand.schema.js';

const em = orm.em;

export function normalizeBrandInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.normalizeBrandInput = {
    name: req.body.name,
    logo: req.body.logo,
  };
  Object.keys(req.body.normalizeBrandInput).forEach((key) => {
    if (req.body.normalizeBrandInput[key] === undefined)
      delete req.body.normalizeBrandInput[key];
  });
  next();
}

export async function findAll(req: Request, res: Response) {
  try {
    const brands = await em.find(Brand, {});
    res.status(200).json({ message: 'Brands found.', data: brands });
  } catch (error: any) {
    res.status(500).json({
      message: 'Something went wrong while retrieving brands data.',
      error: error.message,
    });
  }
}

export async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const brand = await em.findOneOrFail(Brand, { id });
    res.status(200).json({ message: 'Brand found.', data: brand });
  } catch (error: any) {
    res.status(500).json({
      message: 'Something went wrong while retrieving brands data.',
      error: error.message,
    });
  }
}

export async function add(req: Request, res: Response) {
  try {
    brandSchema.parse(req.body.normalizeBrandInput);
    const brand = em.create(Brand, req.body.normalizeBrandInput);
    await em.flush();
    res
      .status(201)
      .json({ message: 'Brand successfully created.', data: brand });
  } catch (error: any) {
    if (error instanceof ZodError) {
      const { fieldErrors: errors } = error.flatten();
      res.status(500).json({ message: errors });
    }
    res.status(500).json({
      message: 'Something went wrong while adding a new brand.',
      error: error.message,
    });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const brandToUpdate = await em.findOneOrFail(Brand, { id });
    const assignedBrand = em.assign(
      brandToUpdate,
      req.body.normalizeBrandInput
    );
    brandSchema.parse(assignedBrand);
    await em.flush();
    res
      .status(201)
      .json({ message: 'Brand successfully updated.', data: brandToUpdate });
  } catch (error: any) {
    if (error instanceof ZodError) {
      const { fieldErrors: errors } = error.flatten();
      res.status(500).json({ message: errors });
    }
    res.status(500).json({
      message: 'Something went wrong while updating brand data.',
      error: error.message,
    });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const brand = em.getReference(Brand, id);
    try {
      await em.removeAndFlush(brand);
      res
        .status(200)
        .json({ message: `Brand with id=${id} successfully deleted.` });
    } catch (error: any) {
      if (
        error.code === 'ER_ROW_IS_REFERENCED_2' ||
        error.sqlState === '23000'
      ) {
        res.status(400).json({
          message: 'Unable to delete brand due to associated products',
        });
      } else {
        throw error;
      }
    }
  } catch (error: any) {
    res.status(500).json({
      message: 'Something went wrong while removing brand.',
      error: error.message,
    });
  }
}
