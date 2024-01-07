const { default: axios } = require("axios")

module.exports = class HTTPRequest {
    constructor(token) {
        this.headers = {
            headers: {
                authorization: token
            }
        }
    }

    async GET(url) {
        const res = await axios.get(url, this.headers)

        return res.data
    }

    async POST(url, body) {
        const res = await axios.post(url, body, this.headers)

        return res.data
    }

    async PATCH(url, body) {
        const res = await axios.patch(url, body, this.headers)

        return res.data
    }

    async DELETE(url, body) {
        const res = await axios.delete(url, body, this.headers)

        return res.data
    }
}