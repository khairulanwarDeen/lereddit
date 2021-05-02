import { User } from "../entities/user";
import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "../utils/UsernamePasswordInput";
import { validatePassword, validateRegister } from "../utils/validateRegister";
import { sendMail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { getConnection } from "typeorm";

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    const errors = validatePassword(newPassword);
    if (errors) {
      return { errors };
    }
    const key = FORGET_PASSWORD_PREFIX + token
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [{
          field: "token",
          message: "token expired"
        }]
      }
    }
    const userIdNum = parseInt(userId);
    const hashedPassword = await argon2.hash(newPassword);
    const user = await User.findOne(userIdNum);

    if (!user) {
      return {
        errors: [{
          field: "token",
          message: "user no longer exists"
        }]
      }
    }
    await User.update({ id: userIdNum }, {
      password: hashedPassword
    });
    await redis.del(key);
    //this logs in the user after changing the password
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    console.log("account: " + email)
    const user = await User.findOne({ where: { email } });//must do it this way because it is not the primary key
    if (!user) {
      /** you do not want to say whether the email
       * exists or not. that way they cannot phish
       * through the user's email to see if they exist or not
       */
      console.log("account doesnt exist")
      return true;
    }
    const token = v4();
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 3
    );
    await sendMail(
      email,
      `<a href ="http://localhost:3000/changePassword/${token}">reset password</a>`
    );
    return true;
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    return User.findOne(req.session.userId); //returning the promise of the user
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }
    const hashedPassword = await argon2.hash(options.password);
    //let user;
    try {
      /**
       * There are two ways of doing this
       * 1) use TypeOrm create
       * 2) use TypeOrm QueryBuilder
       */

      /**
       * User.create({username: options.username,
          email: options.email,
          password: hashedPassword}).save()
       */

      const result = await getConnection().createQueryBuilder().insert().into(User).values(
        {
          username: options.username,
          email: options.email,
          password: hashedPassword
        }
      ).execute();

      console.log('result' + result.generatedMaps);
      //user = result;
      //user = result.raw[0];
    }
    //let user;
    // try {
    //   // const [result] = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert({
    //   //     username: usernameInput,
    //   //     password: hashedPassword,
    //   //     created_at: new Date(),
    //   //     updated_at: new Date()
    //   // }).returning("*");
    //   // user = result[0];

    //   /** this persist and flush stuff works well here */
    //   await em.persistAndFlush(user);
    // 


    catch (err) {
      console.log("err: " + err)
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


    const emailInput = options.email;
    /**
     * return doesnt work for mysql
     * so i had to do it manually here. fichdish
     */
    const user = await User.findOne({ where: { email: emailInput } });
    req.session.userId = user?.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOremail") usernameOremail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOremail.includes("@")
        ? { where: { email: usernameOremail } }
        : { where: { username: usernameOremail } }

    );
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOremail",
            message: "Username or Email does not exist",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Password is incorrect",
          },
        ],
      };
    }

    req.session.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}
