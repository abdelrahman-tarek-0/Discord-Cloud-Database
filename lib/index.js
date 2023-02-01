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

        } catch (error) {
            
        }
    }
}