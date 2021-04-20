import React from 'react'
import { Formik, Form } from "formik";
import { Box, Button } from '@chakra-ui/react';
import { Wrapper } from '../components/wrapper';
import { InputField } from '../components/InputField';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from "next/router"

interface registerProps {

}

export const Register: React.FC<registerProps> = ({ }) => {
    const router = useRouter();
    const [, register] = useRegisterMutation();
    return (
        <Wrapper variant="regular">
            <Formik
                initialValues={{ username: "", password: "" }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await register({ username: values.username, password: values.password })
                    console.log(response);
                    if (response.data?.register.errors) {
                        setErrors(toErrorMap(response.data.register.errors))
                    } else if (response.data?.register.user) {
                        router.push("/")
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="username"
                            placeholder="username"
                            label="Username"
                        />
                        <Box mt="4">
                            <InputField
                                name="password"
                                placeholder="password"
                                label="Password"
                                type="password"
                            />
                        </Box>
                        <Button type="submit" isLoading={isSubmitting} colorScheme="facebook">register</Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
}

export default Register;