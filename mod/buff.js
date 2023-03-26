module.exports = async(bot, user, lang) => {
        const timestamp = new Date().getTime()
        //NEWBY BUFF
        if (user.buffs.newby < timestamp) {
            if (user.timers.buffNewByAlert) {
                await user.set('timers', false, 'buffNewByAlert')
                await user.dec('boosters', 1, 'energyCount')
                await user.dec('boosters', 1, 'energyRegen')
                if (user.alert === true) {
                    // await bot.sendMessage(user.id, `Действие баффа ${lang.newby} рассеялось.`)
                }
            }
        } else
        if (user.buffs.newby > timestamp) {
            if (!user.timers.buffNewByAlert) {
                await user.set('timers', true, 'buffNewByAlert')
                await user.inc('boosters', 1, 'energyCount')
                await user.inc('boosters', 1, 'energyRegen')
            }
        }
        //VIP BUFF
        if (user.buffs.vip <= timestamp && user.acclvl < 4) {
            if (!user.timers.buffVipAlert) {
                await user.set('timers', true, 'buffVipAlert')
                await user.set('acclvl', 0)
                if (user.alert === true) {
                    // await bot.sendMessage(user.id, `Действие баффа ${lang.vip} рассеялось.`)
                }
            }
        } else
        if (user.buffs.vip >= timestamp && user.acclvl < 4) {
            if (user.timers.buffVipAlert) {
                await user.set('timers', false, 'buffVipAlert')
                await user.set('acclvl', 1)
                if (user.alert === true) {
                    // await bot.sendMessage(user.id, `Вы ощущаете на себе действие ${lang.vip}.`)
                }
            }
        }
        //BAN DE-BUFF
        if (user.buffs.ban <= timestamp && user.acclvl < 7) {
            if (!user.timers.buffBanAlert) {
                await user.set('timers', true, 'buffBanAlert')
                await user.set('acclvl', 0)
                // await bot.sendMessage(user.id, `Действие ${lang.ban} рассеялось.`)
            }
        } else
        if (user.buffs.ban >= timestamp && user.acclvl < 7) {
            if (user.timers.buffBanAlert) {
                await user.set('timers', false, 'buffBanAlert')
                await user.set('acclvl', -1)
                // await bot.sendMessage(user.id, `Вы ощущаете на себе действие ${lang.ban}.`)
            }
        }

        if (user.buffs.rate1st <= timestamp) {
            if (!user.timers.buffRate1St) {
                await user.set('timers', true, 'buffRate1St')
                await user.dec('boosters', 15, 'harvest')
                if (user.alert === true) {
                    // await bot.sendMessage(user.id, `Действие ${lang.rate1st} рассеялось.`)
                }
            }
        } else
        if (user.buffs.rate1st >= timestamp) {
            if (user.timers.buffRate1St) {
                await user.set('timers', false, 'buffRate1St')
                await user.inc('boosters', 15, 'harvest')
                if (user.alert === true) {
                    // await bot.sendMessage(user.id, `Вы ощущаете на себе действие ${lang.rate1st}.`)
                }
            }
        }

        if (user.buffs.rate2st <= timestamp) {
            if (!user.timers.buffRate2St) {
                await user.set('timers', true, 'buffRate2St')
                await user.dec('boosters', 10, 'harvest')
                if (user.alert === true) {
                    // await bot.sendMessage(user.id, `Действие ${lang.rate2st} рассеялось.`)
                }
            }
        } else
        if (user.buffs.rate2st >= timestamp) {
            if (user.timers.buffRate2St) {
                await user.set('timers', false, 'buffRate2St')
                await user.inc('boosters', 10, 'harvest')
                if (user.alert === true) {
                    // await bot.sendMessage(user.id, `Вы ощущаете на себе действие ${lang.rate2st}.`)
                }
            }
        }

        if (user.buffs.rate3st <= timestamp) {
            if (!user.timers.buffRate3St) {
                await user.set('timers', true, 'buffRate3St')
                await user.dec('boosters', 10, 'harvest')
                if (user.alert === true) {
                    // await bot.sendMessage(user.id, `Действие ${lang.rate3st} рассеялось.`)
                }
            }
        } else 

        if (user.buffs.rate3st >= timestamp) {
            if (user.timers.buffRate3St) {
                await user.set('timers', false, 'buffRate3St')
                await user.inc('boosters', 10, 'harvest')
                if (user.alert === true) {
                    // await bot.sendMessage(user.id, `Вы ощущаете на себе действие ${lang.rate3st}.`)
                }
            }
        }

        if (user.buffs.rate9st <= timestamp) {
            if (!user.timers.buffRate9St) {
                await user.set('timers', true, 'buffRate9St')
                await user.dec('boosters', 5, 'harvest')
                if (user.alert === true) {
                    // await bot.sendMessage(user.id, `Действие ${lang.rate9st} рассеялось.`)
                }
            }
        } else 

        if (user.buffs.rate9st >= timestamp) {
            if (user.timers.buffRate9St) {
                await user.set('timers', false, 'buffRate9St')
                await user.inc('boosters', 5, 'harvest')
                if (user.alert === true) {
                    // await bot.sendMessage(user.id, `Вы ощущаете на себе действие ${lang.rate9st}.`)
                }
            }
        }

        if (user.buffs.energyWell <= timestamp) {
            if (!user.timers.buffEnergyWell) {
                await user.set('timers', true, 'buffEnergyWell')
                await user.dec('boosters', 1, 'energyRegen')
                if (user.alert === true) {
                    // await bot.sendMessage(user.id, `Действие ${lang.energyWell} рассеялось.`)
                }
            }
        } else 

        if (user.buffs.energyWell >= timestamp) {
            if (user.timers.buffEnergyWell) {
                await user.set('timers', false, 'buffEnergyWell')
                await user.inc('boosters', 1, 'energyRegen')
                if (user.alert === true) {
                    // await bot.sendMessage(user.id, `Вы ощущаете на себе действие ${lang.energyWell} восстановление Энергии ускоренно.`)
                }
            }
        }
}