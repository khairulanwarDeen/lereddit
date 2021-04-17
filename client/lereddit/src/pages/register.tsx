import React from 'react'
import { Formik, Form } from "formik";
import { FormControl, FormLabel, Input, FormErrorMessage, Box, Button } from '@chakra-ui/react';
import { Wrapper } from '../components/wrapper';
import { InputField } from '../components/InputField';

interface registerProps {

}

export const Register: React.FC<registerProps> = ({ }) => {
    return (
        <Wrapper variant="regular">
            <Formik
                initialValues={{ username: "", password: "" }}
                onSubmit={(values) => {
                    console.log(values);
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