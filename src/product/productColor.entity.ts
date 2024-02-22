import { Entity, Property, ManyToMany, ManyToOne, Collection, Cascade, Rel, t } from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Product } from './product.entity.js';
import { Color } from '../color/color.entity.js';

@Entity()
export class ProductColor {
	@ManyToOne(() => Product, { primary: true })
	product!: Rel<Product>;

	@ManyToOne(() => Color, { primary: true })
	color!: Rel<Color>;

	@Property({ default: 0, nullable: false })
	stock!: number;

	@Property({ default: '[]', nullable: false })
	images_url?: string;
}
