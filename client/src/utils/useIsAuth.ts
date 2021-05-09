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
            //telling the router where to go after log in. in this case,
            //whatever pathname you currently are on before going to 
            ///login
            router.replace("/login?next=" + router.pathname);
        }
    }, [fetching, data, router]);
};