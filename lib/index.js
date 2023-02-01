const FormData = require('form-data');
const axios = require('axios');

class DiscordDatabase {
    constructor(token='',channelMapper={}){
        this.token = token
        this.channelMapper = channelMapper
    }

    async uploadFile(file,fileName=null,channel={name:'',id:''}){
        try {
            const url = `https://discord.com/api/v9/channels/${this.channelMapper[channel.name] || channel.id}/messages`

            const form = new FormData()
            form.append('file', file, fileName);

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