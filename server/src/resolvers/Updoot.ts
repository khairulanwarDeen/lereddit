import { Updoot } from "../entities/Updoot";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "src/types";
import { Mutation, UseMiddleware, Arg, Int, Ctx, Resolver } from "type-graphql";
import { getConnection } from "typeorm";

/**
 * @author Khairul Anwar Bin Sharifuddeen
 * @abstract Allows user to vote, you may need to do transaction and commit if you are on postgresql
 * also mysql doesnt have nay rules on camelCases
 * 
 * @param postId: Which post to select
 * @param value: 1 to upvote, -1 to downvote
 * To do an upvote
 * @example 
 * mutation{
  vote(value:1, postId:442)
    }
 */

@Resolver()
export class UpdootResolver {
    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg('postId', () => Int) postId: number,
        @Arg('value', () => Int) value: number,
        @Ctx() { req }: MyContext
    ) {
        const { userId } = req.session
        const isUpDoot = value !== -1;
        const realValue = isUpDoot ? 1 : -1;
        await Updoot.insert({
            userId,
            postId,
            value: realValue
        })
        await getConnection().query(`
        update post 
        set points = points + ${realValue}
        where id = ${postId};
        `);
        return true;
    }
}