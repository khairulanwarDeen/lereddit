import { useGetpostQuery } from "../generated/graphql";
import { useGetIntId } from "./useGetIntId";

export const useGetPostFromUrl = () => {
        const intId = useGetIntId();
        return useGetpostQuery({
                pause: intId === -1,
                variables: {
                        id: intId,
                },
        });
}