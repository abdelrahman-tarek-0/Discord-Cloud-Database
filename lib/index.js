const FormData = require("form-data");
const axios = require("axios");
const fs = require("fs");

/**
 * @property {String} token - discord token user account
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
      const url = `https://discord.com/api/v9/channels/${
        this.channelMapper[channel.name] || channel.id
      }/messages`;

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
      return res.data.attachments[0];
    } catch (error) {
      if (error?.response?.data?.code === 40005) {
        throw new Error(
          "Request entity too large, Discord only accepts less than 8mb of files"
        );
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
  async #deleteFile(fileId, channel = { name: "", id: "" }) {
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
      throw error;
    }
  }

  /**
   * @param {String} fileURL - the file url came from uploadFile method
   * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
   */
  async deleteFileByURL(fileURL) {
    try {
      const channel = { id: fileURL.match(/attachments\/(\d+)/)[1] };

      const attachments = await axios.get(
        `https://discord.com/api/v9/channels/${channel.id}/messages`,
        {
          headers: {
            authorization: this.token,
          },
        }
      );
      const fileId = attachments.data.find(
        (attachment) => attachment.attachments[0].url === fileURL
      ).id;
      return await this.#deleteFile(fileId, channel);
    } catch (error) {
      throw error;
    }
  }
  /**
   * @param {String} email - discord email
   * @param {String} password - discord password
   * @returns {String} token string if login is done and token saved
   * @example call - discordDatabase.login('email','password')
   * @description this method is for login to discord and get the token if you have the token you can use the class without login By passing the token to the constructor
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
      return res.data.token;
    } catch (error) {
      throw error;
    }
  }
}
module.exports = DiscordDatabase;
