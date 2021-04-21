import { withUrqlClient } from "next-urql";
import { NavBar } from "../components/NavBar"
import { useGetPostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient"

const Index = () => {
    const [{ data }] = useGetPostsQuery();
    return (
        <>
            <NavBar />
            <div>hblowurls</div>
            <br />
            {!data ? <div>Loading...</div> : data.getposts.map((p) => <div key={p.id}>{p.title}</div>)}
        </>
    );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
