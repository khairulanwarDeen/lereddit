import { Box, Heading } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import EditDeletePostButtons from "../../components/EditDeletePostButtons";
import { Layout } from "../../components/layout";
import { useGetpostQuery, useMeQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";

export const Post = ({}) => {
  const router = useRouter();
  const [{ data: meData }] = useMeQuery();
  const intId =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
  const [{ data, error, fetching }] = useGetpostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });
  if (fetching) {
    return <Layout>Loading ...</Layout>;
  }
  if (error) {
    return <div>{error.message}</div>;
  }
  if (!data?.getpost) {
    return <Layout>Post does not exist</Layout>;
  }
  return (
    <Layout>
      <Heading>{data.getpost.title}</Heading>
      <Box mb={4}>{data.getpost.text}</Box>
      {meData?.me?.id === data.getpost.creator.id ? (
        <Box marginBottom={10}>
          <EditDeletePostButtons id={data.getpost.id} />
        </Box>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
