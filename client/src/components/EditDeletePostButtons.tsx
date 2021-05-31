import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { IconButton, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { useDeletePostMutation } from "../generated/graphql";

interface EditDeletePostButtonsProps {
  id: number;
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = (
  p
) => {
  const [, deletePost] = useDeletePostMutation();
  return (
    <>
      <NextLink href="/post/edit/[id]" as={`/post/edit/${p.id}`}>
        <IconButton
          as={Link}
          ml="auto"
          mr="4"
          colorScheme="blue"
          icon={<EditIcon />}
          aria-label="Edit Post"
        />
      </NextLink>

      <IconButton
        ml="auto"
        colorScheme="red"
        icon={<DeleteIcon />}
        aria-label="Delete Post"
        onClick={() => {
          deletePost({ id: p.id });
        }}
      />
    </>
  );
};

export default EditDeletePostButtons;
