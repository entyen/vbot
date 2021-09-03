const bp = require('bluebird')
const CronJob = require('cron').CronJob;

//config file TOKEN OWER or other
const fs = require('fs')
const tea = JSON.parse(fs.readFileSync('config.json', 'utf-8'))
let lang = JSON.parse(fs.readFileSync(`./lang/ru.json`, 'utf-8'))

//vk api connect
const VkBot = require('node-vk-bot-api')
const Markup = require('node-vk-bot-api/lib/markup')
const bot = new VkBot({
  token: tea.TOKEN,
  group_id: tea.GROUP_ID,
  execute_timeout: 500, // in ms   (50 by default)
  polling_timeout: 250, // in secs (25 by default)
})

//db const
const mongoose = require('mongoose')
const userSchem = require('./schema/data.js')
const userdb = mongoose.model('users', userSchem)

const commands = require('./cmds/commands.js')
const scene = require('./cmds/scene.js')

//error and warn color
console.errore = (err) => console.error('\x1b[91m%s\x1b[0m', err)
console.warne = (warn) => console.warn('\x1b[33m%s\x1b[0m', warn)
console.loge = (log) => console.log('\x1b[96m%s\x1b[0m', log)

//middlewere for bot chek user in database or not create user
bot.use(async (ctx, next) => {
  ctx.timestamp = new Date().getTime()
  const date = new Date(new Date().toLocaleString('en-US', { timeZone: 'Etc/GMT-6' }))
//   ctx.message.text = ctx.message.text.replace('[club206762312|@vinmt] ', '')

  if (ctx.message.from_id && ctx.message.from_id > 0) {

      ctx.user = await userdb.findOne({ id: ctx.message.from_id })

      const response = await bot.execute('users.get', {
        user_ids: ctx.message.from_id,
      })

      if (!ctx.user) {
          const uidgen = await userdb.find({})
          await userdb.create({ 
              id: ctx.message.from_id,
              uid: uidgen.length,
              regDate: date,
              f_name: response[0].first_name, 
              acclvl: 0, 
              balance: 0.00, 
              lang: 'ru', 
              timers: { 
                  mainWork: null,
                  hasWorked: false, 
                  bonus: false 
                },
              inv: {
                herbs: 0,
                rareHerbs: 0,
                sand: 0,
                ore: 0,
                rareOre: 0,
                wood: 0,
              },
              invWeight: 100000,
              exp: 0,
              level: 0,
              energy: 100,
              race: 0,
              alert: false
          })
          ctx.user = await userdb.findOne({ id: ctx.message.from_id})
          await bot.sendMessage(tea.OWNER, `Новый Пользователь UID:${ctx.user.uid} Name:${ctx.user.f_name} @id${ctx.user.id}`)
      }

      if (ctx.user.f_name != response[0].first_name) {
          await userdb.updateOne({id: ctx.user.id}, {$set: {f_name: responce[0].first_name}})
          ctx.user = await userdb.findOne({ id: ctx.message.from_id})
      }

      if (ctx.user.exp === 100*(ctx.user.level+1)) { 
          ctx.user.exp = 0
          ctx.user.level = ctx.user.level + 1
          await ctx.user.save()
      }
  }


  return next()
})

// bot.event('message_event', (ctx) => {
//     const payload = ctx.message.payload.button
//     if (payload === 'help') {
//         ctx.reply('Охуеть оно работает')
//         console.log(ctx.message)
//     }
// })

//scene constant here
scene(bot, lang, bp)

//commands module
commands(bot, lang, userdb, bp)

//Start polling messages
bot.startPolling((err) => {
    !!err ? console.errore(err) : console.loge('Bot Started')
})

const job = new CronJob('*/5 * * * *', null, false, 'Europe/Moscow')
    job.addCallback(async () => {
        user = await userdb.find({})
        for (i = 0; i < user.length; i++) { 
            user[i].energy === 100 ? null : user[i].energy = user[i].energy + 1
            await user[i].save()
            }
    })
job.start()

//Connect of DataBse
mongoose.connect(`mongodb://${tea.DBUSER}:${tea.DBPASS}@${tea.SERVER}/${tea.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(() => {
    console.loge('MongoDB connected!!')
}).catch(err => {
    console.errore('Failed to connect to MongoDB', err)
})