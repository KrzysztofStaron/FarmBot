const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const Discord = require('discord.js');
const client = new Discord.Client();
let permisionRole="FarmBotManager";
let prefix = ",";
let plantsData;
let playerData;

if (fs.existsSync("appData/playerData.json")) {
fs.writeFileSync('appData/playerData.json', "{}");
}

if (fs.existsSync("appData/plants.json")) {
fs.writeFileSync('appData/plants.json',  "{}");
}

client.on('ready', () => {
  console.log(`Connect: ${client.user.tag}`)
});


client.on('message', msg => {
  /*zmienne*/
  const permision=msg.member.roles.cache.some(r => r.name === permisionRole)
  plantsData = JSON.parse(fs.readFileSync('appData/plants.json'));
  playerData = JSON.parse(fs.readFileSync('appData/playerData.json'));

  /*funkcje*/
  if (msg.author.bot) {return;}
  const getMeasage = function() {return msg.content.toLowerCase();}
  const getCommand = function() {return msg.content.split(" ");}
  const send = function(txt) {msg.channel.send(txt);}
  const noPermision= function(){send("only "+permisionRole+" can use this command");}

  const aded = function(){
    for (var i = 0; i < Object.keys(plantsData).length; i++) {
      const show = plantsData[Object.keys(plantsData)[i]];
      send(`Name:**${Object.keys(plantsData)[i]}**, BuyPrice:**${show.buyPrice}**$, growTime:**${show.growTime}**milisec, SellPrice:**${show.sellPrice}**$`);
    }
    if (Object.keys(plantsData).length==0) {
      send("There is no plant in the system");
    }
  }
  /*inne*/

  if (!playerData.hasOwnProperty(msg.author.id)) {
    playerData[msg.author.id]={
      "surname":msg.author.username,
      "money":0,
      "farm":{
        "size":0,
        "plants":[]
      }
    }
  }

  /*commands*/

  //admin

  if (getCommand()[0]==prefix+"AdedPlants") {
    if (permision) {
      aded();
    }else{noPermision()}

  }

  if (getCommand()[0]==prefix+"giveMoney") {
    if (permision) {
      if (getCommand().length!=2) {
        send("{how many?}");
      }else if(!parseInt(getCommand()[1])>0){
        send("number!!");
      }else{
        playerData[msg.author.id].money+=parseInt(getCommand()[1]);
        send("You have:"+playerData[msg.author.id].money);
      }
    }else{noPermision()}
  }

  if (getCommand()[0]==prefix+"DelatePlant") {
    if (permision) {
     if (getCommand().length!=2){
      send("{name}");
     }else if(!plantsData.hasOwnProperty(getCommand()[1])){
      send("plant don't exist");
     }else{
      send("delete:"+ getCommand()[1])+"\n other plants:";
      delete plantsData[getCommand()[1]];
      aded();
    }
  }else{noPermision()}
  }

  if (getCommand()[0]==prefix+"AdPlant") {
    if (permision) {
    if (getCommand().length!=5){
      send("{name} {BuyPrice} {growTime} {sellPrice}");
    }else if(!parseInt(getCommand()[2])>0){
      send(parseInt(getCommand()[2]));
      send(getCommand()[2]);
      send("Price must be a number!!")
    }else if(!parseInt(getCommand()[3])>0){
      send("time must be a number(write in minutes)")
    }else if(!parseInt(getCommand()[4])>0){
      send("sellPrice myst be a number")
    }else{
      plantsData[getCommand()[1]]={
        "buyPrice":parseInt(getCommand()[2]),
        "growTime":parseInt(getCommand()[3])*60000,
        "sellPrice":parseInt(getCommand()[4])
      };
      send(`PlantName:**${getCommand()[1]}**, BuyPrice:**${getCommand()[2]}**zł, growTime:**${getCommand()[3]*60000}**milisec, SellPrice:**${getCommand()[4]}**zł`);
    }
  }else{noPermision()}
  }

  //normal user

  if (getCommand()[0]==prefix+"wallet") {
    send("You have:"+playerData[msg.author.id].money);
  }

  if (getCommand()[0]==prefix+"createFarm") {
    if (getCommand().length!=2) {
      send("{size}");
    }else if(!parseInt(getCommand()[1])>0){
      send("size must be a number!!");
    }else{
      let farmSize=parseInt(getCommand()[1])*parseInt(getCommand()[1]);
      let farmPrice=farmSize*10;
      if (playerData[msg.author.id].money>=farmPrice) {
        playerData[msg.author.id].farm.size=farmSize;
        playerData[msg.author.id].money-=farmPrice;
        send("u had:"+playerData[msg.author.id].money);
        send("farm price:"+farmPrice);
        send("now have:"+playerData[msg.author.id].money)
        send("your farm now contain:"+farmSize+"dirt tiles");
      }else{
        send("You have:"+playerData[msg.author.id].money);
        send("farm cost:"+farmPrice+"\n u need:"+farmPrice-playerData[msg.author.id].money);
      }
    }
  }


  fs.writeFileSync('appData/playerData.json', JSON.stringify(playerData));
  fs.writeFileSync('appData/plants.json', JSON.stringify(plantsData));
});

client.login(JSON.parse(fs.readFileSync('token.json', 'utf8')).token);
