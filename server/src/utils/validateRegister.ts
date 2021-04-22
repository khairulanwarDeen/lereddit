import { UsernamePasswordInput } from "./UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) => {
    if (options.username.length < 1) {
        return [
            {
                field: "username",
                message: "username must have at least one character",
            }
        ];
    }


    if (options.username.includes("@")) {
        return [
            {
                field: "username",
                message: "username cannot have \"@\" sign",
            }]
    };

    // const checkUsername = await em.findOne(User, {username: usernameInput})
    // if (checkUsername){
    //     return{
    //         errors:[{
    //             field: "username",
    //             message: "This username already exists",
    //         }]
    //     };
    // }
    if (options.password.length < 1) {
        return [{
            field: "password",
            message: "password must have at least one character",
        }]
    };

    if (!options.email.includes('@')) {
        return [{
            field: "email",
            message: "email must have @ character",
        }]
    };
    return null;
}

export const validatePassword = (password: string) => {
    if (password.length < 1) {
        return [{
            field: "newPassword",
            message: "password must have at least one character",
        }]
    };
    return null
}