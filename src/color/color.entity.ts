import { Entity, Collection, Property, OneToMany, Cascade, DoubleType, ManyToOne, ManyToMany } from "@mikro-orm/mysql";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Product } from "../product/product.entity.js";

@Entity()
export class Color extends BaseEntity{

    @Property({nullable: false})
    name!: string

    @Property({nullable: true})
    background?: string

    @ManyToMany(()=> Product, (prod)=>prod.colors   )
    products = new Collection<Product>(this)

}