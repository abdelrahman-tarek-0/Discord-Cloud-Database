const FormData = require('form-data');
const axios = require('axios');

class DiscordDatabase {
    constructor(token='',channelMapper={}){
        this.token = token
        this.channelMapper = channelMapper
    }
}