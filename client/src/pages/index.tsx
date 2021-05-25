import { DeleteIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React, { useState } from "react";
import { Layout } from "../components/layout";
import { UpdootSection } from "../components/UpdootSection";
import { useDeletePostMutation, useGetPostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const limitNo = 100;
  const [variables, setVariables] = useState({
    limit: limitNo,
    cursor: null as null | string,
  });

  const [, deletePost] = useDeletePostMutation();

  console.log(variables);

  const [{ data, fetching }] = useGetPostsQuery({
    variables,
  });
  if (!fetching && !data) {
    return <div>There is no data for some reason</div>;
  }
  return (
    <Layout>
      <div>Latest post from the limit of: {variables.limit}</div>
      <br />
      {fetching && !data ? (
        <div>Loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.getposts.posts.map((p) =>
            !p ? null : (
              <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
                <UpdootSection post={p} />
                <Box flex={1}>
                  <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                    <Link>
                      <Heading fontSize="large">
                        {p.title} Post Id: {p.id}
                      </Heading>
                    </Link>
                  </NextLink>
                  Posted by: {p.creator.username} User Id: {p.creator.id}
                  <Flex align="center">
                    <Text flex={1} mt={4}>
                      {p.textSnippet}
                    </Text>
                    <IconButton
                      ml="auto"
                      colorScheme="red"
                      icon={<DeleteIcon />}
                      aria-label="Delete Post"
                      onClick={() => {
                        deletePost({ id: p.id });
                      }}
                    />
                  </Flex>
                </Box>
              </Flex>
            )
          )}
        </Stack>
      )}
      {data && data?.getposts.hasMore ? (
        <Flex>
          <Button
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor:
                  data.getposts.posts[data.getposts.posts.length - 1].createdAt,
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
