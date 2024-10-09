# Cherry-K Clinic REST API

## Installation

Use the package manager [NPM] to install dependencies for Cherry-K Clinic API

```nodejs
npm install 
```

## Database Requirements
```
# Create a database called 'cherry-k' after "Mongodb Setup". You may change this db name in the db.js file if it dosen't suit your taste.
#First of all, run dbIndexes.js to ensure that all the required indexes are created on the database if you're using a new database.
#You can also use mongosh (Mongodb CMD) to manually create or drop indexes if dbIndexes.js throws an error.
#Search Functions may not work if you didn't run this script(MongoDB needs indexes to perform full text search).
#You may refer to MongoDB Developer Center if you're struggling with Mongodb setup or anything mongodb related. Their documentation is quite spectacular.

node ./dbIndexes.js

#All the required variables are in ./config/db.js.
```

## Usage

```nodejs 
# you can either starts the app with 
node server.js

# or you can use nodemon 
nodemon server.js

```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.
Author: Kyaw Zaw Lwin
