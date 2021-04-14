import { User } from "../entities/user";
import { MyContext } from "src/types";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import argon2 from "argon2";

@Resolver()
export class UserResolver {
    @Mutation(() => User)
    async register(
        @Arg("username") usernameInput:string,
        @Arg("password") passwordInput:string,
        @Ctx() { em }: MyContext
    ): Promise<User> {
        const hashedPassword = await argon2.hash(passwordInput);
        const user = em.create(User, {username: usernameInput, password: hashedPassword});
        await em.persistAndFlush(user);
        return user;
    }

}