import { Entity, Collection, Property, OneToMany, Cascade, Unique } from '@mikro-orm/mysql';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Product } from '../product/product.entity.js';

@Entity()
export class Category extends BaseEntity {
	@Property({ nullable: false })
	@Unique()
	name!: string;

	@Property({ nullable: true })
	description?: string;

	@OneToMany(() => Product, (prod) => prod.category, { cascade: [Cascade.ALL] })
	products = new Collection<Product>(this);
}
