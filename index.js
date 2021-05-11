const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const Discord = require('discord.js');
const client = new Discord.Client();
const permisionRole="FarmBotManager";
let debuging=false;
let plantsData;
let playerData;


client.on('ready', () => {
  console.log(`Połączono: ${client.user.tag}`)
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
  const noPermision= function(){send("tylko "+permisionRole+" może używać tej komendy");}
  const wallet = function(){send("masz: "+playerData[msg.author.id].money)}

  const aded = function(){
    for (var i = 0; i < Object.keys(plantsData).length; i++) {
      const show = plantsData[Object.keys(plantsData)[i]];
      send(`Nazwa:**${Object.keys(plantsData)[i]}**, BuyPrice:**${show.buyPrice}**zł, growTime:**${show.growTime}**milisec, SellPrice:**${show.sellPrice}**zł`);
    }
    if (Object.keys(plantsData).length==0) {
      send("brak roślin");
    }
  }
  /*inne*/

  if (!playerData.hasOwnProperty(msg.author.id)) {
    if (debuging) {send("playerData nie zawiera:"+msg.author+"\n"+msg.author.username);}
    playerData[msg.author.id]={
      "surname":msg.author.username,
      "money":0,
      "farm":{
        "size":0,
        "plants":[]
      }
    }
    if (debuging) {send("wygenerowano"+msg.author+"w playerData")};
  }

  /*commands*/

  //admin

  if (getCommand()[0]=="#AdedPlants") {
    if (permision) {
      aded();
    }else{noPermision()}

  }

  if (getCommand()[0]=="#debuging") {
    if (permision) {
      if (getCommand().length!=2) {
        send("{true/false}");
      }else if(!(getCommand()[1]=="false" || getCommand()[1]=="true")){
        send("{true/false}");
      }else{
        debuging=getCommand()[1]=="true";
        send('debuging is now set to **'+debuging+'**');
      }
    }else{noPermision()}
  }

  if (getCommand()[0]=="#giveMoney") {
    if (permision) {
      if (getCommand().length!=2) {
        send("{ile?}");
      }else if(!parseInt(getCommand()[1])>0){
        send("liczba!!");
      }else{
        playerData[msg.author.id].money+=parseInt(getCommand()[1]);
        wallet();
      }
    }else{noPermision()}
  }

  if (getCommand()[0]=="#DelatePlant") {
    if (permision) {
     if (getCommand().length!=2){
      send("{nazwa}");
     }else if(!plantsData.hasOwnProperty(getCommand()[1])){
      send("nie ma takiej rośliny");
     }else{
      send("usunięto:"+ getCommand()[1]);
      send("pozostałe rośliny:");
      delete plantsData[getCommand()[1]];
      aded();
      if (Object.keys(plantsData).length==0) {
        send("brak roślin");
      }
    }
  }else{noPermision()}
  }

  if (getCommand()[0]=="#AdPlant") {
    if (permision) {
    if (getCommand().length!=5){
      send("{nazwa} {cenaKupnaNasion} {czas rośnięcia} {cenaSprzedarzy}");
    }else if(!parseInt(getCommand()[2])>0){
      send(parseInt(getCommand()[2]));
      send(getCommand()[2]);
      send("cena musi być liczbą!!")
    }else if(!parseInt(getCommand()[3])>0){
      send("czas musi być liczbą (pisz w minutach)")
    }else if(!parseInt(getCommand()[4])>0){
      send("cenaprzedarzy musi być liczbą (pisz w sekundach)")
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

  if (getCommand()[0]=="#wallet") {
    wallet();
  }

  if (getCommand()[0]=="#createFarm") {
    if (getCommand().length!=2) {
      send("{size}");
    }else if(!parseInt(getCommand()[1])>0){
      send("wielkość musi być liczbą!!");
    }else{
      if (debuging) {send("{debug} rozpoczęto tworzenie")}
      let farmSize=parseInt(getCommand()[1])*parseInt(getCommand()[1]);
      let farmPrice=farmSize*10;
      if (debuging) {send("{debug} "+farmSize+" "+farmPrice)}
      if (playerData[msg.author.id].money>=farmPrice) {
        playerData[msg.author.id].farm.size=farmSize;
        playerData[msg.author.id].money-=farmPrice;
        send("miałeś:"+playerData[msg.author.id].money);
        send("farma kosztuje:"+farmPrice);
        send("masz:"+playerData[msg.author.id].money)
        send("twoja farma ma teraz:"+farmSize+"pól");
      }else{
        wallet();
        send("fama kosztuje:"+farmPrice+"\n potzebujesz:"+farmPrice-playerData[msg.author.id].money);
      }
    }
  }


  fs.writeFileSync('appData/playerData.json', JSON.stringify(playerData));
  fs.writeFileSync('appData/plants.json', JSON.stringify(plantsData));
});
let token = JSON.parse(fs.readFileSync('token.json', 'utf8'));
client.login(token.token);
