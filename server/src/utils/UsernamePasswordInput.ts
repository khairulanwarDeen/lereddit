import { Field, InputType } from "type-graphql";

//import { EntityManager } from "@mikro-orm/mysql";
@InputType()
export class UsernamePasswordInput {
    @Field()
    username: string;

    @Field()
    password: string;

    @Field()
    email: string;
}
