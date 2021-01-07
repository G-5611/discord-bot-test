require('dotenv').config({silent: true});
const Discord = require('discord.js');
const { executionAsyncResource } = require('async_hooks');
const ytdl = require("ytdl-core");
const { YTSearcher } = require('ytsearcher');
const client = new Discord.Client();
const token = process.env.TOKEN_BOT;
const ApiKeyYT = process.env.YT_KEY;

const queue = new Map();

const searcher = new YTSearcher({
  key: `${ApiKeyYT}`,
  revealed: true
});

var prefix = "+";

client.login(token);

client.on("ready", () => {
  console.log("Bot is online");
})

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});


client.on("message", async message =>{
  if(message.author.bot) return;
  if(message.channel.type === "dm") return;

  const serverQueue = queue.get(message.guild.id);

  const args = message.content.slice(prefix.length).trim().split(/ +/g)
  const url = args[1].split("&")[0];
  const command = args.shift().toLowerCase();

  //PLAY/SKIP/STOP
  switch(command){
    case 'play':
        execute(message, serverQueue, url);
        break;
    case 'stop':
        stop(message, serverQueue);
        break;
    case 'skip':
        skip(message, serverQueue);
        break;
}

  //PING COMMAND
  if(message.content.startsWith(prefix + "ping")) {
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! The latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`)
  }

  async function execute(message, serverQueue, url){
    let vc = message.member.voice.channel;
    if(!vc){
        return message.channel.send("Please join a voice chat first");
    }else{
        let result = await searcher.search(url, { type: "video" })
        const songInfo = await ytdl.getInfo(result.first.url)

        let song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url
        };

        if(!serverQueue){
            const queueConstructor = {
                txtChannel: message.channel,
                vChannel: vc,
                connection: null,
                songs: [],
                volume: 10,
                playing: true
            };
            queue.set(message.guild.id, queueConstructor);

            queueConstructor.songs.push(song);

            try{
                let connection = await vc.join();
                queueConstructor.connection = connection;
                play(message.guild, queueConstructor.songs[0]);
            }catch (err){
                console.error(err);
                queue.delete(message.guild.id);
                return message.channel.send(`Unable to join the voice chat ${err}`)
            }
        }else{
            serverQueue.songs.push(song);
            return message.channel.send(`The song has been added ${song.url}`);
        }
    }
}
function play(guild, song){
    const serverQueue = queue.get(guild.id);
    if(!song){
        serverQueue.vChannel.leave();
        queue.delete(guild.id);
        return;
    }
    const dispatcher = serverQueue.connection
        .play(ytdl(song.url))
        .on('finish', () =>{
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        serverQueue.txtChannel.send(`Now playing ${serverQueue.songs[0].url}`)
}
function stop (message, serverQueue){
    if(!message.member.voice.channel)
        return message.channel.send("You need to join the voice chat first!")
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}
function skip (message, serverQueue){
    if(!message.member.voice.channel)
        return message.channel.send("You need to join the voice chat first");
    if(!serverQueue)
        return message.channel.send("There is nothing to skip!");
    serverQueue.connection.dispatcher.end();
}
});
  
  

