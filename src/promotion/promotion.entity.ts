import { Entity, Collection, Property, DoubleType, DateType, ManyToMany, Filter, Unique } from '@mikro-orm/mysql';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Product } from '../product/product.entity.js';

@Filter({
	name: 'ongoingPromos',
	cond: (args) => ({
		validFrom: { $lte: args.now },
		validUntil: { $gte: args.now },
	}),
})
@Filter({
	name: 'ongoingPromosForPoduct',
	cond: (args) => ({
		validFrom: { $lte: args.now },
		validUntil: { $gte: args.now },
	}),
})
@Entity()
export class Promotion extends BaseEntity {
	@Property({ nullable: false })
	@Unique()
	title!: string;

	@Property({ nullable: true })
	description?: string;

	@Property({ type: DateType, nullable: false })
	validFrom!: DateType;

	@Property({ type: DateType, nullable: false })
	validUntil!: DateType;

	@Property({ nullable: true, unsigned: true })
	discountPercent?: DoubleType;

	@Property({ default: '[]', nullable: false })
	banner_url!: string;

	@ManyToMany(() => Product, (prod) => prod.promotions)
	products = new Collection<Product>(this);
}
