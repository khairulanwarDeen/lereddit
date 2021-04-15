import { User } from "../entities/user";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, Mutation, ObjectType, Resolver } from "type-graphql";
import argon2 from "argon2";

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


//having some issues with unique username here.
//in schema, it is unique, however, for some reason
// i can create a user with a username that already exists
/*
To fix in the future, to make the username unique
for now the workaround is to see if the user exist ke tak
Operation failed: There was an error while applying the SQL script to the database.
Executing:
ALTER TABLE `lireddit`.`user` 
ADD UNIQUE INDEX `username_UNIQUE` (`username` ASC) VISIBLE;
;

ERROR 1170: BLOB/TEXT column 'username' used in key specification without a key length
SQL Statement:
ALTER TABLE `lireddit`.`user` 
ADD UNIQUE INDEX `username_UNIQUE` (`username` ASC) VISIBLE
*/
@Resolver()
export class UserResolver {
    @Mutation(() => UserReponse)
    async register(
        @Arg("username") usernameInput:string,
        @Arg("password") passwordInput:string,
        @Ctx() { em }: MyContext
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
        try{
            
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