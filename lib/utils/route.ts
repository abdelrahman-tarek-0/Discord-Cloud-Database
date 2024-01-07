const RouteBase = {
    api: "https://discord.com/api/v9",
}

export default {
    channel(channelId: string) {
        return `${RouteBase.api}/channels/${channelId}`
    },

    channelMessages(channelId: string) {
        return `${RouteBase.api}/channels/${channelId}/messages`
    },

    channelMessage(channelId: string, messageId: string) {
        return `${RouteBase.api}/channels/${channelId}/messages/${messageId}`
    },

    login() {
        return `${RouteBase.api}/auth/login`
    }
}