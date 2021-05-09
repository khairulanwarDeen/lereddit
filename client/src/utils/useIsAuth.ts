import router from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";

export const useIsAuth = () => {
    const [{ data, fetching }] = useMeQuery();
    /**
     * Challenge!
     * Create a loading visual while fetching the meQuery
     */
    useEffect(() => {
        if (!fetching && !data?.me) {
            router.replace("/login");
        }
    }, [fetching, data, router]);
};