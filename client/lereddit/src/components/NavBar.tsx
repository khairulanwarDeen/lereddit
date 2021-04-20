import { Box, Button, Flex, Link } from "@chakra-ui/react";
import React from 'react';
import NextLink from "next/link";
import { useMeQuery } from "../generated/graphql";

interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({ }) => {
    const [{ data, fetching }] = useMeQuery()
    let body = null;

    //is the page still loading?
    if (fetching) {
        body

    }
    //user not logged in?
    else if (!data?.me) {
        body = (
            <>
                <NextLink href="/login">
                    <Link color="white" mr={2}>Login</Link>
                </NextLink>
                <NextLink href="/register">
                    <Link color="white">Register</Link>
                </NextLink></>
        )
    }
    //user is logged in 
    else {
        body = (
            <Flex>
                <Box mr={2}>
                    {data.me.username}
                </Box>
                <Button variant="link">Log Out</Button>
            </Flex>
        )
    }
    return (
        <Flex bg="tomato" p={4}>
            <Box p={3} ml={"auto"}>
                {body}
            </Box>
        </Flex>
    );
}