const FormData = require('form-data');
const axios = require('axios');

class DiscordDatabase {
    /**
     * @param {Discord.Token} token - discord token user account 
     * @param {Object} channelMapper - simple map to map the ids of the channels  ex:{product:'7459996657'}
     * @returns instant from the class
     * @pre have discord user and server (join the user to server and make some channels) then you need to get the token of the user and the ids of the channel
     */
    constructor(token='',channelMapper={}){
        this.token = token
        this.channelMapper = channelMapper
    }

    async uploadFile(file,fileName=null,channel={name:'',id:''}){
        try {
            const url = `https://discord.com/api/v9/channels/${this.channelMapper[channel.name] || channel.id}/messages`

            const form = new FormData()
            form.append('file', file, fileName);

            // when passing stream this func will throw error so this is soe workaround to prevent this
            form.getLengthSync = null;

            const res = await axios.post(url, form, {
                headers: {
                  ...form.getHeaders(),
                  authorization: this.token
                },
            })
            return res.data.attachments[0]

        } catch (error) {
            if(error?.response?.data?.code === 40005){
                throw new Error('Request entity too large, Discord only accepts less than 8mb of files')
            }else{
                throw error
            }
        }
    }
}

module.exports = DiscordDatabase