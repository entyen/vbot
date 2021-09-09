const bp = require('bluebird')
const CronJob = require('cron').CronJob
const queue = require('queue')
const q = queue({ results: [] })

//config file TOKEN OWER or other
const fs = require('fs')
const tea = JSON.parse(fs.readFileSync('config.json', 'utf-8'))
let lang = JSON.parse(fs.readFileSync(`./lang/ru.json`, 'utf-8'))

//vk api connect
const VkBot = require('node-vk-bot-api')
const api = require('node-vk-bot-api/lib/api')
const Markup = require('node-vk-bot-api/lib/markup')
const bot = new VkBot({
    token: tea.TOKEN,
    group_id: tea.GROUP_ID,
    execute_timeout: 50, // in ms   (50 by default)
    polling_timeout: 25, // in secs (25 by default)

    // webhooks options only
    secret: tea.SECRETHOOK,                   // secret key (optional)
    confirmation: tea.CONFIRMATION,       // confirmation string
})

const express = require('express')
const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// app.post(`/${tea.GROUP_ID}`, bot.webhookCallback)

app.listen(3000, () => { console.loge('Running webhook') })

// bot.execute('',{ "type": "confirmation", "group_id": 206762312 })
//subscribe group check
// async function test() {
//     const test = await bot.execute('groups.isMember', {user_id: tea.OWNER, group_id: tea.GROUP_ID })
//     console.log(test)
// }
// test()

//db const
const mongoose = require('mongoose')
const userSchem = require('./schema/data.js')
const bankSchem = require('./schema/bank.js')
const userdb = mongoose.model('users', userSchem)
const bankdb = mongoose.model('bank', bankSchem)

const commands = require('./commands.js')

app.post('/post', function(request, response){
    response.send('ok');    // echo the result back
    app.get('/', async (req, res) => {
        let sloan = []
        sloan = request.body
        res.send(sloan)
    })
})
app.get('/users', async (req, res) => {
    user = await userdb.find({})
    res.send(`${JSON.stringify(user)}`)
})
app.get('/bank', async (req, res) => {
    bank = await bankdb.find({})
    res.send(`${JSON.stringify(bank)}`)
})

//error and warn color
console.errore = (err) => console.error('\x1b[91m%s\x1b[0m', err)
console.warne = (warn) => console.warn('\x1b[33m%s\x1b[0m', warn)
console.loge = (log) => console.log('\x1b[96m%s\x1b[0m', log)

//middlewere for bot chek user in database or not create user
bot.use(async (ctx, next) => {
    ctx.timestamp = new Date().getTime()
    const date = new Date(new Date().toLocaleString('en-US', {timeZone: 'Etc/GMT-6'}))
    // const storageGet = await bot.execute('storage.get', {
    //     user_id: ctx.message.peer_id,
    //     key: 'waitTime',
    // })


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
                    fish: 0,
                    rareFish: 0,
                },
                items: {
                    fishingRod: false,
                    bait: 0,
                    energyPotion: 0,
                },
                plot: {
                    own: false,
                    size: 0,
                    house: 0,
                    wh: 0,
                    temple: 0,
                    mc: 0,
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
            const massItems = [
            { count: ctx.user.inv.herbs*0.5 },
            { count: ctx.user.inv.sand*2 },
            { count: ctx.user.inv.ore*3 },
            { count: ctx.user.inv.wood*1 },
            { count: ctx.user.inv.fish*10 },
            ] 
            let sum = 0
            massItems.forEach((x,y,z) => sum += +massItems[y].count)
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
                    fish: 0,
                    rareFish: 0,
                },
                items: {
                    fishingRod: false,
                    bait: 0,
                    energyPotion: 0,
                },
                plot: {
                    own: false,
                    size: 0,
                    house: 0,
                    wh: 0,
                    temple: 0,
                    mc: 0,
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
            const massItems = [
            { count: ctx.user.inv.herbs*0.5 },
            { count: ctx.user.inv.sand*2 },
            { count: ctx.user.inv.ore*3 },
            { count: ctx.user.inv.wood*1 },
            { count: ctx.user.inv.fish*10 },
            ] 
            let sum = 0
            massItems.forEach((x,y,z) => sum += +massItems[y].count)
            return sum
        }

        ctx.user.currWeight = await weightMath()
        ctx.user._acclvl = ctx.user.acclvl == 0 ? lang.user : ctx.user.acclvl == 1 ? lang.vip : ctx.user.acclvl == 2 ? lang.plat :
            ctx.user.acclvl == 7 ? lang.dev : ctx.user.acclvl == 6 ? lang.adm : ctx.user.acclvl == 5 ? lang.moder : ctx.user.acclvl

        if (ctx.user.exp === 100 * (ctx.user.level + 1)) {
            await ctx.user.set('exp', 0)
            await ctx.user.inc('level', 1)
            await ctx.reply(`Поздравляю вы повысили уровень до ${ctx.user.level} 🎉`)
        }
    }
    else return

    return await next()
})


const Session = require('node-vk-bot-api/lib/session')
const Stage = require('node-vk-bot-api/lib/stage')

const {menu} = require('./scenes/menu')
const {setting} = require('./scenes/setting')

const session = new Session()
const stage = new Stage(menu, setting)
bot.use(session.middleware())
bot.use(stage.middleware())

commands(bot, lang, userdb, bp)

//Start polling messages
bot.startPolling((err) => {
    !!err ? console.errore(err) : console.loge('Bot Started')
})

const randCurr = (min, max) => {
    const rand = Math.random() * (max - min) + min
    return rand.toFixed(1)
}


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

cron.addCallback(async () => {
    const bank = await bankdb.findOne({id: 0})
    const massItems = [
    { n: 'herbs', count: bank.inv.herbs },
    { n: 'sand', count: bank.inv.sand },
    { n: 'wood', count: bank.inv.wood },
    { n: 'ore', count: bank.inv.ore },
    ] 
    massItems.sort((a,b) => {return b.count - a.count})
    let itemPrice = []
    const randX = randCurr(0.3,0.9)
    massItems.forEach( (x, y) => {return itemPrice[y] = {price: 0.4+y*randX , name: x.n}})
    const price = (prop, val) => {
        for (i=0; i < itemPrice.length; i++) {
            if (itemPrice[i][prop] === val){
                return itemPrice[i]
            }
        }
    }

    const sand = await price('name', 'sand')
    const wood = await price('name', 'wood')
    const ore = await price('name', 'ore')
    const herbs = await price('name', 'herbs')
    const fish = await randCurr(8,15)

    await bank.set('dpi', sand.price.toFixed(1), 'sand')
    await bank.set('dpi', wood.price.toFixed(1), 'wood')
    await bank.set('dpi', ore.price.toFixed(1), 'ore')
    await bank.set('dpi', herbs.price.toFixed(1), 'herbs')
    await bank.set('dpi', Math.round(fish), 'fish')

    const user = await userdb.find({})
    let rate = [{}]
    let result = `Рейтинг Игроков: \n`
    for (i = 0; i < user.length; i++) {
        if (user[i].balance > 0) {
            rate[i] = {vid: user[i].id, n: user[i].f_name, b: user[i].balance}
        }
    }
    rate.sort((a, b) => {
        return b.b - a.b
    })
    for (i = 0; i < 5; i++) {
        if (rate[i] !== undefined) {
            result += `${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅'} ${rate[i].n} = ${rate[i].b} ${lang.curr}\n`
        }
    }

    const widget = {
      title: "Top:",
      title_url: "https://vk.com/vinmt",
      title_counter: 5,
      more: "Информация",
      more_url: "https://vk.com/vinmt",
      text: `${result}`,
      descr: 
        `Цены на ресурсы:
        ${lang.sand}: ${sand.price.toFixed(1)}
        ${lang.ore}: ${ore.price.toFixed(1)}
        ${lang.wood}: ${wood.price.toFixed(1)}
        ${lang.herbs}: ${herbs.price.toFixed(1)}
        ${lang.fish}: ${Math.round(fish)}
        `,
    }
    try {
        api('appWidgets.update', {
            access_token: tea.WIGETTOKEN,
            code: `return ${JSON.stringify(widget)};`,
            type: 'text',
        })
    } catch (e) {console.errore(e)}

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
