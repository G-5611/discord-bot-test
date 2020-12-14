const Discord = require('discord.js');
const client = new Discord.Client();
const token = process.env.TOKEN_BOT;
var prefix = "+";

console.log(token);
client.login(token);

client.on("ready", () => {
  console.log("Bot is online");
  //console.log(`Bot is online, with ${client.users.size} users, in ${client.channels.size} channels, in ${client.guilds.size} servers.`);
  //client.user.setGame(`Working in ${client.guilds.size} servers.`);
})


client.on("message", async message =>{
  if(message.author.bot) return;
  if(message.channel.type === "dm") return;

  //const args = message.content.slice(prefix.lenght).trim().split(/ +/g);
 //const commando = args.shift().toLowerCase();

  if(message.content.startsWith(prefix + "ping")) {
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! The latency is ${m.createdTimestamp - message.createdTimestamp}ms.`)
  }
});

