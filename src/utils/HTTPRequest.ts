import axios, { AxiosRequestConfig } from 'axios' 

export default class HTTPRequest {
    private options: AxiosRequestConfig

    constructor(token: string) {
        this.options = {
            headers: {
                authorization: token
            }
        }
    }

    async GET(url: string) {
        const res = await axios.get(url, this.options)

        return res.data
    }

    async POST(url: string, body: any) {
        const res = await axios.post(url, body, this.options)

        return res.data
    }

    async PATCH(url: string, body: any) {
        const res = await axios.patch(url, body, this.options)

        return res.data
    }

    async DELETE(url: string) {
        const res = await axios.delete(url, this.options)

        return res.data
    }
}