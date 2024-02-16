import { Entity, Collection, Property, OneToMany, Cascade, DoubleType, ManyToOne, ManyToMany } from "@mikro-orm/mysql";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Product } from "../product/product.entity.js";
import { ProductColor } from "../product/productColor.entity.js";

@Entity()
export class Color extends BaseEntity{

    @Property({nullable: false})
    name!: string

    @Property({nullable: true})
    background?: string

    @ManyToMany({entity: ()=> Product, mappedBy: pc=>pc.colors})
    products = new Collection<Product>(this)
}