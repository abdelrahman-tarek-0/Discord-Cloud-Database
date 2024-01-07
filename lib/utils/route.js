const RouteBase = {
   api: 'https://discord.com/api/v9',
}

module.exports.Routes = {
   /**
    * @param {string} channelId
    * @returns
    */
   channel(channelId) {
      return `${RouteBase.api}/channels/${channelId}`
   },

   /**
    * @param {string} channelId
    * @returns
    */
   channelMessages(channelId) {
      return `${RouteBase.api}/channels/${channelId}/messages`
   },

   /**
    * @param {string} channelId
    * @param {string} messageId
    * @returns
    */
   channelMessage(channelId, messageId) {
      return `${RouteBase.api}/channels/${channelId}/messages/${messageId}`
   },

   login() {
      return `${RouteBase.api}/auth/login`
   },
}
