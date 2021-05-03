import { Post } from "../entities/post";
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { postInput } from "../utils/postInput";
import { MyContext } from "src/types";
import { isAuth } from "../middleware/isAuth";


@Resolver()
export class PostResolver {
    @Query(() => [Post])
    async getposts(): Promise<Post[]> {
        return Post.find();
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