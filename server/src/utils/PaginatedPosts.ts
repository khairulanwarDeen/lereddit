import { Field, ObjectType } from "type-graphql";
import { Post } from "../entities/post";


@ObjectType()
export class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[];
    @Field()
    hasMore: boolean;
}
