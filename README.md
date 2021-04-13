# lereddit
 quickchallenge

Note that graphql is a peer dependency. ensure that the package.json has the graphql dependency in the list. run npm install.

Validator issues
in this project we are not using class validators. 
https://typegraphql.com/docs/validation.html#caveats
go to link to read up more. but basically what it is saying is that now, the version on type/graphql requires 
class validators to be installed anyways.

so run
npm i class_validators