import { Entity, Property, ManyToMany, ManyToOne, Collection, Cascade, Rel, t, Unique } from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Category } from '../category/category.entity.js';
import { Brand } from '../brand/brand.entity.js';
import { Promotion } from '../promotion/promotion.entity.js';
import { Color } from '../color/color.entity.js';
import { ProductColor } from './productColor.entity.js';

@Entity()
export class Product extends BaseEntity {
	@Property({ nullable: false })
	@Unique()
	name!: string;

	@Property({ nullable: true })
	description?: string;

	@Property({ nullable: false, unsigned: true })
	price!: number;

	@ManyToOne(() => Category, { nullable: false })
	category!: Rel<Category>;

	@ManyToOne(() => Brand, { nullable: false })
	brand!: Rel<Brand>;

	@ManyToMany(() => Promotion, (promo) => promo.products, { cascade: [Cascade.ALL], owner: true })
	promotions!: Promotion[];

	@ManyToMany({ entity: () => Color, pivotEntity: () => ProductColor })
	colors = new Collection<Color>(this);
}
