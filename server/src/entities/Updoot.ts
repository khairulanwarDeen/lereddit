import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Post } from "./post";
import { User } from "./user";
// m to n
// many to many relationship
// users <-> post
// users -> updoot <- posts

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
    @Field()
    @Column()
    value: number;

    @Field()
    @PrimaryColumn()
    userId: number;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.updoots)
    user: User;

    @Field()
    @PrimaryColumn()
    postId: number;

    @Field(() => Post)
    @ManyToOne(() => Post, (post) => post.updoots)
    post: Post;
}

/*  for cascade syntax
    @Field(() => Post)
    @ManyToOne(() => Post, (post) => post.updoots, {
        onDelete: 'CASCADE'
    })
    post: Post;
 */
