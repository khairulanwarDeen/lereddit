import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";

import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
//import { Post } from "./entities/post";
import { UserResolver } from "./resolvers/user";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";
import cors from "cors";

const main = async () => {
    
    const orm = await MikroORM.init(microConfig);
    console.log("yo wurl");
    //await orm.getMigrator().up();

    // const post = orm.em.create(Post, {title: 'my first post'});
    // await orm.em.persistAndFlush(post);
    //await orm.em.nativeInsert(Post, {title: 'my first post 2'}); //full of errors here

    // const posts = await orm.em.find(Post, {});
    // console.log(posts)
    const app = express();

    
    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();
    app.use(cors({
        origin: "http://localhost:3000",
        credentials: true
    }))
    app.use(
        session({
            name: 'qid',
            store: new RedisStore({ 
                client: redisClient,
                disableTouch: true 
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 7,
                httpOnly: true, //cookie only works in http
                sameSite: 'lax',
                //secure: __prod__
            },
            saveUninitialized: false,
            secret: "keyboard cat",
            resave: false,
        })
      )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: ({ req, res }):MyContext => ({ em: orm.em, req, res })
    });
    apolloServer.applyMiddleware({ 
        app,
        //cors: { origin: "http://localhost:3000" },
        cors: false,
     });

    app.get('/', (_, res) => { // to ignore a variable you put the underscore '_'
        
        res.send("yo whatup");
    })

    app.listen(4000, () => {
        console.log('server start on localhost:4000')
    })
}
main().catch((err) => {
    console.error(err);
})