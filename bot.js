const Promise = require('bluebird')
// const mongoose = require('mongoose')
const CronJob = require('cron').CronJob;

const fs = require('fs')
const tea = JSON.parse(fs.readFileSync('config.json', 'utf-8'))
const lang = JSON.parse(fs.readFileSync('en.json', 'utf-8'))

const VkBot = require('node-vk-bot-api');
const bot = new VkBot(tea.TOKEN);

bot.command('Start', (ctx) => {
  ctx.reply('Hello!');
  console.log(ctx)
});

bot.startPolling();

//DataBase
// mongoose.connect(`mongodb://${tea.DBUSER}:${tea.DBPASS}@${tea.SERVER}/${tea.DB}`, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useFindAndModify: false,
//     useCreateIndex: true
// }).then(() => {
//     console.log('MongoDB connected!!')
// }).catch(err => {
//     console.log('Failed to connect to MongoDB', err)
// })