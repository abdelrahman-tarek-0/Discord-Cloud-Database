const FormData = require("form-data");
const axios = require("axios");
const fs = require("fs");

/**
 * @property {Discord.Token} token - discord token user account
 * @property {Object} channelMapper - simple map to map the ids of the channels  ex:{product:'7459996657'}
 */
class DiscordDatabase {
  /**
   * @param {Discord.Token} token - discord token user account
   * @param {Object} channelMapper - simple map to map the ids of the channels  ex:{product:'7459996657'}
   * @returns instant from the class
   * @pre have discord user and server (join the user to server and make some channels) then you need to get the token of the user and the ids of the channel
   */
  constructor(token = "", channelMapper = {}) {
    this.token = token;
    this.channelMapper = channelMapper;
  }

  /**
     *
     * @param {Sting} content - String data to be sent on discord
     * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
     * @returns {Object} { id: "the id of the message sent to discord", bodyMessage: "the body of the message sent to the discord", date: "date", time: "time" }
     *     
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
      const url = `https://discord.com/api/v9/channels/${this.channelMapper[channel.name] || channel.id}/messages`;

      const res = await axios.post(
        url,
        { content },
        {
          headers: {
            authorization: this.token,
          },
        }
      );

      const id = res.data.id;
      const bodyMessage = res.data.content;
      const times = res.data.timestamp;
      const date = times.split("T")[0];
      const time = res.data.timestamp.split("T")[1].split(".")[0];
      return { id, bodyMessage, date, time };
      
    } catch (error) {
      throw error;
    }
  }

  /**
     *
     * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
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
      const url = `https://discord.com/api/v9/channels/${this.channelMapper[channel.name] || channel.id}/messages`;
      const res = await axios.get(url, {
        headers: {
          authorization: this.token,
        },
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }

  /**
     *
     * @param {String} messageId - the message id sent by discord api (came from uploadFile method i recommend storing the id with image url for Future access to the message )
     * * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
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
  async findOne(messageId,channel = { name: "", id: "" }) {
    try {
      const getId = await this.find(channel);
      for (let i = 0; i < getId.length; i++) {
        if (getId[i].id == messageId) {
          return getId[i];
        }
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param {String} fileId - the message id sent by discord api (came from uploadFile method i recommend storing the id with image url for feature access to the message )
   * @param {String} content - data to edit or update the body of the specified discord message id.
   * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
   * @note this method does not support file uploading if you edited a file with this method the file will be replaced by the text you entered bby the file url will still be in the cloud untouched
   * @example {Object} return - {
   *    id:'',
   *  ----------
   * -----------
   *    content:'',
   *    attachments:'' (files)
   * }
   */
  async updateOne(fileId, content, channel = { name: "", id: "" }) {
    try {
      const url = `https://discord.com/api/v9/channels/${this.channelMapper[channel.name] || channel.id}/messages/${fileId}`;
      const res = await axios.patch(
        url,
        { content },
        {
          headers: {
            authorization: this.token,
          },
        }
      );
      return res.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param {String} fileId - the message id sent by discord api (came from uploadFile method i recommend storing the id with image url for feature access to the message )
   * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
   * @example {Boolean} return - true
   */

  async deleteOne(fileId, channel = { name: "", id: "" }) {
    try {
      const url = `https://discord.com/api/v9/channels/${this.channelMapper[channel.name] || channel.id}/messages/${fileId}}`;
      const res = await axios.delete(url, {
        headers: {
          authorization: this.token,
        },
      });
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * function to delete all messages in the channel.
   * @example {Boolean} return - true
   */

  async deleteMany() {
    try {
      const getId = await this.find();
      for (let i = 0; i < getId.length; i++) {
        const url = `https://discord.com/api/v9/channels/${this.channelMapper[channel.name] || channel.id}/messages/${getId[i].id}`;
        const res = await axios.delete(url, {
          headers: {
            authorization: this.token,
          },
        });
      }
      return true;
    } catch (error) {
      throw error;
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
      const url = `https://discord.com/api/v9/channels/${this.channelMapper[channel.name] || channel.id}/messages`;

      const form = new FormData();
      form.append("file", file, fileName);

      // when passing stream this func will throw error so this is soe workaround to prevent this
      form.getLengthSync = null;

      const res = await axios.post(url, form, {
        headers: {
          ...form.getHeaders(),
          authorization: this.token,
        },
      });
      res.data.attachments[0].id = res.data.id;
      return res.data.attachments[0];
    } catch (error) {
      if (error?.response?.data?.code === 40005) {
        throw new Error("Request entity too large, Discord only accepts less than 8mb of files");
      } else {
        throw error;
      }
    }
  }

  /**
   *
   * @param {String} fileId - the message id sent by discord api (came from uploadFile method i recommend storing the id with image url for feature access to the message )
   * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
  */
  async deleteMessageById(fileId, channel = { name: "", id: "" }) {
    try {
      const url = `https://discord.com/api/v9/channels/${
        this.channelMapper[channel.name] || channel.id
      }/messages/${fileId}`;
      const res = await axios.delete(url, {
        headers: {
          authorization: this.token,
        },
      });
      return true;
    } catch (error) {
      if(error?.response?.data?.message)
        throw new Error(error?.response?.data?.message);
      else{
        throw error
      }
    }
  }
  /**
   * @param {String} fileURL - the file url came from uploadFile method
   * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
   */
  async deleteFileByURL(fileURL) {
    try {
      const channel = { id: fileURL.match(/attachments\/(\d+)/)[1] };
      const attachments = await axios.get(`https://discord.com/api/v9/channels/${channel.id}/messages`, {
        headers: {
          authorization: this.token,
        },
      });
      const fileId = attachments.data.find((attachment) => attachment.attachments[0]?.url === fileURL)?.id;
      if (!fileId) throw new Error("no file was found");
      return await this.deleteMessageById(fileId, channel);
    } catch (error) {
      throw error;
    }
  }
  /**
   * @param {String} email - discord email
   * @param {String} password - discord password
   * @returns {this} instant from the class
   * @example call - discordDatabase.login('email','password')
   * @description this method is for login to discord and obtain the token this method will overwrite the token you put in the constructor , you can obtain the token from the class by using the token property discordDatabase.token
   */
  async login(email, password) {
    try {
      const res = await axios.post(
        "https://discord.com/api/v9/auth/login",
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
      throw error;
    }
  }
}
module.exports = DiscordDatabase;
