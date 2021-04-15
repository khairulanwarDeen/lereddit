import { __prod__ } from "./constants";
import { Post } from "./entities/post";
import { MikroORM } from "@mikro-orm/core";
import path from 'path';
import { User } from "./entities/user";

export default {
    migrations: {
        path: path.join(__dirname, "./migrations"), // path to the folder with migrations
        pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files
    },
    entities: [Post, User],
    dbName: "lireddit",
    debug: !__prod__,
    type: "mysql",
    password: "password"
} as Parameters<typeof MikroORM.init>[0];