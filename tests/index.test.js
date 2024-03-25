const DiscordDatabase = require('../src/index')
const fs = require('fs')
const dotenv = require('dotenv').config()

const fileBuffer = fs.readFileSync(`${__dirname}/pyr.file`)
const fileStream = fs.createReadStream(`${__dirname}/some-rar-for-test.rar`)

const isBot = true

const token = isBot ? process.env.DISCORD_BOT_TOKEN : process.env.DISCORD_TOKEN

const discordDatabase = new DiscordDatabase({
    token,
    channels: {
        tours: process.env.TOURS_CHANNEL_ID,
        users: process.env.USERS_CHANNEL_ID,
    },
    Bot: isBot,
    CacheProvider: new RedisProvider({
        url: process.env.REDIS_URL,
    }),
})

const main = async () => {
    // const token = await discordDatabase.login(process.env.DISCORD_EMAIL, process.env.DISCORD_PASS) // deprecated
    // console.log(token);

    const image = await discordDatabase.uploadFile({
        file: fileBuffer,
        filename: 'pyr.file',
        channel: 'users',
    })
    const rar = await discordDatabase.uploadFile({
        file: fileStream,
        filename: 'some-rar-for-test.rar',
        content: 'this a rar',
        channel: 'tours',
    })

    const image2 = await discordDatabase.uploadFile({
        file: fileBuffer,
        filename: 'pyr.file',
        channel: 'tours',
    })
    const ahmed = await discordDatabase.insertOne(
        { name: 'ahmed', age: 25 },
        'users'
    )

    console.log(image)
    console.log(rar)
    console.log(image2)
    console.log(ahmed)

    if (!image?.url || !rar?.url || !image2 || !ahmed) return

    const userAhmed = await discordDatabase.findOne(ahmed.id, 'users')
    console.log(userAhmed)

    const editedAhmed = await discordDatabase.updateOne(
        ahmed.id,
        { name: 'ahmed', age: 31 },
        'users'
    )
    console.log(editedAhmed)

    const editedFile = await discordDatabase.updateOne(
        rar.id,
        'this is not a rar anymore',
        'tours'
    )
    console.log(editedFile)

    let ack1, ack2, ack3, ack4
    try {
        ack1 = await discordDatabase.deleteFileByURL(image.url)
        ack2 = await discordDatabase.deleteMessageById(image2.id, 'tours')
        ack3 = await discordDatabase.deleteFileByURL(rar.url)
        ack4 = await discordDatabase.deleteMessageById(ahmed.id, 'users')
    } catch (error) {
        console.log(error)
    }

    console.log(ack1, ack2, ack3, ack4) // true true true true
}

main()
