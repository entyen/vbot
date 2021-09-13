const bp = require('bluebird')
const CronJob = require('cron').CronJob
const queue = require('queue')
const q = queue({ results: [] })

//config file TOKEN OWER or other
const FormData = require('form-data')
const fs = require('fs')
const tea = JSON.parse(fs.readFileSync('config.json', 'utf-8'))
let lang = JSON.parse(fs.readFileSync(`./lang/ru.json`, 'utf-8'))

//vk api connect
const axios = require('axios')
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

//modules
const commands = require('./commands.js')
const buff = require('./scenes/buff.js')

app.post('/post', function(request, response){
    response.send('ok');    // echo the result back
    app.get('/', async (req, res) => {
        let sloan = []
        sloan = request.body
        res.send('test')
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

app.listen(3000, () => { console.loge('Running webhook') })
//error and warn color
console.errore = (err) => console.error('\x1b[91m%s\x1b[0m', err)
console.warne = (warn) => console.warn('\x1b[33m%s\x1b[0m', warn)
console.loge = (log) => console.log('\x1b[96m%s\x1b[0m', log)

const utils = () => {}
utils.smChat = async (chat, msg) => {
    await bot.execute('messages.send', {
        random_id: 0,
        peer_id: chat,
        message: msg
    })
}
utils.rand = (min, max) => {
    const rand = math.random() * (max - min) + min
    return rand.tofixed(1)
}

//middlewere for bot chek user in database or not create user
bot.use(async (ctx, next) => {
    ctx.timestamp = new Date().getTime()
    // const storageGet = await bot.execute('storage.get', {
    //     user_id: ctx.message.peer_id,
    //     key: 'waitTime',
    // })

    if (ctx.message.peer_id === tea.REPORTCHAT) { 
        if (!ctx.message.reply_message) return
        const ansUsrId = ctx.message.reply_message.text.split('id')[1].split('|')[0]
        await ctx.reply(`Вы написали @id${ansUsrId}\n ${ctx.message.text}`)
        await bot.sendMessage(ansUsrId, `Ответ ТП:\n${ctx.message.text}`)
    }
    if (ctx.message.from_id > 0 && ctx.message.id == 0) {
        try {
            if (ctx.message.text.split(' ')[0] === '[club206762312|@vinmt]') {
                const command = ctx.message.text.split(' ')[1]
                if (command === 'rate' || command === 'Рейтинг') {
                    user = await userdb.find({})
                    let result = `Рейтинг: \n`
                    user = user.filter(x => x.acclvl < 3)
                    user = user.filter(x => x.balance > 0)
                    user = user.sort((a,b) => {return b.balance - a.balance})
                    for (i = 0; i < 9; i++) {
                        result += `${i === 0 ? '🥇': i === 1 ? '🥈': i === 2 ? '🥉' : '🏅'} @id${user[i].id}(${user[i].f_name}) = ${user[i].balance} ${lang.curr}\n`
                    }
                    ctx.reply(`${result}`)
                    return
                } else {
                    await ctx.reply('Простите но в публичных чатах доступна только команда \'Рейтинг\'')
                }
            }
        } catch (e) {
            console.log(e)
            ctx.reply('Что-то пошло не так ошибка')
        }
        return
    } else
    if (ctx.message.from_id > 0 && ctx.message.id > 0) {
        try {

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
                f_name: response[0].first_name,
            })
            ctx.user = await userdb.findOne({id: ctx.message.from_id})
            const newByBuffTime = +(ctx.user.buffs.newby-ctx.timestamp)/1000/60/60/24
            await bot.sendMessage(tea.OWNER, `Новый Пользователь UID:${ctx.user.uid} Name:${ctx.user.f_name} @id${ctx.user.id}`)
            await ctx.reply(`Вы получили ${lang.newBy} на ${Math.round(newByBuffTime)} Дней \nПроверить эффекты на себе можно в Настройках`, null, Markup.keyboard([[Markup.button('Меню', 'default', 'menu')]]))
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

        if (ctx.user.exp >= 100 * (ctx.user.level + 1)) {
            await ctx.user.set('exp', 0)
            await ctx.user.inc('level', 1)
            await ctx.reply(`Поздравляю вы повысили уровень до ${ctx.user.level} 🎉`)
        }

        } catch (e) {console.log(e)}
    } else
    if (ctx.message.user_id) {
        try {

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
                f_name: response[0].first_name,
            })
            ctx.user = await userdb.findOne({id: ctx.message.user_id})
            const newByBuffTime = +(ctx.user.buffs.newby-ctx.timestamp)/1000/60/60/24
            await bot.sendMessage(tea.OWNER, `Новый Пользователь UID:${ctx.user.uid} Name:${ctx.user.f_name} @id${ctx.user.id}`)
            await ctx.reply(`Вы получили ${lang.newBy} на ${Math.round(newByBuffTime)} Дней \nПроверить эффекты на себе можно в Настройках`, null, Markup.keyboard([[Markup.button('Меню', 'default', 'menu')]]))
        }

        ctx.message.payload ? ctx.cmd = ctx.message.payload.cmd : ctx.message.payload
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

        if (ctx.user.exp >= 100 * (ctx.user.level + 1)) {
            await ctx.user.set('exp', 0)
            await ctx.user.inc('level', 1)
            await ctx.reply(`Поздравляю вы повысили уровень до ${ctx.user.level} 🎉`)
        }

        } catch (e) {
            console.log(e)
            ctx.reply('Что-то пошло не так ошибка, напишите в репорт что случилось report \'Текст сообщения\'')
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

commands(bot, utils, lang, userdb, bp)

//Start polling messages
bot.startPolling((err) => {
    !!err ? console.errore(err) : console.loge('Bot Started')
})

const randCurr = (min, max) => {
    const rand = Math.random() * (max - min) + min
    return rand.toFixed(1)
}


//enegry regen check
const energy = new CronJob('*/3 * * * *', null, true, 'Europe/Moscow')
energy.addCallback(async () => {
    userEn = await userdb.find({})
    userEn.forEach( async (x,i,z) => {
     try {
        if(!userEn[i]) return
        if (userEn[i].energy >= (100 * userEn[i].boosters.energyCount)) {
            if (userEn[i].alert) {
                if (!userEn[i].timers.eFullAlert) {
                    await userEn[i].set('timers', true, 'eFullAlert')
                    await bot.sendMessage(userEn[i].id, `⚡ Энергия полная, вперед тратить. 🥳\n Если вы не хотите получать это уведомление вы можете отключить его в Настройках => Уведомления`)
                }
            }
        } else {
            await userEn[i].set('timers', false, 'eFullAlert')
            await userEn[i].inc('energy', userEn[i].boosters.energyRegen)
        }
     } catch(e) {
         console.errore(e)
         bot.sendMessage(tea.OWNER, 'error in energy regen')
     }
    })
})

//buff check
setInterval(async () => {
    user = await userdb.find({})
    user.forEach(async(x,i,z)=>{
        if(!user[i]) return
        await buff(bot, i, user, lang)
    })
}, 4000)

const updater = new CronJob('*/30 * * * *', null, true, 'Europe/Moscow')
updater.addCallback(async () => {
    const bank = await bankdb.findOne({id: 0})
    const massItems = [
    { n: 'herbs', count: bank.inv.herbs },
    { n: 'sand', count: bank.inv.sand },
    { n: 'wood', count: bank.inv.wood },
    { n: 'ore', count: bank.inv.ore },
    ] 
    massItems.sort((a,b) => {return b.count - a.count})
    let itemPrice = []
    const randX = randCurr(0.2,0.7)
    massItems.forEach( (x, y) => {return itemPrice[y] = {price: (y+1)*randX , name: x.n}})
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
    const fish = await randCurr(8,20)

    await bank.set('dpi', sand.price.toFixed(1), 'sand')
    await bank.set('dpi', wood.price.toFixed(1), 'wood')
    await bank.set('dpi', ore.price.toFixed(1), 'ore')
    await bank.set('dpi', herbs.price.toFixed(1), 'herbs')
    await bank.set('dpi', Math.round(fish), 'fish')

    user = await userdb.find({})
    let result = ``
    user = user.filter(x => x.acclvl < 3)
    user = user.filter(x => x.balance > 0)
    user = user.sort((a,b) => {return b.balance - a.balance})
    for (i = 0; i < 9; i++) {
            result += `${user[i].id} ${user[i].f_name} ${user[i].balance} `
    }
    const resultMass = result.split(' ') 
    const date = new Date().toLocaleTimeString('ru-RU', {timeZone: 'Etc/GMT-3'})

    const tableWiget = {
        title: `Обновлено: ${date}`,
        title_url: "https://vk.com/im?&sel=-206762312",
        head: [{
            text: "Рейтинг Игроков:"
        }, 
        {
            text: "Оргулов:",
        },
        {
            text: "Цены ресурсов:",
        }],
        body: 
        [
            [
            {
                icon_id: "205234117_774066",
                text: resultMass[1],
                url: `https://vk.com/id${resultMass[0]}`
            },
            {
                text: `${resultMass[2]} ${lang.curr}`,
            },
            {
                text: `${lang.sand}: ${sand.price.toFixed(1)}`,
            }
            ],
            [
            {
                icon_id: "205234117_774068",
                text: resultMass[4],
                url: `https://vk.com/id${resultMass[3]}`
            },
            {
                text: ` ${resultMass[5]} ${lang.curr}`,
            },
            {
                text: ` `,
            }
            ],
            [
            {
                icon_id: "205234117_774069",
                text: resultMass[7],
                url: `https://vk.com/id${resultMass[6]}`
            },
            {
                text: `${resultMass[8]} ${lang.curr}`,
            },
            {
                text: `${lang.ore}: ${ore.price.toFixed(1)}`,
            }
            ],
            [
            {
                icon_id: "205234117_774067",
                text: resultMass[10],
                url: `https://vk.com/id${resultMass[9]}`
            },
            {
                text: `${resultMass[11]} ${lang.curr}`,
            },
            {
                text: ` `,
            }
            ],
            [
            {
                icon_id: "205234117_774067",
                text: resultMass[13],
                url: `https://vk.com/id${resultMass[12]}`
            },
            {
                text: `${resultMass[14]} ${lang.curr}`,
            },
            {
                text: `${lang.wood}: ${wood.price.toFixed(1)}`,
            }
            ],
            [
            {
                icon_id: "205234117_774067",
                text: resultMass[16],
                url: `https://vk.com/id${resultMass[15]}`
            },
            {
                text: `${resultMass[17]} ${lang.curr}`,
            },
            {
                text: ` `,
            }
            ],
            [
            {
                icon_id: "205234117_774067",
                text: resultMass[19],
                url: `https://vk.com/id${resultMass[18]}`
            },
            {
                text: `${resultMass[20]} ${lang.curr}`,
            },
            {
                text: `${lang.herbs}: ${herbs.price.toFixed(1)}`,
            }
            ],
            [
            {
                icon_id: "205234117_774067",
                text: resultMass[22],
                url: `https://vk.com/id${resultMass[21]}`
            },
            {
                text: `${resultMass[23]} ${lang.curr}`,
            },
            {
                text: ` `,
            }
            ],
            [
            {
                icon_id: "205234117_774067",
                text: resultMass[25],
                url: `https://vk.com/id${resultMass[24]}`
            },
            {
                text: `${resultMass[26]} ${lang.curr}`,
            },
            {
                text: `${lang.fish}: ${Math.round(fish) === 20 ? `${Math.round(fish)} MAX`: Math.round(fish)}`,
            }
            ],
        ],
    }

    try {
        api('appWidgets.update', {
            access_token: tea.WIGETTOKEN,
            code: `return ${JSON.stringify(tableWiget)};`,
            type: 'table',
        })
    } catch (e) {console.errore(e)}

})

// const upload = require('./uploadMiddleware')
class photoGroupWiget {
    
    constructor() {

    }

    async testJob(imageType, photo) {

        let url = await api('appWidgets.getGroupImageUploadServer', {
            access_token: tea.WIGETTOKEN,
            image_type: imageType,
        })
        url = url.response.upload_url

        const form = new FormData()
        form.append('image', fs.createReadStream(photo));
        const {data} = await axios.post(url, form, {
            headers: form.getHeaders(),
        })


        api('appWidgets.saveGroupImage', {
            access_token: tea.WIGETTOKEN,
            hash: data.hash,
            image: data.image
        }).then(console.log)

    }

}

const photoWiget = new photoGroupWiget()
// photoWiget.testJob('24x24', './stN.png')

userdb.prototype.inc = function (field, value, field2) {
  if (field2) {
    this[field][field2] += +value
  } else {
    this[field] += +value
  }
  return this.save()
}

userdb.prototype.dec = function (field, value, field2) {
  if (field2) {
    this[field][field2] -= +value
  } else {
    this[field] -= +value
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
    this[field][field2] += +value
  } else {
    this[field] += +value
  }
  return this.save()
}

bankdb.prototype.dec = function (field, value, field2) {
  if (field2) {
    this[field][field2] -= +value
  } else {
    this[field] -= +value
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

process.on('uncaughtException', function (err) {
  console.errore(err);
  console.loge("Node NOT Exiting...");
})

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
