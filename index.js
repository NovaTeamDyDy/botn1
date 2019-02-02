const Discord = require('discord.js');
const client = new Discord.Client();
const token = ()process.env.token;
bot.login(token);


const sql = require("sqlite");
sql.open("./scores.sqlite");

// Set prefix 
const prefix = "/";

client.on("ready", () => {
    client.user.setActivity("Bot de support | /help");
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
});
client.on("message", (message) => {
    if(message.content.startsWith(`${prefix}new`)){
    const reason = message.content.split(" ").slice(1).join(" ");
    if (!message.guild.roles.exists("name", "Support Staff")) return message.channel.send(`This server doesn't have a \`Support Staff\` role made, so the ticket won't be opened.\nIf you are an administrator, make one with that name exactly and give it to users that should be able to see tickets.`);
    if (message.guild.channels.exists("name", "ticket-" + message.author.id)) return message.channel.send(`You already have a ticket open.`);
    message.guild.createChannel(`ticket-${message.author.id}`, "text").then(c => {
        let role = message.guild.roles.find("name", "Support Staff");
        let role2 = message.guild.roles.find("name", "@everyone");
        c.overwritePermissions(role, {
            SEND_MESSAGES: true,
            READ_MESSAGES: true
        });
        c.overwritePermissions(role2, {
            SEND_MESSAGES: false,
            READ_MESSAGES: false
        });
        c.overwritePermissions(message.author, {
            SEND_MESSAGES: true,
            READ_MESSAGES: true
        });
        message.channel.send(`:white_check_mark: Your ticket has been created, #${c.name}.`);
        const embed = new Discord.RichEmbed()
            .setColor(0xCF40FA)
            .addField(`Hey ${message.author.username}!`, `Merci d'indiquer ton probléme un staff répondra`)
            .setTimestamp();
        c.send({
            embed: embed
        });
    }).catch(console.error); 
}
})
client.on("message", (message) => {
    if(message.content.startsWith(`${prefix}help`)){
        message.author.send("**RJG Commands** \n \n**/new** - `Crée un channel de support.` \n **/close** - `Ferme le ticket support` \n **/ping** Donne la latence du bot");
        message.reply("Check tes mp.")
    }
})
function clean(text) {
    if (typeof(text) === "string")
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
}
client.on("guildCreate", (guild) => {
    client.user.setGame(`vhelp / vnew | ${client.guilds.size} servers`);
    guild.owner.user.send(`Hello! I'm Vectra Space\nThanks for adding me to your guild!\n\nView all of my commands with \`/help\`.\nLearn more about me with \`/about\`.`);
});

    // Ping Command
    client.on('message',message => {
        if(message.content.startsWith(`${prefix}new`)){
        const reason = message.content.split(" ").slice(1).join(" ");
        if (!message.guild.roles.exists("name", "Support Staff")) return message.channel.send(`This server doesn't have a \`Support Staff\` role made, so the ticket won't be opened.\nIf you are an administrator, make one with that name exactly and give it to users that should be able to see tickets.`);
        if (message.guild.channels.exists("name", "ticket-" + message.author.id)) return message.channel.send(`You already have a ticket open.`);
        message.guild.createChannel(`ticket-${message.author.id}`, "text").then(c => {
            let role = message.guild.roles.find("name", "Support Staff");
            let role2 = message.guild.roles.find("name", "@everyone");
            c.overwritePermissions(role, {
                SEND_MESSAGES: true,
                READ_MESSAGES: true
            });
            c.overwritePermissions(role2, {
                SEND_MESSAGES: false,
                READ_MESSAGES: false
            });
            c.overwritePermissions(message.author, {
                SEND_MESSAGES: true,
                READ_MESSAGES: true
            });
            message.channel.send(`:white_check_mark: Your ticket has been created, #${c.name}.`);
            const embed = new Discord.RichEmbed()
                .setColor(0xCF40FA)
                .addField(`Hey ${message.author.username}!`, `Please try explain why you opened this ticket with as much detail as possible. Our **Support Staff** will be here soon to help.`)
                .setTimestamp();
            c.send({
                embed: embed
            });
        }).catch(console.error); 
    }

   
    client.on('message',message => {
        if(message.content.startsWith(`${prefix}close`)){
        if (!message.channel.name.startsWith(`ticket-`)) return message.channel.send(`Seulement dans un channel ticket`);
        // Confirm delete - with timeout (Not command)
        message.channel.send(`Etes vous sur de vouloir fermer ce ticket ?\nPour confirmer faite \`/confirm\`.Vous avez 10 secondes avant que l'action s'annulle`)
            .then((m) => {
                message.channel.awaitMessages(response => response.content === '/confirm', {
                        max: 1,
                        time: 10000,
                        errors: ['time'],
                    })
                    .then((collected) => {
                        message.channel.delete();
                    })
                    .catch(() => {
                        m.edit('Ticket close timed out, the ticket was not closed.').then(m2 => {
                            m2.delete();
                        }, 3000);
                    });
            });
    }

function clean(text) {
    if (typeof(text) === "string")
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
}

// Message when bot joins server
var token = " ";
client.on("guildCreate", (guild) => {
    client.user.setGame(`vhelp / vnew | ${client.guilds.size} servers`);
    guild.owner.user.send(`Hello! I'm Vectra Space\nThanks for adding me to your guild!\n\nView all of my commands with \`/help\`.\nLearn more about me with \`/about\`.`);
});

client.on("message", (message) => {
    if (!isCommand(message) || message.author.bot) return;
    // Ping Command
    if (isCommand(message, "ping")) {
        message.channel.send(`Fetching!`).then(m => {
            m.edit(`**Bot** - ` + (m.createdTimestamp - message.createdTimestamp) + `ms.` + ` \n**Discord API** - ` + Math.round(client.ping) + `ms.`);
        });
    }
    // New ticket command
    if (isCommand(message, "new")) {
        const reason = message.content.split(" ").slice(1).join(" ");
        if (!message.guild.roles.exists("name", "Support Staff")) return message.channel.send(`This server doesn't have a \`Support Staff\` role made, so the ticket won't be opened.\nIf you are an administrator, make one with that name exactly and give it to users that should be able to see tickets.`);
        if (message.guild.channels.exists("name", "ticket-" + message.author.id)) return message.channel.send(`You already have a ticket open.`);
        message.guild.createChannel(`ticket-${message.author.id}`, "text").then(c => {
            let role = message.guild.roles.find("name", "Support Staff");
            let role2 = message.guild.roles.find("name", "@everyone");
            c.overwritePermissions(role, {
                SEND_MESSAGES: true,
                READ_MESSAGES: true
            });
            c.overwritePermissions(role2, {
                SEND_MESSAGES: false,
                READ_MESSAGES: false
            });
            c.overwritePermissions(message.author, {
                SEND_MESSAGES: true,
                READ_MESSAGES: true
            });
            message.channel.send(`:white_check_mark:Votre ticket a bien étè crée, #${c.name}.`);
            const embed = new Discord.RichEmbed()
                .setColor(0xCF40FA)
                .addField(`Hey ${message.author.username}!`, `Merci de marquer pourquoi vous voulez ouvrir un ticket.`)
                .setTimestamp();
            c.send({
                embed: embed
            });
        }).catch(console.error); // Send errors to console
    }

    // Close ticket command
    client.on('message',message => {
        if(message.content.startsWith(`${prefix}close`)){
        if (!message.channel.name.startsWith(`ticket-`)) return message.channel.send(`Vous pouvez seulement utiliser cette commande dans un ticket`);
        // Confirm delete - with timeout (Not command)
        message.channel.send(`Etes vous sur de vouloir fermer ce ticket\nPour confirmer taper \`/confirm\`.Vous avez 10 secondes`)
            .then((m) => {
                message.channel.awaitMessages(response => response.content === '/confirm', {
                        max: 1,
                        time: 10000,
                        errors: ['time'],
                    })
                    .then((collected) => {
                        message.channel.delete();
                    })
                    .catch(() => {
                        m.edit('Ticket close timed out, the ticket was not closed.').then(m2 => {
                            m2.delete();
                        }, 3000);
                    });
            });
    }

});

function isCommand(message) {
    return message.content.toLowerCase().startsWith(prefix);
}

function isCommand(message, cmd) {
    return message.content.toLowerCase().startsWith(prefix + cmd);
}
 
})
    })
})
