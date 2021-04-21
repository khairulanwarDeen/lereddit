import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class User{
    @Field()
    @PrimaryKey()
    id!: number;

    @Field(() => String)
    @Property({ type: "date" })
    createdAt = new Date();

    @Field(() => String)
    @Property({ type:"date", onUpdate: () => new Date() })
    updatedAt = new Date();

    @Field() //you can comment this field out and it will not be exposed on the graphql server
    @Property({type: "text", unique: true})
    username!: string;

    @Field() //you can comment this field out and it will not be exposed on the graphql server
    @Property({type: "text", unique: true})
    email!: string;

    @Property({type: "text"})
    password!: string;

}

