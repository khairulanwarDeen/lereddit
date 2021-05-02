import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
/**
 * Refer to 
 * https://typeorm.io/#/entities
 * for syntax
 */
@ObjectType()
@Entity()
export class User extends BaseEntity {
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
    @Column({ unique: true })
    username!: string;

    @Field() //you can comment this field out and it will not be exposed on the graphql server
    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

}

