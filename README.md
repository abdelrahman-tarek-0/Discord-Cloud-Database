# Discord-Database
using discord api to upload files to the cloud (free database for files) 8mb for each file 
this project is for educational purposes only

# Installation
## npm
```bash
npm i discord-cloud-database
```
## yarn
```bash
yarn add discord-cloud-database
```

<hr/>

## you need to have discord
### create a discord account (user not bot) don't use your main account
![discord account creation](https://cdn.discordapp.com/attachments/1070241455735590945/1070537147678994544/image.png)

see this tutorial for how to create account [here](https://www.youtube.com/watch?v=IYA-JwBlHc4)

<hr/>

### create a discord server
![discord server creation](https://cdn.discordapp.com/attachments/1070241455735590945/1070538398009405530/image.png)

see this tutorial for how to create server , channels and manage roles [here](https://www.youtube.com/watch?v=oQAztZ5uzfw)

<hr/>

### create a channel in the discord server
![discord channel creation](https://cdn.discordapp.com/attachments/1070241455735590945/1070539145560195113/image.png)

<hr/>

### obtain the channels id
right click on the channel and click on copy id

![discord channel id](https://cdn.discordapp.com/attachments/1070241455735590945/1070539912492884008/image.png)



# Usage
## construct the class
```js
const DiscordDatabase = require("discord-cloud-database");

// the class constructor take 2 arguments
//the first arg
/*
*    the first argument is the token of the discord user (not bot)
*    first argument is optional and the default value  will be null
*/ 

// the second arg
/* 
*    the second argument is the channel id map (discord server channel id) , a simple object that map the channel id to the file name
*
*    used for not having to pass the channel id every time you want to upload a file only put the channel name
*    the second argument is optional and the default value is {}
*/ 

// example of both arguments
// arg1: new DiscordDatabase('adw4awd4')
// arg2: new DiscordDatabase(null, { 'products': '2314', '987654321': 'file2' })
// arg1 and arg2: new DiscordDatabase('adw4awd4', { 'products': '1222145', 'reviews': '1222141' })
const discordDatabase = new DiscordDatabase(TOKEN,channelIdMap);
```
## methods
### uploadFile
```js
const DiscordDatabase = require("discord-cloud-database");
const discordDatabase = new DiscordDatabase(TOKEN?,channelIdMap?);

// uploadFile take 3 arguments

// the first arg
/*
*    the first argument is the file (buffer | stream)
     file buffer is the file content saved in memory as a buffer
     file Stream is the file content saved in memory as a stream 
        stream is useful when you want to upload a file that is too big to be saved in memory as a buffer
        usually when you want to upload videos or zip files
*    the first argument is required
*/

// the second arg
/*
*    the second argument is the file name (string)
      this is the name of the file that will be saved in the database
*    the second argument is required
*/

// the third arg
/*
*   the third argument is the channel (object)
      this is the channel that the file will be uploaded to
        the channel object has 2 properties
        name: the name of the channel in the channelIdMap
        id: the id of the channel
        when you pass the channel object you can pass only the name or only the id
        if you pass only the name the id will be taken from the channelIdMap
        if you pass only the id the id will be acquired
        if you pass both the id will be taken from the channel object
        not passing the channel object will result in an error by discord api
*    the third argument is required to pass one of the 2 properties and the default value is { name: "", id: "" }
*/

// method return a promise
/*
* 
    resolving the promise will return the file objects 
        example of return value resolved object
        {
            id: '123456789', // the message id of the discord server messages
            filename: 'file1', // the file name,
            url: 'https://cdn.discordapp.com/attachments/xxx/xxx/file1' // url of the file
            proxy_url: 'https://media.discordapp.net/attachments/xxx/xxx/file1', // proxy url of the file to use in the wep apps
            size: 123456789,
            width: 123, // the width of the image
            height: 123, // the height of the image
        }
*/
async uploadFile(file, fileName, channel = { name: "", id: "" })
```
### deleteFileByURL 
```js
const DiscordDatabase = require("discord-cloud-database");
const discordDatabase = new DiscordDatabase(TOKEN?,channelIdMap?);

// deleteFileByURL take 1 argument

// the first arg
/*
*    the first argument is the file url (string)
*    the first argument is required
*/

// method return a promise
/*
* resolving the promise will return true if the file is deleted successfully
*/
async deleteFileByURL(fileURL)
```
### login
```js
const DiscordDatabase = require("discord-cloud-database");
const discordDatabase = new DiscordDatabase(TOKEN?,channelIdMap?);

// login take 2 argument

// the first arg
/*
*    the first argument is the email for the discord account (string)
*    the first argument is required
*/

// the second arg
/*
*    the second argument is the password for the discord account (string)
*    the second argument is required
*/

// method return a promise
/*
* resolving the promise will return {this} an instance of the class 
*/

// this method is used to login to the discord account and obtain the token
// using this method will override the token passed in the constructor
// you can obtain the token from the class by using the token property discordDatabase.token
async login(email, password)
```

# limitations
- discord api rate limit
- max file size 8mb
- to much configuration to do
- risk of getting banned from discord but the server with still there and you will not lose any data
- you only user discord user account not bot account

# advantages
- free and unlimited storage
- easy to use
- no need to install any database
- some host services like heroku does'nt allow you to use fs module to save files in the server this is solved by passing the file as a stream or buffer
- you can use the same discord account to upload files to different servers

# example
```js
const DiscordDatabase = require("../lib/index");
const fs = require("fs");
const dotenv = require('dotenv').config()

const fileBuffer = fs.readFileSync(`${__dirname}/pyr.jpg`);
const fileStream = fs.createReadStream(`${__dirname}/some-rar-for-test.rar`);

const discordDatabase = new DiscordDatabase(process.env.DISCORD_TOKEN,{
    tours:process.env.TOURS_CHANNEL_ID,
    users:process.env.USERS_CHANNEL_ID
})
const main = async () => {
    await discordDatabase.login(process.env.DISCORD_EMAIL, process.env.DISCORD_PASS)


    const image = await discordDatabase.uploadFile(fileBuffer,'pyr.jpg',{name:'users'})
    const rar = await discordDatabase.uploadFile(fileStream,'some-rar-for-test.rar',{name:'tours'})

    console.log(image);
    console.log(rar);

 
    const ack1 = await discordDatabase.deleteFileByURL(image.url)
    const ack2 = await discordDatabase.deleteFileByURL(rar.url)
    console.log(ack1,ack2);
    
}

main()
```

# directory tree 
```
C:.
│   .gitignore
│   LICENSE
│   package-lock.json
│   package.json
│   README.md
│
└───lib
        index.js

```
# info
this project for educational purposes only

this project only good for small projects that does not need a lot of data

this project is open source and you can contribute to it

some resources used to make this project
```
https://maximorlov.com/send-a-file-with-axios-in-nodejs/
https://stackoverflow.com/questions/68499998/how-can-i-send-a-picture-with-the-discord-api-and-python-requests
https://www.skypack.dev/view/form-data
https://github.com/node-fetch/node-fetch/issues/102#issuecomment-209820954 
```


