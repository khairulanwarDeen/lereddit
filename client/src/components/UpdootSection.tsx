import { ArrowDownIcon, ArrowUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [, vote] = useVoteMutation();
  const [loadingState, setLoadingState] =
    useState<"upvote-loading" | "downvote-loading" | "not-loading">(
      "not-loading"
    );
  return (
    <Flex
      direction="column"
      justifyContent="center"
      justifyItems="center"
      alignItems="center"
      mr={4}
    >
      <IconButton
        icon={<ArrowUpIcon w={6} h={6} />}
        aria-label="Up Vote"
        w={6}
        h={6}
        colorScheme={"teal"}
        onClick={async () => {
          setLoadingState("upvote-loading");
          await vote({
            value: 1,
            postId: post.id,
          });
          setLoadingState("not-loading");
        }}
        isLoading={loadingState === "upvote-loading"}
      />
      {post.points}
      <IconButton
        icon={<ArrowDownIcon w={6} h={6} />}
        aria-label="Down Vote"
        w={6}
        h={6}
        colorScheme={"pink"}
        onClick={async () => {
          setLoadingState("downvote-loading");
          await vote({
            value: -1,
            postId: post.id,
          });
          setLoadingState("not-loading");
        }}
        isLoading={loadingState === "downvote-loading"}
      />
    </Flex>
  );
};
