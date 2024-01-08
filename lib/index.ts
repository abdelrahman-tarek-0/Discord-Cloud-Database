import errorHandler from "./utils/errorHandler";
import Routes from './utils/route'
import HTTPRequest from "./utils/HTTPRequest";
import { MessageAPI } from "./types/Discord";
import { ReadStream } from "fs";
import { NodeCacheProvider, RedisProvider } from "./CacheManager";

interface Message {
    id: string
    body?: string
    filename?: string;
    size?: number;
    url?: string;
    proxy_url?: string;
    content_type?: string;
    timestamp: number
}

interface DiscordDatabaseOptions {
    token: string
    channels: { [key: string]: string | undefined }
    Bot?: boolean
    CacheProvider?: NodeCacheProvider | RedisProvider
}

export default class DiscordDatabase {
    private token: string;
    private channelMapper: Map<string, string>; // channel-name -> channel id
    private bot: boolean;
    private cache: NodeCacheProvider | RedisProvider;
    private rest: HTTPRequest

    constructor({token, channels, Bot = true, CacheProvider }: DiscordDatabaseOptions) {
        if (!token) throw new Error("token is required");

        if (!channels) throw new Error("channelMapper is required");

        if (Bot) this.token = 'Bot ' + token
        else this.token = token

        this.channelMapper = new Map()
        this.rest = new HTTPRequest(this.token);
        this.bot = Bot;

        if (!CacheProvider) this.cache = new NodeCacheProvider({ })
        else this.cache = CacheProvider
        

        for (let data in channels) {
            const ChannelId = channels[data]

            if (!ChannelId) continue

            this.channelMapper.set(data, ChannelId)
        }
    }

    /**
        *
        * @param {Sting} content - String data to be sent on discord
        * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
        * @returns {Object} { id: "the id of the message sent to discord", bodyMessage: "the body of the message sent to the discord", date: "date", time: "time" }
        *@note this method only accepts text (file not supported please use uploadFileWithContent)
       * @example call  - await DiscordDatabase.insertOne('some text',{name:'users'})
       * @example return - {
           {  id: '1069989056534000000',
              bodyMessage: hello world,
              date: '2023-01-04,
              time: '10:30:00 }
         }
        * @pre have discord user and server (join the user to server and ake soe channels) then you need to get the token of the user and the ids of the channel
        */
    async insertOne(content: any, channel: string): Promise<Message | undefined> {
        try {
            if (!channel) throw new Error("channel is required");

            const channelId = this.channelMapper.get(channel) || channel

            const data: MessageAPI = await this.rest.POST(Routes.channelMessages(channelId), { content: JSON.stringify(content) })

            const { id, content: body, timestamp } = data

            const result = { id, body, timestamp: Date.parse(timestamp) };

            this.cache.set(id, result)
            this.cache.del(channelId)

            return result
        } catch (error) {
            errorHandler(error)
        }
    }

    /**
        *
        * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
        * @returns {array<Object>} all the messages in a channel
        * @example call - await DiscordDatabase.find({name:'users'})
        * @example {array} return - {
           [
             {Object...},
             {Object...},
             {Object...}
           ]
       }    
        */
    async find(channel: string): Promise<Message[]> {
        try {
            if (!channel) throw new Error("channel is required");

            const channelId = this.channelMapper.get(channel) || channel

            const cache = this.cache.get(channelId) as any as Message[]

            if (cache) return cache

            const data: MessageAPI[] = await this.rest.GET(Routes.channelMessages(channelId))

            const result: Message[] = data.map(({ id, content, attachments, timestamp }) => {
                const attachment = attachments?.length ? attachments[0] : { filename: '', size: 0, url: '', proxy_url: '', content_type: '' }

                return {
                    id,
                    body: content,
                    filename: attachment.filename,
                    size: attachment.size,
                    url: attachment.url,
                    proxy_url: attachment.proxy_url,
                    content_type: attachment.content_type,
                    timestamp: Date.parse(timestamp),
                }
            })
            this.cache.set(channelId, result)

            return result
        } catch (error) {
            errorHandler(error)

            return []
        }
    }

    /**
        *
        * @param {String} messageId - the message id sent by discord api (came from uploadFile method i recommend storing the id with image url for Future access to the message )
        * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
        * @returns {Object} - the message returned by discord api
        * @example call - await DiscordDatabase.findOne('12251445',{name:'users'})
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
    async findOne(messageId: string, channel: string): Promise<Message | undefined> {
        try {
            if (!channel) throw new Error("channel is required");

            const channelId = this.channelMapper.get(channel) || channel
            const cache = this.cache.get(messageId)  as any as Message

            if (cache) return cache

            // Only bots can get a message by id
            if (!this.bot) {
                const messages = await this.find(channel)

                return messages.find(message => message.id === messageId)
            } else {
                // this will fail if client is not a bot
                const { id, content, timestamp } = await this.rest.GET(Routes.channelMessage(channelId, messageId))
                const result = { id, content, timestamp: Date.parse(timestamp) }

                this.cache.set(messageId, result)

                return result
            }
        } catch (error) {
            errorHandler(error)
        }
    }

    /**
     * @param {String} messageId - the message id sent by discord api (came from uploadFile method i recommend storing the id with image url for feature access to the message )
     * @param {String} content - data to edit or update the body of the specified discord message id.
     * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
     * @returns {Object} - updated message returned by discord api
     * @note this method does not support file uploading if you edited a file (file with no message content) with this method this will result an error (only use if the message is text or the message is a file with a content text)
     * @example call - await DiscordDatabase.updateOne('15555147','i am editing',{name:'users'})
     * @example {Object} return - {
     *    id:'',
     *  ----------
     * -----------
     *    content:'',
     *    attachments:'' (files)
     * }
     */
    async updateOne(messageId: string, content: any, channel: string): Promise<Message | undefined> {
        try {
            if (!channel) throw new Error("channel is required");

            const channelId = this.channelMapper.get(channel) || channel

            const { id, content: body, timestamp } = await this.rest.PATCH(Routes.channelMessage(channelId, messageId), { content: JSON.stringify(content) })
            const result = { id, body, timestamp: Date.parse(timestamp) };

            this.cache.set(id, result);
            this.cache.del(channelId)

            return result;
        } catch (error) {
            errorHandler(error);
        }
    }

    async stream2Blob(stream: ReadStream): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = []

            stream
                .on('data', (chunk: Buffer) => chunks.push(chunk))
                .once('end', () => resolve(Buffer.concat(chunks)))
                .once('error', reject)
        })
    }

    async uploadFile({ channel, filename, file, content }: { channel: string, file: Buffer | ReadStream, filename: string, content?: string }): Promise<Message | undefined> {
        let BufferFile = null

        if (file instanceof ReadStream) BufferFile = await this.stream2Blob(file);
        else BufferFile = file

        try {
            if (!channel) throw new Error("channel is required");

            const channelId = this.channelMapper.get(channel) || channel

            const form = new FormData();
            form.append("file", new Blob([BufferFile]), filename);

            if (content) form.append("content", content);

            const data = await this.rest.POST(Routes.channelMessages(channelId), form);

            data.attachments[0].id = data.id;
            data.attachments[0].timestamp = Date.parse(data.timestamp);

            if (content) data.attachments[0].content = data.content;

            const result = data.attachments[0];

            this.cache.set(result.id, result);
            this.cache.del(channelId);

            return result;
        } catch (error: any) {
            if (error?.response?.data?.code === 40005) {
                throw new Error("Request entity too large, Discord only accepts less than 8mb of files");
            } else {
                errorHandler(error);
            }
        }
    }

    /**
     *
     * @param {String} messageId - the message id sent by discord api (came from uploadFile method i recommend storing the id with image url for feature access to the message )
     * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
     * @returns {Promise<Boolean>} true if success
     * @example call - await DiscordDatabase.deleteMessageById('5555555',{name:'users'})
     * @example return - Promise<status>
     */
    async deleteMessageById(messageId: string, channel: string): Promise<boolean | undefined> {
        try {
            if (!messageId) throw new Error("messageId is required");

            if (!channel) throw new Error("channel is required");

            const channelId = this.channelMapper.get(channel) || channel

            await this.rest.DELETE(Routes.channelMessage(channelId, messageId))

            this.cache.del(messageId)
            this.cache.del(channelId)

            return true;
        } catch (error: any) {
            if (error?.response?.data?.message) {
                throw new Error(error?.response?.data?.message);
            } else {
                errorHandler(error);
            }

        }
    }

    /**
     * @param {String} fileURL - the file url came from uploadFile method
     * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
     * @returns {Boolean} true if success
     * @example call - await DiscordDatabase.deleteFileByURL('https://cdn.discordapp.com/attachments/123/123/some-name.jpg',{name:'users'})
     * @example return - Promise<status>
     */
    async deleteFileByURL(fileURL: string): Promise<boolean | undefined> {
        try {
            const channelIdMatch = fileURL.match(/attachments\/(\d+)/)?.[1];

            if (!channelIdMatch) throw new Error("Unable to extract channel ID from file URL");

            const attachments = await this.find(channelIdMatch);

            const fileId = attachments.find((attachment) => attachment.url === fileURL)?.id;

            if (!fileId) throw new Error("no file was found");

            this.cache.del(fileId)
            this.cache.del(channelIdMatch)

            return await this.deleteMessageById(fileId, channelIdMatch);
        } catch (error) {
            errorHandler(error);
        }
    }

    /**
     * method to delete all messages in the channel.
     * @param {Object} channel - Discord channel {id or name(if you put map to the constructor you can use the name only)}
     * @example call - deleteMany({name:'products'})
     * @example {Boolean} return - true
     * @note - not recommended (heavy requests on discord API result in getting banned) only use on the low amount of data (50 messages recommended)
     * @deprecated - due to the fact that it is not recommended to use this method, and it is better to use the deleteOne method
     */
    async deleteMany(channel: string) {
        try {
            if (!channel) throw new Error("channel is required");

            const channelId = this.channelMapper.get(channel) || channel

            const getId = await this.find(channel);

            for (let i = 0; i < getId.length; i++) {
                await this.rest.DELETE(Routes.channelMessage(channelId, getId[i].id));
            }

            this.cache.del(channelId);

            return true;
        } catch (error) {
            errorHandler(error);
        }
    }
}
