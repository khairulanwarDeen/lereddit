import moment from "moment";
import { User } from "../entities/user";
import { MyContext } from "src/types";
import { Arg, Ctx, FieldResolver, Int, Mutation, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { getConnection } from "typeorm";
import { Post } from "../entities/post";
import { Updoot } from "../entities/Updoot";
import { isAuth } from "../middleware/isAuth";
import { PaginatedPosts } from "../utils/PaginatedPosts";
import { postInput } from "../utils/postInput";

@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String)
    textSnippet(@Root() root: Post) {
        return (root.text.slice(0, 50) + "...");
    }

    @FieldResolver(() => User)
    creator(@Root() post: Post,
        @Ctx() { userLoader }: MyContext) {
        return userLoader.load(post.creatorId);
    }

    @FieldResolver(() => Int, { nullable: true })
    async voteStatus(@Root() post: Post,
        @Ctx() { updootLoader, req }: MyContext) {
        if (!req.session.userId) {
            return null;
        }
        const updoot = await updootLoader.load({ postId: post.id, userId: req.session.userId })
        return updoot ? updoot.value : null;
    }



    @Query(() => PaginatedPosts)
    async getposts(
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', () => String, { nullable: true }) cursor: string | null, //becasue the first time you fetch, cursor is null
        @Ctx() { req }: MyContext
    ): Promise<PaginatedPosts> {
        const realLimit = Math.min(100, limit)
        const realLimitPlusOne = realLimit + 1;
        let dateString: any = "";
        const replacements: any[] = [realLimitPlusOne];
        //const UseId = req.session.userId;


        if (cursor) {
            replacements.push(new Date(parseInt(cursor)))
            dateString = moment(new Date(parseInt(cursor))).format("YYYY-MM-DD HH:mm:ss.SSSSSS");
        }
        const limitation = realLimitPlusOne;
        const posts = await getConnection().query(
            `
          SELECT p.*
          FROM post p
          ${cursor ? `where p.createdAt < "${dateString}"` : ""}
          ORDER by p.createdAt DESC
          limit ${limitation}
          `,
        );
        //Without creatorId FieldResolver
        // if (cursor) {
        //     replacements.push(new Date(parseInt(cursor)))
        //     dateString = moment(new Date(parseInt(cursor))).format("YYYY-MM-DD HH:mm:ss.SSSSSS");
        // }
        // const limitation = realLimitPlusOne;
        // const posts = await getConnection().query(
        //     `
        //   SELECT p.*,
        //   ${req.session.userId ? `(select value from updoot where userId = ${UseId} and postId = p.id) voteStatus` : `null as "voteStatus"`}
        //   FROM post p
        //   ${cursor ? `where p.createdAt < "${dateString}"` : ""}
        //   ORDER by p.createdAt DESC
        //   limit ${limitation}
        //   `,
        // );

        //This query is without creator field resolver
        // const posts = await getConnection().query(
        //     `
        //   SELECT p.*,
        //   json_object(
        //     'id', u.id,
        //     'username', u.username,
        //     'email', u.email,
        //     'createdAt', u.createdAt,
        //     'updatedAt', u.updatedAt
        //   ) creator,
        //   ${req.session.userId ? `(select value from updoot where userId = ${UseId} and postId = p.id) voteStatus` : `null as "voteStatus"`}
        //   FROM post p
        //   inner join user u on u.id = p.creatorId
        //   ${cursor ? `where p.createdAt < "${dateString}"` : ""}
        //   ORDER by p.createdAt DESC
        //   limit ${limitation}
        //   `,
        // );
        //const posts = await getConnection().query("SELECT * FROM lireddit2.post WHERE id = @0", [374]);

        //take a look at this query. i think i can pass in params here, because im using mySql
        //query: SELECT `User`.`id` AS `User_id`, `User`.`createdAt` AS `User_createdAt`, `User`.`updatedAt` AS `User_updatedAt`, `User`.`username` AS `User_username`, `User`.`email` AS `User_email`, `User`.`password` AS `User_password` FROM `user` `User` WHERE `User`.`id` IN (?, ?, ?, ?, ?) -- PARAMETERS: [1,6,5,3,7]
        // const qb =
        //     getConnection()
        //         .getRepository(Post)
        //         .createQueryBuilder("p")
        //         .orderBy("createdAt", "DESC")
        //         .take(realLimitPlusOne)
        // // if (cursor) {
        // //     qb.where("createdAt < :cursor", { cursor: new Date(parseInt(cursor)) })
        // // }
        // const posts = await qb.getMany()

        // posts.forEach((index: { [x: string]: any; }) => {
        //     index["creator"] = JSON.parse(index["creator"])
        // });
        //console.log("posts: ", posts)
        return { posts: posts.slice(0, realLimit), hasMore: posts.length === realLimitPlusOne };
    }

    @Query(() => Post, { nullable: true })
    getpost(
        @Arg("id", () => Int) id: number
    ): Promise<Post | undefined> {
        const post = Post.findOne(id)
        return post;
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg("postInput") postInput: postInput,
        @Ctx() { req }: MyContext
    ): Promise<Post> {
        const userId = req.session.userId;
        return Post.create({ ...postInput, creatorId: userId }).save();
    }

    @Mutation(() => Post, { nullable: true }) //return types
    @UseMiddleware(isAuth)
    async updatePost(
        @Arg("id", () => Int) id: number,                                       //these are arguments
        @Arg("title") title: string, //this argument becomes optional. 
        @Arg("text") text: string,
        @Ctx() { req }: MyContext
        //but must explicitly show the expected type if there is one
    ): Promise<Post | undefined> {
        await getConnection()
            .createQueryBuilder()
            .update(Post)
            .set({ title, text })
            .where('id = :id and creatorId = :creatorId', {
                id,
                creatorId: req.session.userId,
            })
            //.returning("*")
            .execute();

        const post = await Post.findOne(id);
        return post;
    }

    @Mutation(() => Boolean) //return type
    @UseMiddleware(isAuth)
    async deletePost(
        @Arg("id", () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<Boolean> { // return type
        //not cascade way
        //this is more explicit. i like this
        const post = await Post.findOne(id);
        if (!post) {
            return false;
        }
        if (post.creatorId !== req.session.userId) {
            console.log("Not Authorized to delete this")
            throw new Error("Not Authorized");
        }
        await Updoot.delete({ postId: id })
        await Post.delete({ id })
        /*--------------------------------*/
        // // cascade way !! doestn work yet
        // // try get mysql to cascade delete through the updoot entitiy
        // await Post.delete({ id, creatorId: req.session.userId })
        return true;
    }

}