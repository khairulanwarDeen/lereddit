import { Field, InputType } from "type-graphql";

//import { EntityManager } from "@mikro-orm/mysql";
@InputType()
export class postInput {
    @Field()
    title: string;

    @Field()
    text: string;
}
