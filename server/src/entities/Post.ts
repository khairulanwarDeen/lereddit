import { Field, ObjectType } from "type-graphql";
import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Entity, BaseEntity, ManyToOne, OneToMany } from "typeorm";
import { Updoot } from "./Updoot";
import { User } from "./user";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;

    @Field() //you can comment this field out and it will not be exposed on the graphql server
    @Column() //you may or may want to explicity declare the type here "@Column({type: "text"})"
    title!: string;

    @Field()
    @Column({ type: "longtext" })
    text!: string;

    @Field()
    @Column({ type: "int", default: 0 })
    points!: number;

    @Field()
    @Column()
    creatorId: number;

    @Field()
    @ManyToOne(() => User, (user) => user.posts)
    creator: User;

    @OneToMany(() => Updoot, (updoot) => updoot.post)
    updoots: Updoot[];

}

/*
This is just a class of the post. It is not a graphql type
*/
// @Entity()
// export class Post{
//     @PrimaryKey()
//     id!: number;

//     @Property({ type: "date" })
//     createdAt = new Date();

//     @Property({ type:"date", onUpdate: () => new Date() })
//     updatedAt = new Date();

//     @Property()
//     title!: string;

// }