import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/wrapper";
import { useLoginMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { toErrorMap } from "../utils/toErrorMap";

export const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [, login] = useLoginMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOremail: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          //console.log(values);
          const response = await login(values);
          console.log(response);
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data?.login.errors));
          } else if (response.data?.login.user) {
            console.log(router);
            if (typeof router.query.next === "string") {
              //assuming there was a query made to push user to queried path
              router.push(router.query.next);
            } else {
              //otherwise, push back to home page
              router.push("./");
            }
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="usernameOremail"
              placeholder="username or email"
              label="Username Or Email"
            />
            <Box mt="4">
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Flex mt={2}>
              <NextLink href="/forgot-password">
                <Link ml="auto">fotgot password?</Link>
              </NextLink>
            </Flex>

            <Flex mt={2}>
              <NextLink href="/">
                <Link ml="auto">I do not want to log in</Link>
              </NextLink>
            </Flex>

            <Button
              type="submit"
              isLoading={isSubmitting}
              colorScheme="facebook"
            >
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
