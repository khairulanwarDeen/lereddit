# Project: lereddit
 This was a tutorial on how to use graphql and typescript. this is a whole project so be patient.
 To run this project, gather the dependencies by runnine npm install

# GraphQL
Note that graphql is a peer dependency. ensure that the package.json has the graphql dependency in the list. run npm install.

# class_validators
Validator issues
in this project we are not using class validators. 
https://typegraphql.com/docs/validation.html#caveats
go to link to read up more. but basically what it is saying is that now, the version on type/graphql requires 
class validators to be installed anyways.
so run
npm i class_validators

# Setting a unique constraint on a column
The error happens because MySQL can index only the first N chars of a BLOB or TEXT column. So The error mainly happens when there is a field/column type of TEXT or BLOB or those belong to TEXT or BLOB types such as TINYBLOB, MEDIUMBLOB, LONGBLOB, TINYTEXT, MEDIUMTEXT, and LONGTEXT that you try to make a primary key or index. With full BLOB or TEXT without the length value, MySQL is unable to guarantee the uniqueness of the column as it’s of variable and dynamic size. So, when using BLOB or TEXT types as an index, the value of N must be supplied so that MySQL can determine the key length. However, MySQL doesn’t support a key length limit on TEXT or BLOB. TEXT(88) simply won’t work.

The error will also pop up when you try to convert a table column from non-TEXT and non-BLOB type such as VARCHAR and ENUM into TEXT or BLOB type, with the column already been defined as unique constraints or index. The Alter Table SQL command will fail.

The solution to the problem is to remove the TEXT or BLOB column from the index or unique constraint or set another field as primary key. If you can't do that, and wanting to place a limit on the TEXT or BLOB column, try to use VARCHAR type and place a limit of length on it. By default, VARCHAR is limited to a maximum of 255 characters and its limit must be specified implicitly within a bracket right after its declaration, i.e VARCHAR(200) will limit it to 200 characters long only.

Sometimes, even though you don’t use TEXT or BLOB related type in your table, the Error 1170 may also appear. It happens in a situation such as when you specify VARCHAR column as primary key, but wrongly set its length or characters size. VARCHAR can only accepts up to 256 characters, so anything such as VARCHAR(512) will force MySQL to auto-convert the VARCHAR(512) to a SMALLTEXT datatype, which subsequently fails with error 1170 on key length if the column is used as primary key or unique or non-unique index. To solve this problem, specify a figure less than 256 as the size for VARCHAR field.

### TLDR:
Set the column and specify to to a varchar(*specify the maximum length*), then you can set the column to be unique

# Cookie debugging

Because we are using redis here, it is considered a 3 party server i think. so the secure option in setting the cookie in "src/index.ts" was commented out. 

https://github.com/benawad/lireddit/issues/13
https://benawad.com/cookie

# express.session

Sessions are not in express anymore. 
Create userId explicitly for the req in types.ts