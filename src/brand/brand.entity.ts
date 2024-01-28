import { Entity, Collection, Property, OneToMany, Cascade } from "@mikro-orm/mysql";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Product } from "../product/product.entity.js";


@Entity()
export class Brand extends BaseEntity{
    
    @Property({nullable: false})
    name!: string

    @Property({nullable: true})
    logo?: Blob
    
    @OneToMany(()=> Product, (prod)=> prod.brand, {cascade: [Cascade.ALL]})
    products = new Collection<Product>(this)
}