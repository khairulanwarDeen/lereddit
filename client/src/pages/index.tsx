import { withUrqlClient } from "next-urql";
import React, { useState } from "react";
import { Layout } from "../components/layout";
import { useGetPostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from "next/link";
import {
  Box,
  Heading,
  Link,
  Text,
  Stack,
  Flex,
  Button,
} from "@chakra-ui/react";

const Index = () => {
  const limitNo = 2;
  const [variables, setVariables] = useState({
    limit: limitNo,
    cursor: null as null | string,
  });

  console.log(variables);

  const [{ data, fetching }] = useGetPostsQuery({
    variables,
  });
  if (!fetching && !data) {
    return <div>There is no data for some reason</div>;
  }
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

      <div>Latest post from the limit of: {variables.limit}</div>
      <br />
      {fetching && !data ? (
        <div>Loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.getposts.map((p) => (
            <Box key={p.id} p={5} shadow="md" borderWidth="1px">
              <Heading fontSize="large">{p.title + p.id}</Heading>
              <Text mt={4}>{p.textSnippet}</Text>
            </Box>
          ))}
        </Stack>
      )}
      {data ? (
        <Flex>
          <Button
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.getposts[data.getposts.length - 1].createdAt,
              });
            }}
            isLoading={fetching}
            m="auto"
            my={8}
          >
            Load More
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
