import { Entity, Property, ManyToMany, ManyToOne, Collection, Cascade, Rel, t } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Category } from "../category/category.entity.js";
import { Brand } from "../brand/brand.entity.js";
import { Promotion } from "../promotion/promotion.entity.js";
import { Color } from "../color/color.entity.js";

@Entity()
export class Product extends BaseEntity{

    @Property({nullable: false})
    name!: string

    @Property({nullable: true})
    description?: string

    @Property({nullable: false})
    price!: number

    @Property({nullable: false})
    stock!: number

    @ManyToOne(()=> Category, {nullable: false})
    category!: Rel<Category>

    @ManyToOne(()=> Brand, {nullable: false})
    brand!: Rel<Brand>

    @ManyToMany(()=> Promotion, (promo)=>promo.products, {cascade: [Cascade.ALL] ,owner: true})
    promotions!: Promotion[]

    @ManyToMany(()=> Color, (color)=> color.products, {cascade: [Cascade.ALL], owner: true})
    colors!: Color[]
}