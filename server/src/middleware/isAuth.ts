import { MyContext } from "src/types";
import { MiddlewareFn } from "type-graphql";
/**
 * This is a middleware function. It will run before your resolver. Any type of
 *  logic can be used here.
 * This function checks if user is currently logged before carrying out various
 *  activities
 * @param1 param0
 *  
 * @param2 next 
 * @returns next
 */
export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
    if (!context.req.session.userId) {
        throw new Error("not Authenticated");
    }

    return next();
}