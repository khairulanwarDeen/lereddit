//import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { COOKIE_NAME } from "./constants";
import { Post } from "./entities/post";
import { Updoot } from "./entities/Updoot";
import { User } from "./entities/user";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UpdootResolver } from "./resolvers/Updoot";
//import { Post } from "./entities/post";
import { UserResolver } from "./resolvers/user";
import { createUserLoader } from "./utils/createUserLoader";


const main = async () => {

    const conn = await createConnection({
        /**
         * apprently for mysql, 
         * the table has to be made before hand,
         * whereas in postgres, it doesnt have to
         */
        type: "mysql",
        database: "lireddit2",
        username: "root",
        password: "password",
        logging: true,
        synchronize: true,
        //migrations: [path.join(__dirname, "./migrations/*")],
        entities: [Post, User, Updoot]
    });
    //await conn.runMigrations();


    console.log("conn.isconnected: " + conn.isConnected)
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
            resolvers: [HelloResolver, PostResolver, UserResolver, UpdootResolver],
            validate: false,
        }),
        context: ({ req, res }) => ({ req, res, redis, userLoader: createUserLoader() })
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