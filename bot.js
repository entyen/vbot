const Promise = require('bluebird')
const mongoose = require('mongoose')
const CronJob = require('cron').CronJob;

const fs = require('fs')
const tea = JSON.parse(fs.readFileSync('config.json', 'utf-8'))

const VkBot = require('node-vk-bot-api')
const Markup = require('node-vk-bot-api/lib/markup')
const Scene = require('node-vk-bot-api/lib/scene');
const Session = require('node-vk-bot-api/lib/session');
const Stage = require('node-vk-bot-api/lib/stage');
const bot = new VkBot(tea.TOKEN);

const userSchem = require('./schema/data.js')
const userdb = mongoose.model('users', userSchem)

const lang = JSON.parse(fs.readFileSync(`./lang/ru.json`, 'utf-8'))

const users = async (ctx) => {
    let user = await userdb.findOne({ userid: ctx.message.user_id })
    if (!user){
        user = await userdb.create({ userid: ctx.message.user_id, balance: 0, tel: 0, bl: 0, lang: 'en'})  
    }

    return user
}

const scene = new Scene('menu', 
    async (ctx) => {

        users(ctx)
        let user = await userdb.findOne({ userid: ctx.message.user_id })

        ctx.reply(lang[1], null, Markup
            .keyboard([
                [
                  Markup.button(lang[0], 'primary'),
                ],

                [
                  Markup.button(user.userid, 'secondary'),
                  Markup.button(lang[3], 'positive'),
                  Markup.button(`${user.balance} ${lang[5]}`, 'secondary'),
                ],
            ])
            )
        ctx.scene.leave()
    },

    async (ctx) => {
        ctx.scene.next()
        ctx.reply(lang[6], null, Markup
            .keyboard([
                [
                  Markup.button(lang[6], 'primary'),
                  Markup.button(lang[6], 'primary'),
                ],
            ])
            )
    },

    async (ctx) => {
        // user = await userdb.updateOne({userid: ctx.message.user_id}, {$set: {lang: ctx.message.body}})  

        await ctx.scene.leave()
        await ctx.reply(`${lang[6]} ${ctx.message.body}`)
        await ctx.scene.enter('menu', [0])
    },
)


const session = new Session()
const stage = new Stage(scene)
bot.use(session.middleware())
bot.use(stage.middleware())

const getSessionKey = (ctx) => {
  const userId = ctx.message.from_id || ctx.message.user_id;

  return `${userId}`;
}

bot.command(lang[2], async (ctx) => {
    ctx.scene.enter('menu', [0])
})

bot.command(lang[3], async (ctx) => {
    ctx.scene.enter('menu', [0])
})

bot.command(lang[0], async (ctx) => {
    ctx.scene.enter('menu', [1])
})


bot.on((ctx) => {
    ctx.reply(`${ctx.message.body} ${lang[4]}`, null, Markup
        .keyboard([
            [
              Markup.button(lang[2], 'primary'),
            ],
        ])
    )
})

bot.startPolling((err) => {
    !!err ? console.error(err) : console.log('Bot Started')
})

//DataBase
mongoose.connect(`mongodb://${tea.DBUSER}:${tea.DBPASS}@${tea.SERVER}/${tea.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(() => {
    console.log('MongoDB connected!!')
}).catch(err => {
    console.log('Failed to connect to MongoDB', err)
})