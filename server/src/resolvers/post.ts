import { MyContext } from "src/types";
import { PaginatedPosts } from "../utils/PaginatedPosts";
import { Arg, Ctx, FieldResolver, Int, Mutation, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { getConnection } from "typeorm";
import { Post } from "../entities/post";
import { isAuth } from "../middleware/isAuth";
import { postInput } from "../utils/postInput";
import moment from "moment";

@Resolver(Post)
export class PostResolver {


    @FieldResolver(() => String)
    textSnippet(@Root() root: Post) {
        return (root.text.slice(0, 50) + "...");
    }

    @Query(() => PaginatedPosts)
    async getposts(
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', () => String, { nullable: true }) cursor: string | null //becasue the first time you fetch, cursor is null
    ): Promise<PaginatedPosts> {
        const realLimit = Math.min(100, limit)
        const realLimitPlusOne = realLimit + 1;
        let dateString: any = "";
        const replacements: any[] = [realLimitPlusOne];


        //for some reason this doesnt fucking work
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
        //const posts = await getConnection().query("SELECT * FROM lireddit2.post WHERE id = @0", [374]);

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
        console.log("posts: ", posts)
        return { posts: posts.slice(0, realLimit), hasMore: posts.length === realLimitPlusOne };
    }

    @Query(() => Post, { nullable: true })
    getpost(
        @Arg("id") id: number
    ): Promise<Post | undefined> {
        return Post.findOne(id);
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
    async updatePost(
        @Arg("id") id: number,                                       //these are arguments
        @Arg("title", () => String, { nullable: true }) title: string, //this argument becomes optional. 
        //but must explicitly show the expected type if there is one
    ): Promise<Post | null> {
        const post = await Post.findOne({ where: { id } })
        if (!post) {
            return null;
        }
        if (typeof title !== undefined) {
            post.title = title;
            await Post.update({ id }, { title }) //updating based on that id. updating with a new title
        }
        return post;
    }

    @Mutation(() => Boolean) //return type
    async deletePost(
        @Arg("id") id: number
    ): Promise<Boolean> { // return type
        const post = await Post.findOne({ where: { id } })
        if (!post) {
            return false;
        }
        await Post.delete(id)
        return true;
    }

}