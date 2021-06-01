import DataLoader from "dataloader";
import { Updoot } from "../entities/Updoot";

/**
 * @author Anwar
 * @description Return the updoots based on the keys being UserId and PostId
 * That means that the keys are going to be objects
 * @returns Objects that corresponds to postId and User Ids passed in to the dataloader
 * null because the user may not have upvoted that post
 */
export const createUpdootLoader = () =>
    new DataLoader<{ postId: number; userId: number | undefined }, Updoot | null>(async keys => {
        const updoots = await Updoot.findByIds(keys as any);
        const updootIdsToUpdoot: Record<string, Updoot> = {};
        updoots.forEach((updoot) => {
            updootIdsToUpdoot[`${updoot.userId} | ${updoot.postId}`] = updoot;
        })

        return keys.map((key) => updootIdsToUpdoot[`${key.userId} | ${key.postId}`])
    });