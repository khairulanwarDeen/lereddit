import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";

import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { Post } from "./entities/post";

const main = async () => {
    
    const orm = await MikroORM.init(microConfig);
    console.log("yo wurl");
    await orm.getMigrator().up();

    // const post = orm.em.create(Post, {title: 'my first post'});
    // await orm.em.persistAndFlush(post);
    //await orm.em.nativeInsert(Post, {title: 'my first post 2'}); //full of errors here

    const posts = await orm.em.find(Post, {});
    console.log(posts)
    const app = express();
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver],
            validate: false,
        }),
        context: () => ({ em: orm.em })
    });
    apolloServer.applyMiddleware({ app });

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
console.log("yo wurl");