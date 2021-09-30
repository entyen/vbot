module.exports = async(bot, i, user, lang) => {
        const timestamp = new Date().getTime()
        //NEWBY BUFF
        if (user[i].buffs.newby < timestamp) {
            if (user[i].timers.buffNewByAlert) {
                await user[i].set('timers', false, 'buffNewByAlert')
                await user[i].dec('boosters', 1, 'energyCount')
                await user[i].dec('boosters', 1, 'energyRegen')
                if (user[i].alert === true) {
                    await bot.sendMessage(user[i].id, `Действие баффа ${lang.newBy} рассеялось.`)
                }
            }
        } else
        if (user[i].buffs.newby > timestamp) {
            if (!user[i].timers.buffNewByAlert) {
                await user[i].set('timers', true, 'buffNewByAlert')
                await user[i].inc('boosters', 1, 'energyCount')
                await user[i].inc('boosters', 1, 'energyRegen')
            }
        }
        //VIP BUFF
        if (user[i].buffs.vip <= timestamp && user[i].acclvl < 4) {
            if (!user[i].timers.buffVipAlert) {
                await user[i].set('timers', true, 'buffVipAlert')
                await user[i].set('acclvl', 0)
                if (user[i].alert === true) {
                    await bot.sendMessage(user[i].id, `Действие баффа ${lang.Vip} рассеялось.`)
                }
            }
        } else
        if (user[i].buffs.vip >= timestamp && user[i].acclvl < 4) {
            if (user[i].timers.buffVipAlert) {
                await user[i].set('timers', false, 'buffVipAlert')
                await user[i].set('acclvl', 1)
                if (user[i].alert === true) {
                    await bot.sendMessage(user[i].id, `Вы ощущаете на себе действие ${lang.Vip}.`)
                }
            }
        }
        //BAN DE-BUFF
        if (user[i].buffs.ban <= timestamp && user[i].acclvl < 7) {
            if (!user[i].timers.buffBanAlert) {
                await user[i].set('timers', true, 'buffBanAlert')
                await user[i].set('acclvl', 0)
                await bot.sendMessage(user[i].id, `Действие ${lang.ban} рассеялось.`)
            }
        } else
        if (user[i].buffs.ban >= timestamp && user[i].acclvl < 7) {
            if (user[i].timers.buffBanAlert) {
                await user[i].set('timers', false, 'buffBanAlert')
                await user[i].set('acclvl', -1)
                await bot.sendMessage(user[i].id, `Вы ощущаете на себе действие ${lang.ban}.`)
            }
        }

        if (user[i].buffs.rate1st <= timestamp) {
            if (!user[i].timers.buffRate1St) {
                await user[i].set('timers', true, 'buffRate1St')
                await user[i].dec('boosters', 15, 'harvest')
                if (user[i].alert === true) {
                    await bot.sendMessage(user[i].id, `Действие ${lang.Rate1St} рассеялось.`)
                }
            }
        } else
        if (user[i].buffs.rate1st >= timestamp) {
            if (user[i].timers.buffRate1St) {
                await user[i].set('timers', false, 'buffRate1St')
                await user[i].inc('boosters', 15, 'harvest')
                if (user[i].alert === true) {
                    await bot.sendMessage(user[i].id, `Вы ощущаете на себе действие ${lang.Rate1St}.`)
                }
            }
        }

        if (user[i].buffs.rate2st <= timestamp) {
            if (!user[i].timers.buffRate2St) {
                await user[i].set('timers', true, 'buffRate2St')
                await user[i].dec('boosters', 10, 'harvest')
                if (user[i].alert === true) {
                    await bot.sendMessage(user[i].id, `Действие ${lang.Rate2St} рассеялось.`)
                }
            }
        } else
        if (user[i].buffs.rate2st >= timestamp) {
            if (user[i].timers.buffRate2St) {
                await user[i].set('timers', false, 'buffRate2St')
                await user[i].inc('boosters', 10, 'harvest')
                if (user[i].alert === true) {
                    await bot.sendMessage(user[i].id, `Вы ощущаете на себе действие ${lang.Rate2St}.`)
                }
            }
        }

        if (user[i].buffs.rate3st <= timestamp) {
            if (!user[i].timers.buffRate3St) {
                await user[i].set('timers', true, 'buffRate3St')
                await user[i].dec('boosters', 10, 'harvest')
                if (user[i].alert === true) {
                    await bot.sendMessage(user[i].id, `Действие ${lang.Rate3St} рассеялось.`)
                }
            }
        } else 

        if (user[i].buffs.rate3st >= timestamp) {
            if (user[i].timers.buffRate3St) {
                await user[i].set('timers', false, 'buffRate3St')
                await user[i].inc('boosters', 10, 'harvest')
                if (user[i].alert === true) {
                    await bot.sendMessage(user[i].id, `Вы ощущаете на себе действие ${lang.Rate3St}.`)
                }
            }
        }

        if (user[i].buffs.rate9st <= timestamp) {
            if (!user[i].timers.buffRate9St) {
                await user[i].set('timers', true, 'buffRate9St')
                await user[i].dec('boosters', 5, 'harvest')
                if (user[i].alert === true) {
                    await bot.sendMessage(user[i].id, `Действие ${lang.Rate9St} рассеялось.`)
                }
            }
        } else 

        if (user[i].buffs.rate9st >= timestamp) {
            if (user[i].timers.buffRate9St) {
                await user[i].set('timers', false, 'buffRate9St')
                await user[i].inc('boosters', 5, 'harvest')
                if (user[i].alert === true) {
                    await bot.sendMessage(user[i].id, `Вы ощущаете на себе действие ${lang.Rate9St}.`)
                }
            }
        }

        if (user[i].buffs.energyWell <= timestamp) {
            if (!user[i].timers.buffEnergyWell) {
                await user[i].set('timers', true, 'buffEnergyWell')
                await user[i].dec('boosters', 1, 'energyRegen')
                if (user[i].alert === true) {
                    await bot.sendMessage(user[i].id, `Действие ${lang.energyWell} рассеялось.`)
                }
            }
        } else 

        if (user[i].buffs.energyWell >= timestamp) {
            if (user[i].timers.buffEnergyWell) {
                await user[i].set('timers', false, 'buffEnergyWell')
                await user[i].inc('boosters', 1, 'energyRegen')
                if (user[i].alert === true) {
                    await bot.sendMessage(user[i].id, `Вы ощущаете на себе действие ${lang.energyWell} восстановление Энергии ускоренно.`)
                }
            }
        }
}