import { Box, Button, Flex, Link, Heading } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching: loginFetching }] = useMeQuery({
    pause: isServer(),
  });
  let body = null;

  //is the page still loading?
  if (loginFetching) {
    body;
  }
  //user not logged in?
  else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link color="white" mr={2}>
            Login
          </Link>
        </NextLink>
        <NextLink href="/register">
          <Link color="white">Register</Link>
        </NextLink>
        <NextLink href="/create-post">
          <Link color="black">Create A Post</Link>
        </NextLink>
      </>
    );
  }
  //user is logged in
  else {
    body = (
      <Flex align="center">
        <NextLink href="/create-post">
          <Button as={Link} mr={4}>
            Create A Post
          </Button>
        </NextLink>
        <Box mr={2}>{data.me.username}</Box>
        <Button
          onClick={() => {
            logout();
          }}
          isLoading={logoutFetching}
          variant="link"
          color="orange"
        >
          Log Out
        </Button>
      </Flex>
    );
  }
  return (
    <Flex bg="cadetblue" p={4} zIndex={2} position="sticky" top={0}>
      <Flex flex={1} maxW={800} align="center" margin="auto">
        <NextLink href="/">
          <Link>
            <Heading>LikR</Heading>
          </Link>
        </NextLink>
        <Box p={3} ml={"auto"}>
          {body}
        </Box>
      </Flex>
    </Flex>
  );
};
