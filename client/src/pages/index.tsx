import { withUrqlClient } from "next-urql";
import React from "react";
import { Layout } from "../components/layout";
import { useGetPostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from "next/link";
import { Link } from "@chakra-ui/react";

const Index = () => {
  const limit = 4;
  const [{ data }] = useGetPostsQuery({
    variables: {
      limit: limit,
    },
  });
  return (
    <Layout>
      <NextLink href="/create-post">
        <Link color="black" mr={2}>
          Create A Post
        </Link>
      </NextLink>
      <div>Latest post from the limit of: {limit}</div>
      <br />
      {!data ? (
        <div>Loading...</div>
      ) : (
        data.getposts.map((p) => <div key={p.id}>{p.title}</div>)
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
