import { User } from "../entities/user";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from "argon2";
//import { EntityManager } from "@mikro-orm/mysql";

@ObjectType()
class FieldError{
    @Field()
    field: string;

    @Field()
    message: string;
}

@ObjectType()
class UserReponse{
    @Field(()=> [FieldError], {nullable: true})
    errors?: FieldError[]

    @Field(() => User, {nullable: true})
    user?: User
}


@Resolver()
export class UserResolver {

    @Query(() => User, {nullable: true})
    async me(
        @Ctx() { req, em }: MyContext
        ) {
        if (!req.session.userId) {
            return null;
        }
        const user = await em.findOne(User, {id: req.session.userId});
        return user;
        
    }

    @Mutation(() => UserReponse)
    async register(
        @Arg("username") usernameInput:string,
        @Arg("password") passwordInput:string,
        @Ctx() { em, req }: MyContext
    ): Promise<UserReponse> {
        if(usernameInput.length < 1){
            return {
                errors: [{
                    field: "username",
                    message: "username must have at least one character",
                }],
            };
        }
        
        // const checkUsername = await em.findOne(User, {username: usernameInput})
        // if (checkUsername){
        //     return{
        //         errors:[{
        //             field: "username",
        //             message: "This username already exists",
        //         }]
        //     };
        // }
        if(passwordInput.length < 1){
            return {
                errors: [{
                    field: "password",
                    message: "password must have at least one character",
                }],
            };
        }
        const hashedPassword = await argon2.hash(passwordInput);
        const user = em.create(User, {username: usernameInput, password: hashedPassword});
        //let user;
        try{
            // const [result] = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert({
            //     username: usernameInput,
            //     password: hashedPassword,
            //     created_at: new Date(),
            //     updated_at: new Date()
            // }).returning("*");
            // user = result[0];

            /** this persist and flush stuff works well here */
            await em.persistAndFlush(user);
        } catch(err) {
            if (err.code === "ER_DUP_ENTRY") {
                return {
                  errors: [
                    {
                      field: "username",
                      message: "username already taken",
                    },
                  ],
                };
              }
        }

        req.session.userId = user.id;
        
        return {user};
    }

    @Mutation(() => UserReponse)
    async login(
        @Arg("username") usernameInput:string,
        @Arg("password") passwordInput:string,
        @Ctx() { em, req }: MyContext
    ): Promise<UserReponse> {
        const user = await em.findOne(User, {username: usernameInput});
        if (!user){
            return {
                errors: [{
                    field: "username",
                    message: "username does not exist",
                }],
            };
        }

        const valid = await argon2.verify(user.password, passwordInput);
        if (!valid){
            return {
                errors: [{
                    field: "password",
                    message: "Password is incorrect"
                }]
            }
        }

        req.session.userId = user.id;

        return {
            user,
        };
        
    }

}