import { Post } from "../entities/post";
import { Arg, Mutation, Query, Resolver } from "type-graphql";


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
    async createPost(
        @Arg("title") title: string
    ): Promise<Post> {
        return Post.create({ title }).save();
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