import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { COOKIE_NAME } from "./constants";
import microConfig from "./mikro-orm.config";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
//import { Post } from "./entities/post";
import { UserResolver } from "./resolvers/user";


const main = async () => {
    const orm = await MikroORM.init(microConfig);
    console.log("yo wurl");
    
    //the below command doesnt work for mysql
    //await orm.getMigrator().up();

    // const post = orm.em.create(Post, {title: 'my first post'});
    // await orm.em.persistAndFlush(post);
    //await orm.em.nativeInsert(Post, {title: 'my first post 2'}); //full of errors here

    // const posts = await orm.em.find(Post, {});
    // console.log(posts)
    const app = express();

    
    const RedisStore = connectRedis(session);
    const redis = new Redis();
    app.use(cors({
        origin: "http://localhost:3000",
        credentials: true
    }))
    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({ 
                client: redis,
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
        context: ({ req, res }) => ({ em: orm.em, req, res, redis })
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