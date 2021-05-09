import { withUrqlClient } from "next-urql";
import React from "react";
import { Layout } from "../components/layout";
import { useGetPostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from "next/link";
import { Box, Heading, Link, Text, Stack, Flex } from "@chakra-ui/react";

const Index = () => {
  const limit = 15;
  const [{ data }] = useGetPostsQuery({
    variables: {
      limit: limit,
    },
  });
  return (
    <Layout>
      <Flex align={"center"}>
        <Heading>LeRed</Heading>
        <NextLink href="/create-post">
          <Link color="black" ml={"auto"}>
            Create A Post
          </Link>
        </NextLink>
      </Flex>

      <div>Latest post from the limit of: {limit}</div>
      <br />
      {!data ? (
        <div>Loading...</div>
      ) : (
        <Stack spacing={8}>
          {data.getposts.map((p) => (
            <Box key={p.id} p={5} shadow="md" borderWidth="1px">
              <Heading fontSize="large">{p.title}</Heading>
              <Text mt={4}>{p.textSnippet}</Text>
            </Box>
          ))}
        </Stack>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
