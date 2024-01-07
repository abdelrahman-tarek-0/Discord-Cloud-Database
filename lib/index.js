const FormData = require("form-data");
const axios = require("axios");
const errorHandler = require("./utils/errorHandler");
const { Routes } = require('./utils/route')

/**
 * @property {Discord.Token} token - discord token user account
 * @property {Object} channelMapper - simple map to map the ids of the channels  ex:{product:'7459996657'}
 */
class DiscordDatabase {
  /**
   * @param {Discord.Token} token - discord token user account
   * @param {Object} channelMapper - simple map to map the ids of the channels  ex:{product:'7459996657'}
   * @param {Boolean} Bot - true if you want to use the bot
   * @returns instant from the class
   * @example new DiscordDatabase("aw2waeaew",{
   *  products:'123365477',
   *  users: '8555665844'
   * })
   * @pre have discord user and server (join the user to server and make some channels) then you need to get the token of the user and the ids of the channel
   */
  constructor(token = "", channelMapper = {}, Bot = true) {
    if (!token) {
      throw new Error("token is required");
    }

    if (Bot) this.token = "Bot " + token;
    else this.token = token;

    this.channelMapper = channelMapper;
    this.isBot = Bot;
  }

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
     * @pre have discord user and server (join the user to server and ake soe channels) then you need to get the token of the user and the ids of the channel
     */
  async insertOne(content, channel = { name: "", id: "" }) {
    try {
      const res = await axios.post(Routes.channelMessages(this.channelMapper[channel.name] || channel.id),
        { content },
        {
          headers: {
            authorization: this.token,
          },
        }
      );

      const { id, content: body, timestamp } = res.data;

      return { id, body, timestamp: Date.parse(timestamp) };
    } catch (error) {
      errorHandler(error);
    }
  }

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
  async find(channel = { name: "", id: "" }) {
    try {
      const res = await axios.get(Routes.channelMessages(this.channelMapper[channel.name] || channel.id), {
        headers: {
          authorization: this.token,
        },
      });

      return res.data.map(({ id, content, attachments, timestamp }) => ({
        id,
        body: content,
        attachments,
        timestamp: Date.parse(timestamp),
      }));
    } catch (error) {
      errorHandler(error);
    }
  }

  /**
     *
     * @param {String} messageId - the message id sent by discord api (came from uploadFile method i recommend storing the id with image url for Future access to the message )
     * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
     * @returns {Object} - the message returned by discord api
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
    async findOne(messageId, channel = { name: '', id: '' }) {
      try {
         // Only bots can get a message by id
         if (!this.bot) {
            const getId = await this.find(channel)
            for (let i = 0; i < getId.length; i++) {
               if (getId[i].id == messageId) {
                  return getId[i]
               }
            }
         } else {
            // this will fail if client is not a bot
            const res = await axios.get(
               Routes.channelMessage(
                  this.channelMapper[channel.name] || channel.id,
                  messageId
               ),
               {
                  headers: {
                     authorization: this.token,
                  },
               }
            )
            const { id, content, timestamp } = res.data
            return { id, content, timestamp: Date.parse(timestamp) }
         }
      } catch (error) {
         errorHandler(error)
      }
   }

  /**
   * @param {String} messageId - the message id sent by discord api (came from uploadFile method i recommend storing the id with image url for feature access to the message )
   * @param {String} content - data to edit or update the body of the specified discord message id.
   * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
   * @returns {Object} - updated message returned by discord api
   * @note this method does not support file uploading if you edited a file (file with no message content) with this method this will result an error (only use if the message is text or the message is a file with a content text)
   * @example call - await DiscordDatabase.updateOne('15555147','i am editing',{name:'users'})
   * @example {Object} return - {
   *    id:'',
   *  ----------
   * -----------
   *    content:'',
   *    attachments:'' (files)
   * }
   */
  async updateOne(messageId, content, channel = { name: "", id: "" }) {
    try {
      const res = await axios.patch(Routes.channelMessage(this.channelMapper[channel.name] || channel.id, messageId),
        { content },
        {
          headers: {
            authorization: this.token,
          },
        }
      );

      const { id, content: body, timestamp } = res.data;

      return { id, body, timestamp: Date.parse(timestamp) };
    } catch (error) {
      errorHandler(error);
    }
  }

  /**
   * method to delete all messages in the channel.
   * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
   * @example call - deleteMany({name:'products'})
   * @example {Boolean} return - true
   * @note - not recommended (heavy requests on discord API result in getting banned) only use on the low amount of data (50 messages recommended)
   */
  async deleteMany(channel = { name: "", id: "" }) {
    try {
      const getId = await this.find();
      for (let i = 0; i < getId.length; i++) {
        const res = await axios.delete(Routes.channelMessage(this.channelMapper[channel.name] || channel.id, getId[i].id), {
          headers: {
            authorization: this.token,
          },
        });
      }
      return true;
    } catch (error) {
      errorHandler(error);
    }
  }

  /**
     * @param {Buffer | Stream} file - take an file as buffer or as stream (stream is useful for large files and videos)
     * @param {String} fileName - file name to save as
     * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
     * @returns {Object} object contain image info 
     *@example call -
                const file = fs.readFileSync('./test.jpg');
                discordDatabase.uploadFile(file,'test.jpg',{name:'tours' or id:'48484'})
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
  
     * @pre have discord user and server (join the user to server and ake soe channels) then you need to get the token of the user and the ids of the channel
     */
  async uploadFile(file, fileName = null, channel = { name: "", id: "" }) {
    try {
      const form = new FormData();
      form.append("file", file, fileName);

      // when passing stream this func will throw error so this is soe workaround to prevent this
      form.getLengthSync = null;

      const res = await axios.post(Routes.channelMessages(this.channelMapper[channel.name] || channel.id), form, {
        headers: {
          ...form.getHeaders(),
          authorization: this.token,
        },
      });
      res.data.attachments[0].id = res.data.id;
      return res.data.attachments[0];
    } catch (error) {
      if (error?.response?.data?.code === 40005) {
        throw new Error(
          "Request entity too large, Discord only accepts less than 8mb of files"
        );
      } else {
        errorHandler(error)
      }
    }
  }

  /**
     * @param {Buffer | Stream} file - take an file as buffer or as stream (stream is useful for large files and videos)
     * @param {String} fileName - file name to save as
    * @param {String} content - message content send with the file (optional)
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
  
     * @pre have discord user and server (join the user to server and ake soe channels) then you need to get the token of the user and the ids of the channel
     */
  async uploadFileWithContent(
    file,
    fileName = null,
    content = "",
    channel = { name: "", id: "" }
  ) {
    try {
      const form = new FormData();
      form.append("file", file, fileName);
      form.append("content", content);

      // when passing stream this func will throw error so this is soe workaround to prevent this
      form.getLengthSync = null;

      const res = await axios.post(Routes.channelMessages(this.channelMapper[channel.name] || channel.id), form, {
        headers: {
          ...form.getHeaders(),
          authorization: this.token,
        },
      });
      res.data.attachments[0].id = res.data.id;
      return res.data.attachments[0];
    } catch (error) {
      if (error?.response?.data?.code === 40005) {
        throw new Error(
          "Request entity too large, Discord only accepts less than 8mb of files"
        );
      } else {
        errorHandler(error);
      }
    }
  }

  /**
   *
   * @param {String} messageId - the message id sent by discord api (came from uploadFile method i recommend storing the id with image url for feature access to the message )
   * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
   * @returns {Promise<Boolean>} true if success
   * @example call - await DiscordDatabase.deleteMessageById('5555555',{name:'users'})
   * @example return - Promise<status>
   */
  async deleteMessageById(messageId, channel = { name: "", id: "" }) {
    try {
      const res = await axios.delete(Routes.channelMessage(this.channelMapper[channel.name] || channel.id, messageId), {
        headers: {
          authorization: this.token,
        },
      });
      return res.status;
    } catch (error) {
      if (error?.response?.data?.message)
        throw new Error(error?.response?.data?.message);
      else {
        errorHandler(error);
      }
    }
  }

  /**
   * @param {String} fileURL - the file url came from uploadFile method
   * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
   * @returns {Boolean} true if success
   * @example call - await DiscordDatabase.deleteFileByURL('https://cdn.discordapp.com/attachments/123/123/some-name.jpg',{name:'users'})
   * @example return - Promise<status>
   */
  async deleteFileByURL(fileURL) {
    try {
      const channel = { id: fileURL.match(/attachments\/(\d+)/)[1] };
      const attachments = await axios.get(Routes.channelMessages(channel.id),
        {
          headers: {
            authorization: this.token,
          },
        }
      );
      const fileId = attachments.data.find(
        (attachment) => attachment.attachments[0]?.url === fileURL
      )?.id;
      if (!fileId) throw new Error("no file was found");
      return await this.deleteMessageById(fileId, channel);
    } catch (error) {
      errorHandler(error);
    }
  }

  /**
   * @param {String} email - discord email
   * @param {String} password - discord password
   * @returns {this} instant from the class
   * @example call - discordDatabase.login('email','password')
   * @example return - this
   * @description this method is for login to discord and obtain the token this method will overwrite the token you put in the constructor , you can obtain the token from the class by using the token property discordDatabase.token
   * @deprecated this method is not recommended, due to the fact that it is not safe to use the user's email and password, and it is better to use the bot token
   */
  async login(email, password) {
    try {
      const res = await axios.post(Routes.login(),
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      this.token = res.data.token;
      return this;
    } catch (error) {
      errorHandler(error);
    }
  }
}

module.exports = DiscordDatabase;
