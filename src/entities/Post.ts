import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Post{
    @Field()
    @PrimaryKey()
    id!: number;

    @Field(() => String)
    @Property({ type: "date" })
    createdAt = new Date();

    @Field(() => String)
    @Property({ type:"date", onUpdate: () => new Date() })
    updatedAt = new Date();

    @Field()
    @Property()
    title!: string;

}

/*
This is just a class of the post. It is not a graphql type
*/ 
// @Entity()
// export class Post{
//     @PrimaryKey()
//     id!: number;

//     @Property({ type: "date" })
//     createdAt = new Date();

//     @Property({ type:"date", onUpdate: () => new Date() })
//     updatedAt = new Date();

//     @Property()
//     title!: string;

// }