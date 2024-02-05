import { Entity, Collection, Property, DoubleType, DateType, ManyToMany, Filter } from "@mikro-orm/mysql";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Product } from "../product/product.entity.js";

@Filter({name: 'ongoingPromos', cond: args=> ({
    validFrom: {$lte: args.now},
    validUntil: {$gte: args.now}
}) })
@Filter({name: 'ongoingPromosForPoduct', cond: args => ({
    validFrom: {$lte: args.now},
    validUntil: {$gte: args.now},
})})
@Entity()
export class Promotion extends BaseEntity{

    @Property({nullable: false})
    title!: string

    @Property({nullable: true})
    description?: string

    @Property({type: DateType, nullable: false})
    validFrom!: DateType

    @Property({type: DateType, nullable: false})
    validUntil!: DateType

    @Property({nullable: true})
    discountPercent?: DoubleType 
    
    @Property({nullable: true})
    banner?: Blob

    @ManyToMany(()=> Product, (prod)=>prod.promotions   )
    products = new Collection<Product>(this)
}




