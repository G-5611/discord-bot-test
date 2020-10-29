require('dotenv').config({silent: true});
const Discord = require('discord.js');

const bot = new Discord.Client();

const token = process.env.TOKEN_BOT;

bot.login(token)
bot.on('ready', () => {
    console.log('Ready to Use')
})

bot.on('message', msg => {
    if (msg.content === 'ping'){
        msg.reply('pong')
    }
})