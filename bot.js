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

bot.use(async (ctx, next) => {
  ctx.message.timestamp = new Date().getTime()
  if (ctx.message.user_id) {
      ctx.user = await userdb.findOne({ userid: ctx.message.user_id })
      const response = await bot.execute('users.get', {
        user_ids: ctx.message.user_id,
      })
      if (!ctx.user) {
          await userdb.create({ userid: ctx.message.user_id, f_name: response[0].first_name, acclvl: 0, balance: 0.00, tel: 0, bl: 0, lang: 'en'})
          ctx.user = await userdb.findOne({ userid: ctx.message.user_id })
      }
      if (ctx.user.f_name != response[0].first_name) {
          await userdb.updateOne({userid: ctx.user.userid}, {$set: {f_name: responce[0].first_name}})
          ctx.user = await userdb.findOne({ userid: ctx.message.user_id })
      }
  }

  return next()
})

const scene = new Scene('menu', 
    async (ctx) => {
        if (ctx.user.acclvl >= 5) {
            ctx.reply(lang[1], null, Markup
            .keyboard([
                [
                  Markup.button(lang[0], 'primary'),
                ],
                [
                  Markup.button(ctx.user.f_name, 'secondary'),
                  Markup.button(lang[3], 'positive'),
                  Markup.button(`${ctx.user.balance} ${lang[5]}`, 'secondary'),
                ],
                [
                  Markup.button(`${ctx.user.acclvl == 7 ? 'DEV': ctx.user.acclvl == 6 ? 'Admin' : ctx.user.acclvl == 5 ? 'Moder' : ctx.user.acclvl }`, 'negative'),
                ],
            ])
            )
        } else {
        ctx.reply(lang[1], null, Markup
            .keyboard([
                [
                  Markup.button(lang[0], 'primary'),
                ],
                [
                  Markup.button(ctx.user.f_name, 'secondary'),
                  Markup.button(lang[3], 'positive'),
                  Markup.button(`${ctx.user.balance} ${lang[5]}`, 'secondary'),
                ],
            ])
            )
        }
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

// const getSessionKey = (ctx) => {
//   const userId = ctx.message.from_id || ctx.message.user_id;

//   return `${userId}`;
// }

bot.command([lang[2], lang[3]], async (ctx) => {
    ctx.scene.enter('menu', [0])
})

bot.command(lang[0], async (ctx) => {
    ctx.scene.enter('menu', [1])
})

bot.command('bup', async (ctx) => {
    const umes = ctx.message.body.split(' ')
    let locUser = await userdb.findOne({ userid: umes[1] })
    if (!umes[1] || !umes[2]) { ctx.reply('Не верные значения') }
    else if (ctx.user.acclvl >= 7) {
        const balup = (locUser.balance + Number(umes[2]))
        await userdb.updateOne({userid: umes[1]}, {$set: {balance: balup.toFixed(2)}})  
        await ctx.reply(`@id${umes[1]} user balance up to ${umes[2] + lang[5]} current balance ${balup.toFixed(2) + lang[5]}`)
        await bot.sendMessage(umes[1], `Ваш баланс пополнен на ${umes[2] + lang[5]} текущий баланс ${balup.toFixed(2) + lang[5]}`)
    } else {
        ctx.reply(lang[7])
    }
})

bot.on(async (ctx) => {
    const cmb = ctx.message.body
    cmb === ctx.user.f_name ? ctx.reply('Ну да это ваше имя') :
    cmb === `${ctx.user.balance} ${lang[5]}` ? ctx.reply('Это ваш баланс')
    : ctx.reply(`${cmb} ${lang[4]}`, null, Markup
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