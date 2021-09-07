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
    execute_timeout: 50, // in ms   (50 by default)
    polling_timeout: 25, // in secs (25 by default)
})

//db const
const mongoose = require('mongoose')
const userSchem = require('./schema/data.js')
const bankSchem = require('./schema/data.js')
const userdb = mongoose.model('users', userSchem)
const bankdb = mongoose.model('bank', bankSchem)

const commands = require('./commands.js')

//error and warn color
console.errore = (err) => console.error('\x1b[91m%s\x1b[0m', err)
console.warne = (warn) => console.warn('\x1b[33m%s\x1b[0m', warn)
console.loge = (log) => console.log('\x1b[96m%s\x1b[0m', log)

//middlewere for bot chek user in database or not create user
bot.use(async (ctx, next) => {
    ctx.timestamp = new Date().getTime()
    const date = new Date(new Date().toLocaleString('en-US', {timeZone: 'Etc/GMT-6'}))

    if (ctx.message.from_id > 0 && ctx.message.id == 0) {
        try {
            if (ctx.message.text.split(' ')[0] === '[club206762312|@vinmt]') {
                const command = ctx.message.text.split(' ')[1]
                if (command === 'rate' || command === 'Рейтинг') {
                    user = await userdb.find({})
                    let rate = [{}]
                    let result = `Rate: \n`
                    for (i = 0; i < user.length; i++) {
                        if (user[i].balance > 0) {
                            rate[i] = {vid: user[i].id, n: user[i].f_name, b: user[i].balance}
                        }
                    }
                    rate.sort((a, b) => {
                        return b.b - a.b
                    })
                    for (i = 0; i < 9; i++) {
                        if (rate[i] !== undefined) {
                            result += `${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅'} @id${rate[i].vid}(${rate[i].n}) = ${rate[i].b} ${lang.curr}\n`
                        }
                    }
                    ctx.reply(result)
                } else {
                    await ctx.reply('Простите в публичных чатах не работаю я не такая!')
                }
            }
        } catch (e) {
            console.log(e)
        }
        return
    } else
    if (ctx.message.from_id > 0 && ctx.message.id > 0) {

        ctx.user = await userdb.findOne({id: ctx.message.from_id})
        ctx.bank = await bankdb.findOne({id: 0})

        if (!ctx.user) {
            const response = await bot.execute('users.get', {
                user_ids: ctx.message.from_id,
            })
            const uidgen = await userdb.countDocuments()
            await userdb.create({
                id: ctx.message.from_id,
                uid: uidgen,
                regDate: date,
                f_name: response[0].first_name,
                acclvl: 0,
                balance: 0.00,
                lang: 'ru',
                timers: {
                    mainWork: null,
                    hasWorked: false,
                    bonus: false,
                    eFullAlert: true
                },
                inv: {
                    herbs: 0,
                    rareHerbs: 0,
                    sand: 0,
                    ore: 0,
                    rareOre: 0,
                    wood: 0,
                },
                plot: {
                    own: false,
                    size: 0
                },
                invWeight: 50000,
                exp: 0,
                level: 0,
                energy: 100,
                race: 0,
                alert: true
            })
            ctx.user = await userdb.findOne({id: ctx.message.from_id})
            await bot.sendMessage(tea.OWNER, `Новый Пользователь UID:${ctx.user.uid} Name:${ctx.user.f_name} @id${ctx.user.id}`)
        }
        ctx.cmd = ctx.message.payload ? ctx.message.payload.replace(/["{}:]/g, '').replace('button', '') : ctx.message.payload
        const weightMath = async () => {
            let wi = JSON.stringify(ctx.user.inv).replace(/["{}:]/g, '').replace(/[a-zA-Z]/g, '').split(',')
            let sum = 0
            wi.forEach(x => sum += (+x))
            return sum
        }
        ctx.user.currWeight = await weightMath()
        ctx.user._acclvl = ctx.user.acclvl == 0 ? lang.user : ctx.user.acclvl == 1 ? lang.vip : ctx.user.acclvl == 2 ? lang.plat :
            ctx.user.acclvl == 7 ? lang.dev : ctx.user.acclvl == 6 ? lang.adm : ctx.user.acclvl == 5 ? lang.moder : ctx.user.acclvl


        if (ctx.user.exp === 100 * (ctx.user.level + 1)) {
            ctx.user.exp = 0
            ctx.user.level = ctx.user.level + 1
            await ctx.user.save()
        }
    } else
    if (ctx.message.user_id) {

        ctx.user = await userdb.findOne({id: ctx.message.user_id})
        ctx.bank = await bankdb.findOne({id: 0})

        if (!ctx.user) {
            const response = await bot.execute('users.get', {
                user_ids: ctx.message.user_id,
            })
            const uidgen = await userdb.countDocuments()
            await userdb.create({
                id: ctx.message.user_id,
                uid: uidgen,
                regDate: date,
                f_name: response[0].first_name,
                acclvl: 0,
                balance: 0.00,
                lang: 'ru',
                timers: {
                    mainWork: null,
                    hasWorked: false,
                    bonus: false,
                    eFullAlert: true
                },
                inv: {
                    herbs: 0,
                    rareHerbs: 0,
                    sand: 0,
                    ore: 0,
                    rareOre: 0,
                    wood: 0,
                },
                plot: {
                    own: false,
                    size: 0
                },
                invWeight: 50000,
                exp: 0,
                level: 0,
                energy: 100,
                race: 0,
                alert: true
            })
            ctx.user = await userdb.findOne({id: ctx.message.user_id})
            await bot.sendMessage(tea.OWNER, `Новый Пользователь UID:${ctx.user.uid} Name:${ctx.user.f_name} @id${ctx.user.id}`)
        }

        ctx.cmd = ctx.message.payload.cmd
        const weightMath = async () => {
            let wi = JSON.stringify(ctx.user.inv).replace(/["{}:]/g, '').replace(/[a-zA-Z]/g, '').split(',')
            let sum = 0
            wi.forEach(x => sum += (+x))
            return sum
        }
        ctx.user.currWeight = await weightMath()
        ctx.user._acclvl = ctx.user.acclvl == 0 ? lang.user : ctx.user.acclvl == 1 ? lang.vip : ctx.user.acclvl == 2 ? lang.plat :
            ctx.user.acclvl == 7 ? lang.dev : ctx.user.acclvl == 6 ? lang.adm : ctx.user.acclvl == 5 ? lang.moder : ctx.user.acclvl

        if (ctx.user.exp === 100 * (ctx.user.level + 1)) {
            ctx.user.exp = 0
            ctx.user.level = ctx.user.level + 1
            await ctx.user.save()
        }

    }
    else {
        return
    }


    return next()
})


const Session = require('node-vk-bot-api/lib/session')
const Stage = require('node-vk-bot-api/lib/stage')

const {menu} = require('./scenes/menu')
const { Job } = require('./scenes/job')
const {market} = require('./scenes/market')
const {setting} = require('./scenes/setting')

const session = new Session()
const stage = new Stage(menu, Job.getScene(), market, setting)
bot.use(session.middleware())
bot.use(stage.middleware())

commands(bot, lang, userdb, bp)

//Start polling messages
bot.startPolling((err) => {
    !!err ? console.errore(err) : console.loge('Bot Started')
})

const cron = new CronJob('*/5 * * * *', null, false, 'Europe/Moscow')
cron.addCallback(async () => {
    user = await userdb.find({})
    for (i = 0; i < user.length; i++) {
        if (user[i].energy === 100) {
            if (user[i].alert) {
                if (!user[i].timers.eFullAlert) {
                    user[i].timers.eFullAlert = true
                    await user[i].save()
                    await bot.sendMessage(user[i].id, `Энергия полная, вперед тратить.`)
                }
            }
        } else {
            user[i].timers.eFullAlert = false
            user[i].energy = user[i].energy + 1
            await user[i].save()
        }
    }
})
cron.start()

userdb.prototype.inc = function (field, value, field2) {
  if (field2) {
    this[field][field2] += value
  } else {
    this[field] += value
  }
  return this.save()
}

userdb.prototype.dec = function (field, value, field2) {
  if (field2) {
    this[field][field2] -= value
  } else {
    this[field] -= value
  }
  return this.save()
}

userdb.prototype.set = function (field, value, field2) {
  if (field2) {
    this[field][field2] = value
  } else {
    this[field] = value
  }
  return this.save()
}

bankdb.prototype.inc = function (field, value, field2) {
  if (field2) {
    this[field][field2] += value
  } else {
    this[field] += value
  }
  return this.save()
}

bankdb.prototype.dec = function (field, value, field2) {
  if (field2) {
    this[field][field2] -= value
  } else {
    this[field] -= value
  }
  return this.save()
}

bankdb.prototype.set = function (field, value, field2) {
  if (field2) {
    this[field][field2] = value
  } else {
    this[field] = value
  }
  return this.save()
}

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
