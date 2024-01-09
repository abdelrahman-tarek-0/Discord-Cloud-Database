# Discord-Cloud-Database

[![NPM version][npm-version-image]][npm-url]
[![NPM downloads][npm-downloads-image]][npm-downloads-url]
[![MIT License][license-image]][license-url]

look on [NPM](https://www.npmjs.com/package/discord-cloud-database)

using discord API to upload files to the cloud (free database for files) 8mb for each file.<br />
using both bot or client account.<br />
we of course recommend using the bot account due some performance and security issues with the client account<br />
in client account you will need to login to the account to obtain the token every 7 days<br />
in bot account you obtain the token once and you can use it forever<br/>

Note: make sure if you are using bot account to add the bot to the server and give it the correct permissions<br />

**this project is for educational purposes only**

# table of contents

-  [Discord-Cloud-Database](#discord-cloud-database)
-  [table of contents](#table-of-contents)
-  [change log](#change-log)
-  [Installation](#installation)
   -  [npm](#npm)
   -  [yarn](#yarn)
   -  [you need to have a discord](#you-need-to-have-a-discord)
      -  [create a discord account (bot or client)](#create-a-discord-account-bot-or-client)
         -  [bot and obtain the token (recommended)](#bot-and-obtain-the-token-recommended)
         -  [client account (not recommended to use client account as your database manger)](#client-account-not-recommended-to-use-client-account-as-your-database-manger)
      -  [create a discord server](#create-a-discord-server)
      -  [create a channel in the discord server](#create-a-channel-in-the-discord-server)
      -  [obtain the channels id](#obtain-the-channels-id)
-  [Usage](#usage)
   -  [construct the class](#construct-the-class)
   -  [methods](#methods)
      -  [uploadFile](#uploadfile)
      -  [uploadFileWithContent](#uploadfilewithcontent)
      -  [insertOne](#insertone)
      -  [find](#find)
      -  [findOne](#findone)
      -  [updateOne](#updateone)
      -  [deleteMessageById](#deletemessagebyid)
      -  [deleteFileByURL](#deletefilebyurl)
      -  [~~deleteMany~~](#deletemany)
      -  [~~login~~](#login)
-  [example](#example)
-  [config with multer](#config-with-multer)
-  [note](#note)
-  [the image uploaded to the server:](#the-image-uploaded-to-the-server)
-  [limitations](#limitations)
-  [advantages](#advantages)
-  [info](#info)
-  [Contributors ❤](#contributors-)

# change log

-  2.6.0
   -  added cache to reduce the number of requests to the discord API
   -  deprecated deleteMany due to the heavy load on the discord API when using this method
   -  refactor/format the code (stander prettier format)

*  2.5.5
   -  added support for bot account 🥳 we know recommend using bot account instead of client account
   -  deprecated login method
   -  code refactoring
   -  the delete methods know return status code instead of boolean ack
*  2.4.10
   -  added error handling
*  2.3.9
   -  the package now fully accepts text instead of only accepting files
   -  uploadFileWithContent method added (upload file with text content)
   -  insertOne method added only accepts text and not files
   -  find method added returns all the messages in a given channel
   -  findOne method added returns one message by id
   -  updateOne method added updates one message contact by id (only works with text or files with text attached to them) can not update files
   -  deleteMany method added deletes all the messages in the given channel (not recommended heavy request to discord API) recommended to use when the message is below 50 messages
   -  deleteFileById method is now the deleteMessageById method (works for both files and text)
*  1.2.8
   -  fix a bug, the id returned from the uploadFile method was the channel id, not the message-id (fixed)
   -  added method deleteFileById (delete a file by message-id) much faster than deleteFileByURL and fewer requests to the discord API (in 2.3.9 this method will be renamed to deleteMessageById for supporting text messages)

# Installation

## npm

```bash
npm I discord-cloud-database
```

## yarn

```bash
yarn add discord-cloud-database
```

<hr/>

## you need to have a discord

### create a discord account (bot or client)

#### bot and obtain the token (recommended)

you first need to create client account then create a bot account and add the bot to the server see [client](#client-account-and-obtain-the-token-not-recommended-to-use-client-account)
<br />
see this tutorial for how to create a bot and get the token [here](https://www.youtube.com/watch?v=aI4OmIbkJH8)<br />
how to invite the bot to the server [here](https://www.youtube.com/watch?v=4XswiJ1iUaw)<br />

<hr/>

#### client account (not recommended to use client account as your database manger)

![discord account creation](https://cdn.discordapp.com/attachments/1070241455735590945/1070537147678994544/image.png)

see this tutorial for how to create a account [here](https://www.youtube.com/watch?v=IYA-JwBlHc4)

<hr/>

### create a discord server

![discord server creation](https://cdn.discordapp.com/attachments/1070241455735590945/1070538398009405530/image.png)

see this tutorial for how to create servers, channels, and manage roles [here](https://www.youtube.com/watch?v=oQAztZ5uzfw)

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
const DiscordDatabase = require('discord-cloud-database')

// the class constructor takes 2 arguments (return a new instance of the class)
//the first arg
/*
 * The first argument is the token of the discord account (bot or client)
 */

// the second arg
/*
 *    The second argument is the channel id map (discord server channel id), a simple object that maps the channel id to the file name
 *
 *    used for not having to pass the channel id every time you want to upload a file only put the channel name
 *    The second argument is optional and the default value is {}
 */
// the third arg
/*
 *    Is a boolean that indicates if you want to use bot account or client account
 *    The third argument is optional and the default value is false
 *    if u set it to true you need to pass the correct bot token
 *    and make sure the bot is in the server and have the correct permissions
 */

/**
 * @param {Discord.Token} token - discord token user account
 * @param {Object} channelMapper - simple map to map the ids of the channels  ex:{product:'7459996657'}
 * @param {Boolean} Bot - true if you want to use bot account false if you want to use client account (default is false)
 * @returns instant from the class
 * @example new DiscordDatabase("aw2waeaew",{
 *  products:'123365477',
 *  users: '8555665844'
 * })
 * @pre have discord user and server (join the user to server and make some channels) then you need to get the token of the user and the ids of the channel
 */
const discordDatabase = new DiscordDatabase({ token: TOKEN, channels: {}, Bot: true, CacheProvider: new NodeCache()})
```

## methods

### uploadFile

```js
const DiscordDatabase = require("discord-cloud-database");
const discordDatabase = new DiscordDatabase({ token: TOKEN, channels: {}, Bot: true, CacheProvider: new NodeCache()});

// uploadFile takes 3 arguments (return the uploaded file object)

// the first arg
/*
*    The first argument is the file (buffer | stream)
     file buffer is the file content saved in memory as a buffer
     file Stream is the file content saved in memory as a stream
        stream is useful when you want to upload a file that is too big to be saved in memory as a buffer
        usually when you want to upload videos or zip files
*    The first argument is required
*/

// the second arg
/*
*    The second argument is the file name (string)
      this is the name of the file that will be saved in the database
*    The second argument is required
*/

// the third arg
/*
*   The third argument is the channel (object)
      this is the channel that the file will be uploaded to
        the channel object has 2 properties
        name: the name of the channel in the channelIdMap
        id: the id of the channel
        when you pass the channel object you can pass only the name or only the id
        if you pass only the name the id will be taken from the channelIdMap
        if you pass only the id the id will be acquired
        if you pass both the id will be taken from the channel object
        not passing the channel object will result in an error by the discord API
*    The third argument is required to pass one of the 2 properties and the default value is { name: "", id: "" }
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
            proxy_url: 'https://media.discordapp.net/attachments/xxx/xxx/file1', // proxy url of the file to use in the web apps
            size: 123456789,
            width: 123, // the width of the image
            height: 123, // the height of the image
        }
*/

  /**
   * @param {String} messageId - the message id sent by discord api (came from uploadFile method I recommend storing the id with image URL for feature access to the message )
   * @param {String} content - data to edit or update the body of the specified discord message id.
   * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
   * @returns {Object} - updated message returned by discord API
   * @note this method does not support file uploading if you edited a file (file with no message content) with this method this will result in an error (only use if the message is text or the message is a file with a content text)
   * @example call - await DiscordDatabase.updateOne('15555147','i am editing',{name:'users'})
   * @example {Object} return - {
   *    id:'',
   *  ----------
   * -----------
   *    content:'',
   *    attachments:'' (files)
   * }
   */
async uploadFile({ file, fileName, channel })
```

### uploadFileWithContent

-  this method is the same as uploadFile but it accepts a content (string) as the second argument

```js
const DiscordDatabase = require("discord-cloud-database");
const discordDatabase = new DiscordDatabase({ token: TOKEN, channels: {}, Bot: true, CacheProvider: new NodeCache()});

// uploadFileWithContent takes 3 arguments (return the uploaded file object)

// the first arg
/*
*    The first argument is the file (buffer | stream)
     file buffer is the file content saved in memory as a buffer
     file Stream is the file content saved in memory as a stream
        stream is useful when you want to upload a file that is too big to be saved in memory as a buffer
        usually when you want to upload videos or zip files
*    The first argument is required
*/

// the second arg
/*
*    The second argument is the content (string)
      this is the content of the message that will be sent with the file
*    The second argument is not required and the default value is ""
*/

// the third arg
/*
*   The third argument is the channel (object)
      this is the channel that the file will be uploaded to
        the channel object has 2 properties
        name: the name of the channel in the channelIdMap
        id: the id of the channel
        when you pass the channel object you can pass only the name or only the id
        if you pass only the name the id will be taken from the channelIdMap
        if you pass only the id the id will be acquired
        if you pass both the id will be taken from the channel object
        not passing the channel object will result in an error by the discord API

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
            proxy_url: 'https://media.discordapp.net/attachments/xxx/xxx/file1', // proxy url of the file to use in the web apps
            size: 123456789,
            width: 123, // the width of the image
            height: 123, // the height of the image
        }
*/

  /**
     * @param {Buffer | Stream} file - take a file as a buffer or as a stream (stream is useful for large files and videos)
     * @param {String} fileName - file name to save as
     * @param {String} content - message content sent with the file (optional)
     * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
     * @returns {Object} object contain image info
      *@example call -
                const file = fs.readFileSync('./test.jpg');
                discordDatabase.uploadFile(file,'test.jpg','this is content',{name:'tours' or id:'48484'})
     *
     * @example return - {
      id: '123456', // id of the message in discord
          filename: 'some-name.jpg',
      size: 192008, // file size
      url: 'https://cdn.discordapp.com/attachments/123/123/some-name.jpg',  // the usable url for the image on the cloud
      proxy_url: 'https://media.discordapp.net/attachments/123/123/some-name.jpg',
      width: 1200,
      height: 1600,
      content_type: 'image/jpeg'
  }

     * @pre have discord user and server (join the user to server and make some channels) then you need to get the token of the user and the ids of the channel
     */
async uploadFile({ file, filename, content, channel})
```

### insertOne

```js
const DiscordDatabase = require("discord-cloud-database");
const discordDatabase = new DiscordDatabase({ token: TOKEN, channels: {}, Bot: true, CacheProvider: new NodeCache()});

// insertOne takes 2 arguments and only accepts text

// the first arg
/*
*    The first argument is the content (string)
*    The first argument is required
*/

// the second arg
/*
*    The second argument is the channel (object)
      this is the channel that the file will be deleted from
        the channel object has 2 properties
        name: the name of the channel in the channelIdMap
        id: the id of the channel
        when you pass the channel object you can pass only the name or only the id
        if you pass only the name the id will be taken from the channelIdMap
        if you pass only the id the id will be acquired
        if you pass both the id will be taken from the channel object
        not passing the channel object will result in an error by the discord API
*/

// method return a promise
/*
* resolving the promise will return the message object
*/

 /**
     *
     * @param {Sting} content - String data to be sent on discord
     * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
     * @returns {Object} { id: "the id of the message sent to discord", bodyMessage: "the body of the message sent to the discord", date: "date", time: "time" }
     *@note this method only accepts text (file not supported please use uploadFileWithContent)
    * @example call  - await DiscordDatabase.insertOne('some text',{name:'users'})
    * @example return - {
        {  id: '1069989056534000000',
           bodyMessage: hello world,
           date: '2023-01-04,
           time: '10:30:00 }
      }
     * @pre have discord user and server (join the user to server and make some channels) then you need to get the token of the user and the ids of the channel
     */
async insertOne(content, channel = { name: "", id: "" })
```

### find

```js
const DiscordDatabase = require("discord-cloud-database");
const discordDatabase = new DiscordDatabase({ token: TOKEN, channels: {}, Bot: true, CacheProvider: new NodeCache()});

// find takes 1 argument (return an array of objects containing the message object)

// the first arg
/*
*    The first argument is the channel (object)
      this is the channel that the file will be deleted from
        the channel object has 2 properties
        name: the name of the channel in the channelIdMap
        id: the id of the channel
        when you pass the channel object you can pass only the name or only the id
        if you pass only the name the id will be taken from the channelIdMap
        if you pass only the id the id will be acquired
        if you pass both the id will be taken from the channel object
        not passing the channel object will result in an error by the discord API
*/

// method return a promise
/*
* resolving the promise will return an array of objects containing the message object
*/

  /**
     *
     * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
     * @returns {array<Object>} all the messages in a channel
     * @example call - await DiscordDatabase.find({name:'users'})
     * @example {array} return - {
        [
          {Object...},
          {Object...},
          {Object...}
        ]
    }
     */
async find(channel = { name: "", id: "" })
```

### findOne

we recommend using this method only with bot tokens not client tokens
due to the fact that bots can query messages by id but client accounts can not

```js
const DiscordDatabase = require("discord-cloud-database");
const discordDatabase = new DiscordDatabase({ token: TOKEN, channels: {}, Bot: true, CacheProvider: new NodeCache()});

// findOne takes 2 arguments (return an object containing the message object)

// the first arg
/*
*    The first argument is the message id (string)
*    The first argument is required
*/

// the second arg
/*
*    The second argument is the channel (object)
      this is the channel that the file will be deleted from
        the channel object has 2 properties
        name: the name of the channel in the channelIdMap
        id: the id of the channel
        when you pass the channel object you can pass only the name or only the id
        if you pass only the name the id will be taken from the channelIdMap
        if you pass only the id the id will be acquired
        if you pass both the id will be taken from the channel object
        not passing the channel object will result in an error by the discord API
*/

// method return a promise
/*
* resolving the promise will return an object containing the message object
*/

    /**
     *
     * @param {String} messageId - the message id sent by discord api (came from uploadFile method I recommend storing the id with image URL for Future access to the message )
     * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
     * @returns {Object} - the message returned by discord API
     * @example call - await DiscordDatabase.findOne('12251445',{name:'users'})
     * @example {Object} return - {
        {
          id: '11110000000'
          type: 0,
          content: 'hello wordl'
          .....
          .....
        },
    }
  */
async findOne(messageId, channel)
```

### updateOne

-  work with messages containing text
-  message containing file only (not text) will result in an error
-  message containing file only must have a text to be updated

```js
const DiscordDatabase = require("discord-cloud-database");
const discordDatabase = new DiscordDatabase({ token: TOKEN, channels: {}, Bot: true, CacheProvider: new NodeCache()});

// updateOne takes 3 arguments (return an object containing the updated message object if the message contains a file the file will be returned on the attachment property)

// the first arg
/*
*    The first argument is the message id (string)
*    The first argument is required
*/

// the second arg
/*
*    The second argument is the new content (string)
*    The second argument is required
*/

// the third arg
/*
*    The third argument is the channel (object)
      this is the channel that the file will be deleted from
        the channel object has 2 properties
        name: the name of the channel in the channelIdMap
        id: the id of the channel
        when you pass the channel object you can pass only the name or only the id
        if you pass only the name the id will be taken from the channelIdMap
        if you pass only the id the id will be acquired
        if you pass both the id will be taken from the channel object
        not passing the channel object will result in an error by the discord API
*/

// method return a promise
/*
* resolving the promise will return an object containing the updated message object
*/

  /**
   * @param {String} messageId - the message id sent by discord api (came from uploadFile method I recommend storing the id with image URL for feature access to the message )
   * @param {String} content - data to edit or update the body of the specified discord message id.
   * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
   * @returns {Object} - updated message returned by discord API
   * @note this method does not support file uploading if you edited a file (file with no message content) with this method this will result in an error (only use if the message is text or the message is a file with a content text)
   * @example call - await DiscordDatabase.updateOne('15555147','i am editing',{name:'users'})
   * @example {Object} return - {
   *    id:'',
   *  ----------
   * -----------
   *    content:'',
   *    attachments:'' (files)
   * }
   */
async updateOne(messageId, content, channel)
```

### deleteMessageById

-  was called deleteFileById before version 2.3.9
-  deleteFileById is now removed and replaced with deleteMessageById

```js
const DiscordDatabase = require("discord-cloud-database");
const discordDatabase = new DiscordDatabase({ token: TOKEN, channels: {}, Bot: true, CacheProvider: new NodeCache()});

// deleteMessageById takes 2 argument

// the first arg
/*
*    The first argument is the file id (string) returned by the uploadFile method
*    The first argument is required
*/

// the second arg
/*
*    The second argument is the channel (object)
      this is the channel that the file will be deleted from
        the channel object has 2 properties
        name: the name of the channel in the channelIdMap
        id: the id of the channel
        when you pass the channel object you can pass only the name or only the id
        if you pass only the name the id will be taken from the channelIdMap
        if you pass only the id the id will be acquired
        if you pass both the id will be taken from the channel object
        not passing the channel object will result in an error by the discord API
*/

// method return a promise
/*
* resolving the promise will return status if the file is deleted successfully
*/

  /**
   *
   * @param {String} messageId - the message id sent by discord api (came from uploadFile method I recommend storing the id with image URL for feature access to the message )
   * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
   * @returns {Boolean} true if success
   * @example call - await DiscordDatabase.deleteMessageById('5555555',{name:'users'})
   * @example return - status
   */
async deleteMessageById(fileId, channel)
```

### deleteFileByURL

-  recommended using deleteMessageById instead

```js
const DiscordDatabase = require("discord-cloud-database");
const discordDatabase = new DiscordDatabase({ token: TOKEN, channels: {}, Bot: true, CacheProvider: new NodeCache()});

// deleteFileByURL takes 1 argument

// the first arg
/*
*    The first argument is the file URL (string)
*    The first argument is required
*/

// method return a promise
/*
* resolving the promise will return status if the file is deleted successfully
*/

  /**
   * @param {String} fileURL - the file URL came from the uploadFile method
   * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
   * @returns {Boolean} true if success
   * @example call - await DiscordDatabase.deleteFileByURL('https://cdn.discordapp.com/attachments/123/123/some-name.jpg',{name:'users'})
   * @example return - status
   */
async deleteFileByURL(fileURL)
```

### ~~deleteMany~~

-  deprecated
-  not recommended to use this method (heavy load on the discord API)
-  only use this method if you have less than 50 messages to delete

```js
const DiscordDatabase = require("discord-cloud-database");
const discordDatabase = new DiscordDatabase({ token: TOKEN, channels: {}, Bot: true, CacheProvider: new NodeCache()});

// deleteMany takes 1 argument

// the first arg
/*
*    The first argument is the channel (object)
      this is the channel that the file will be deleted from
        the channel object has 2 properties
        name: the name of the channel in the channelIdMap
        id: the id of the channel
        when you pass the channel object you can pass only the name or only the id
        if you pass only the name the id will be taken from the channelIdMap
        if you pass only the id the id will be acquired
        if you pass both the id will be taken from the channel object
        not passing the channel object will result in an error by the discord API
*/

// method return a promise
/*
* resolving the promise will return true if the file is deleted successfully
*/

   /**
   * method to delete all messages in the channel.
   * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
   * @example call - deleteMany({name:'products'})
   * @example {Boolean} return - true
   * @note - not recommended (heavy requests on discord API result in getting banned) only use on the low amount of data (50 messages recommended)
   */
async deleteMany(channel)
```

### ~~login~~

-  deprecated (not recommend to pass the email and password, use bot token or client token instead)

```js
const DiscordDatabase = require("discord-cloud-database");
const discordDatabase = new DiscordDatabase({ token: TOKEN, channels: {}, Bot: true, CacheProvider: new NodeCache()});

// login take 2 argument

// the first arg
/*
*    The first argument is the email for the discord account (string)
*    The first argument is required
*/

// the second arg
/*
*    The second argument is the password for the discord account (string)
*    The second argument is required
*/

// method return a promise
/*
* resolving the promise will return {this} an instance of the class
*/

// this method is used to login to the discord account and obtain the token
// using this method will override the token passed in the constructor
// you can obtain the token from the class by using the token property discordDatabase.token

  /**
   * @param {String} email - discord email
   * @param {String} password - discord password
   * @returns {this} instant from the class
   * @example call - discordDatabase.login('email','password')
   * @example return - this
   * @description this method is for login to discord and obtaining the token this method will overwrite the token you put in the constructor, you can obtain the token from the class by using the token property discordDatabase.token
   * @deprecated this method is deprecated and not recommended to use
   */
async login(email, password)
```

# example

```js
const DiscordDatabase = require('../src/index')
const fs = require('fs')
const dotenv = require('dotenv').config()

const fileBuffer = fs.readFileSync(`${__dirname}/pyr.file`)
const fileStream = fs.createReadStream(`${__dirname}/some-rar-for-test.rar`)

const isBot = true

const token = isBot ? process.env.DISCORD_BOT_TOKEN : process.env.DISCORD_TOKEN

const discordDatabase = new DiscordDatabase({
    token,
    channels: {
        tours: process.env.TOURS_CHANNEL_ID,
        users: process.env.USERS_CHANNEL_ID
    },
    Bot: isBot,
    CacheProvider: new RedisProvider({
        url: process.env.REDIS_URL
    })
});

const main = async () => {
   // const token = await discordDatabase.login(process.env.DISCORD_EMAIL, process.env.DISCORD_PASS) // deprecated
   // console.log(token);

   const image = await discordDatabase.uploadFile({ file: fileBuffer, filename: 'pyr.file', channel: 'users' });
   const rar = await discordDatabase.uploadFile({ file: fileStream, filename: 'some-rar-for-test.rar', content: 'this a rar', channel: 'tours' });

   const image2 = await discordDatabase.uploadFile({ file: fileBuffer, filename: 'pyr.file', channel: 'tours' });
   const ahmed = await discordDatabase.insertOne({ name: 'ahmed', age: 25 }, 'users');

   console.log(image)
   console.log(rar)
   console.log(image2)
   console.log(ahmed)

   if (!image?.url || !rar?.url || !image2 || !ahmed) return

   const userAhmed = await discordDatabase.findOne(ahmed.id, 'users');
   console.log(userAhmed);

   const editedAhmed = await discordDatabase.updateOne(ahmed.id, { name: 'ahmed', age: 31 }, 'users');
   console.log(editedAhmed);

   const editedFile = await discordDatabase.updateOne(rar.id, 'this is not a rar anymore', 'tours');
   console.log(editedFile);

   let ack1, ack2, ack3, ack4;
   try {
      ack1 = await discordDatabase.deleteFileByURL(image.url);
      ack2 = await discordDatabase.deleteMessageById(image2.id, 'tours');
      ack3 = await discordDatabase.deleteFileByURL(rar.url);
      ack4 = await discordDatabase.deleteMessageById(ahmed.id, 'users');
   } catch (error) {
      console.log(error);
   }

   console.log(ack1, ack2, ack3, ack4); // true true true true
}

main()

// console.log(process.env.DISCORD_EMAIL, process.env.DISCORD_PASS);
```

# config with multer

when making an API that uploads files to the server you can use multer to handle the file upload
using multer memory storage to save the file in memory as a buffer
and then pass the file to the uploadFile method

this project is perfectly compatible with multer

```js
const multer = require('multer')
const DiscordDatabase = require('discord-cloud-database')

// in the middleware file
exports.multerMiddleware = () => {
   const multerStorage = multer.memoryStorage()
   return multer({
      storage: multerStorage,
   }).single('photo')
}
exports.uploadImageMiddleware = async (req, res, next) => {
   const file = req.file
   const image = await discordDatabase.uploadFile({
      file: file.buffer,
      filename: file.originalname,
      channel: 'users'
   })
   req.image = image
   next()
}

// in the route file
const { multerMiddleware, uploadImageMiddleware } = require('../middleware')

router.route('/').post(
   multerMiddleware(),
   uploadImageMiddleware,
   catchAsync(async (req, res, next) => {
      res.status(200).json({
         status: 'success',
         data: {
            image: req.image.url,
         },
      })
   })
)
```

# note

I recommend using multer memory storage to save the file in memory as a buffer
<br />
<br />
Also, recommend using the proxy_url of the uploaded file returned from uploadFile

![image](https://cdn.discordapp.com/attachments/1070241455735590945/1070610371318136903/image.png)

to use on the web,
like HTML img tag src attribute with adding crossorigin="anonymous" to the img tag

```html
<img
   src="https://media.discordapp.net/attachments/xxx/xxx/file1"
   crossorigin="anonymous"
/>
```

# the image uploaded to the server:

![image](https://cdn.discordapp.com/attachments/1070241455735590945/1070559309764771901/image.png)

the returned URL of the image can be stored in the database

and there you have it a simple way to upload files to the server and store the URL in the database

the URL can be used to show images in the web apps or download the file (if the file is not an image) from discord servers

# limitations

-  discord API rate limit
-  max file size 8mb
-  too much configuration to do
-  the risk of getting banned from discord but the server with still there and you will not lose any data

# advantages

-  free and unlimited storage
-  easy to use
-  no need to install any database
-  some host services like Heroku don’t allow you to use the fs module to save files in the server this is solved by passing the file as a stream or buffer to the uploadFile method
-  you can use the same discord account to upload files to different servers
-  you can use both bot and client accounts (recommended to use bot accounts)

# info

this project is for educational purposes only

this project is only good for small projects that do not need a lot of data

this project is open source and you can contribute to it

some resources used to make this project:

```
https://maximorlov.com/send-a-file-with-axios-in-nodejs/
https://stackoverflow.com/questions/68499998/how-can-i-send-a-picture-with-the-discord-api-and-python-requests
https://www.skypack.dev/view/form-data
https://github.com/node-fetch/node-fetch/issues/102#issuecomment-209820954
```

# Contributors ❤

-  [M Khoirul Risqi](https://github.com/risqikhoirul)
-  [SVNKVN9](https://github.com/SVNKVN9)

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE
[npm-url]: https://npmjs.org/package/discord-cloud-database
[npm-version-image]: https://img.shields.io/npm/v/discord-cloud-database.svg?style=flat
[npm-downloads-image]: https://img.shields.io/npm/dm/discord-cloud-database.svg?style=flat
[npm-downloads-url]: https://npmcharts.com/compare/discord-cloud-database?minimal=true
