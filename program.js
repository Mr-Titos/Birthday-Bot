require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');
const token = process.env.DISCORD_TOKEN;

var prefix = '*';
var dat = new Date();
var tabBirthhday;
var stringifyBirthday;
var dayBirthday;
var monthBirthday;
var yearBirthday;


try {
bot.on('ready', function () {
  console.log("Birthday-Bot connecté !");
  setInterval(timerBirthday, 1800000);  //30 minutes = 1800000 ms
  setInterval(resetTimer, 259200000); // 3 days
fs.readFile('prefix.txt', 'utf8', (err, StringTemp) => {
    if (err) {
        console.log("File read failed:", err)
        return
    } else {
        try {
            prefix = StringTemp;
            console.log(StringTemp);
            loadPrefix(prefix);
    } catch(err) {
            console.log('Error Prefix string:', err)
        } 
    }
});
loadBirthday();

})
} catch (exc) { console.log(exc); }

try {
bot.on('message', msg => {
if(msg.author.bot == false ) {
    if(msg.content.substring(0,1) == prefix) {
        if(msg.content.substring(1,14) == "birthday add ") { //Faire en sorte que cette commande soit usable que des ADMINISTRATEURS
            var validiteBirthday = true;                //Puis en faire une 2em ou on peut enregister son propre anniv
            addBirthday(msg).catch(function(err) { msg.reply(err); validiteBirthday = false; }).then(function() {
                if(validiteBirthday == true) {
                    msg.reply("L'anniversaire a bien été ajouté !");
                    loadBirthday();
                    validiteBirthday = true;
                } else {
                    validiteBirthday = true;
                }
            });
        } else if(msg.content.substring(1, 5) == "help") {
            msg.reply("3 commandes sont disponibles : \r\n- " + prefix + "birthday add @mention Jour Mois Annee \r\n- " + prefix + "prefix <Nouveau Prefix> \r\n- " + prefix + "help")
        }
        else if(msg.content.substring(1,7) == "prefix") {
            loadPrefix(msg.content.substring(8,9));
            msg.reply("Le prefix a bien été changé !");
        }
    } 
}
  });
}catch(exc) { 
    if(exc instanceof WebSocket) {
    } else {
        console.log(exc);
    }
}

function timerBirthday() {
    try {
    dat = new Date ();
    var strdat = dat.toLocaleDateString();
    console.log("Test Anniv -- D: " + strdat + " H: " + dat.getHours() +"h" + dat.getMinutes());
    tabBirthhday.Birthday.forEach(Birthday => {
        if(dat.getDate() +'-' + (dat.getMonth() + 1) == Birthday.day + '-' + Birthday.month && Birthday.etat == "false") {
            var serv = bot.guilds.get(Birthday.id);
            var general = serv.channels.find(c => c.name == "general" && c.type == "text" || c.name == "général" && c.type == "text");
            var age = parseInt(dat.getUTCFullYear()) - Birthday.year;
            general.send("@everyone Joyeux anniversaire à <@" + Birthday.name + "> ! " + Birthday.label + " a maintenant " + age + " ans de moins à vivre !");
            console.log("Joyeux anniversaire " + Birthday.label + "! Ca fait " + age + " ans");
            Birthday.etat = "true";
        }
    })
} catch(exc) { console.log(exc); }
}

function addBirthday(msg) {
    // command frame :<prefix>birthday add <@131930102224125954> day month year
    return new Promise(function (resolve, reject1) {
    try{
        processBirthday(msg).then(function(id) {
        var day = dayBirthday *1;
        var month = monthBirthday *1;
        var year = yearBirthday;
        var label;
        var idTemp;
        var name;
        var userTemp = bot.fetchUser(id);
        userTemp.then(function(data) {
            label = data.username;
            idTemp = msg.guild.id;
            name = data.id;
            console.log("/birthday add " + name + " " + day + "-" + month + "-" + year + "-" + idTemp);
            verifBirthday(idTemp, name).then(function() {
                var jsonData = '{"id":"' + idTemp + '"' + ',"name":"' + name + '"' +',"day":"' + day +'"' + ',"month":"' + month +'"' +',"year":"' + year +'"' + ',"label":"' + label +'"' +',"etat":"false"}';
                var student = JSON.parse(jsonData);
                tabBirthhday.Birthday.push(student);
                stringifyBirthday = JSON.stringify(tabBirthhday, null, 2);
                fs.writeFile('Birthday.json', stringifyBirthday, (err) => {
                    if (err) throw err;
                    console.log('Birthday written to file');
                    resolve();
                });
            }).catch(function(err) { reject1("Impossible d'enregister cet anniversaire car cette personne est déjà enregistré sur ce serveur !"); console.log(err); });
        });
        }).catch(function() { reject1("Une erreur a été détéctée dans les données, veuillez la régler."); })
        
    } catch(err) { reject("Une erreur technique s'est produite lors de l'ajout de l'anniversaire, veuillez contactez #Titos#2671"); console.log(err); }
    });
        
}

function loadBirthday() {
    fs.readFile('Birthday.json', 'utf8', (err, jsonString) => {
        if (err) {
            console.log("File read failed:", err)
            return
        } else {
            try {
                tabBirthhday = JSON.parse(jsonString);
                stringifyBirthday = JSON.stringify(tabBirthhday.Birthday);
        } catch(err) {
                console.log('Error parsing Birthday JSON string:', err)
            } 
        }
    });
}

function processBirthday(msg) {
    return new Promise(function (resolve, reject) {
        var splitmsg = msg.content.split(' ');
        var finalId = new Array();
        dayBirthday = splitmsg[3].trim();
        monthBirthday = splitmsg[4].trim();
        yearBirthday = splitmsg[5].trim();
        Array.from(splitmsg[2]).forEach(msg => {
            if(msg != '<' && msg != '>' && msg != '@' && msg != ' ') {
                finalId += msg;
            }
        });

        if(!(dayBirthday *1 <32 && dayBirthday*1 > 0) || !(monthBirthday*1 > 0 && monthBirthday*1 < 13) || !(yearBirthday*1 > 1950 && yearBirthday*1 < 2019)) {
            reject();
        } else {
            console.log("Finalmsg-" + finalId + "---" + splitmsg[2].trim() + "-" + splitmsg[3].trim() + "-" + splitmsg[4].trim());
            resolve(finalId);
        }
    });
}

function verifBirthday(idTemp, name) {
    return new Promise(function (resolve, reject) {
        var compteur = 0;
        tabBirthhday.Birthday.forEach(Birthday => {
            if(Birthday.id == idTemp && Birthday.name == name){
                reject(new Error("Doublon enregistrement Birthday"));
            } else {
                compteur ++;
                if(compteur == tabBirthhday.Birthday.length) {
                    resolve();
                }
            }
        })
    });
}

function loadPrefix(prefixTemp) {
    fs.writeFile('prefix.txt', prefixTemp, (err) => {
        if (err) throw err;
        prefix = prefixTemp;
        console.log('Prefix written to file');
    });
    bot.user.setActivity(prefixTemp + "help");
}

function resetTimer() {
    anniv_Aincrad.forEach(Birthday => {
        Birthday.etat = false;
    })
}


bot.login(token);

