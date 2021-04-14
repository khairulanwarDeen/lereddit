import { Post } from "../entities/post";
import { MyContext } from "src/types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";


@Resolver()
export class PostResolver {
    @Query(() => [Post])
    getposts(
        @Ctx() {em}: MyContext): Promise<Post[]>{     
        return em.find(Post, {});
    }

    @Query(() => Post, {nullable: true})
    getpost(
        @Arg("id") id:number,
        @Ctx() { em }: MyContext
    ): Promise<Post | null> {
        return em.findOne(Post, { id });
    }

    @Mutation(() => Post)
    async createPost(
        @Arg("title") title:string,
        @Ctx() { em }: MyContext
    ): Promise<Post> {
        const post = em.create(Post, {title});
        await em.persistAndFlush(post);
        return post;
    }

    @Mutation(() => Post, {nullable: true}) //return types
    async updatePost(
        @Arg("id") id:number,                                       //these are arguments
        @Arg("title", () => String, {nullable: true}) title:string, //this argument becomes optional. 
                                                                    //but must explicitly show the expected type if there is one
        @Ctx() { em }: MyContext                          
    ): Promise<Post | null> {
        const post = await em.findOne(Post, {id})
        if (!post){
            return null;
        }
        if( typeof title !== undefined){
            post.title = title;
            await em.persistAndFlush(post);
        }
        return post;
    }

}