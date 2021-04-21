import { User } from "../entities/user";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from "argon2";
import { COOKIE_NAME } from "../constants";
import { UsernamePasswordInput } from "../utils/UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
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

    @Mutation(() => Boolean)
    async forgotPassword(
        //@Arg('email') email:string,
        //@Ctx(){em}:MyContext
    ) {
        //const user = await em.findOne(User, { email });
        return true;
    }

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
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserReponse> {
        const errors = validateRegister(options);
        if (errors){
            return {errors};
        }
        const hashedPassword = await argon2.hash(options.password);
        const user = em.create(User, {username: options.username, password: hashedPassword, email:options.email});
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
        @Arg("usernameOremail") usernameOremail: string,
        @Arg("password") password: string,
        @Ctx() { em, req }: MyContext
    ): Promise<UserReponse> {
        const user = await em.findOne(
            User,
            usernameOremail.includes("@") ? {email: usernameOremail} : {username: usernameOremail}
        );
        if (!user){
            return {
                errors: [
                    {
                        field: "usernameOremail",
                        message: "Username or Email does not exist"
                    }
                ]
            }
        }
        

        const valid = await argon2.verify(user.password, password);
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
    
    @Mutation(() => Boolean)
    logout(
        @Ctx() {req, res}: MyContext
    ) {
        
        return new Promise(resolve=> req.session.destroy(err=> {
            res.clearCookie(COOKIE_NAME);
            if(err) {
               console.log(err);
               resolve(false);
               return;
            }
            resolve(true);
        }))
    }

}