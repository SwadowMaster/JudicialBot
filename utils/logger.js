const winston = require("winston"),
  colors = require("colors"),
  { EmbedBuilder, WebhookClient } = require('discord.js'),
  config = require('../config');
  
class Logger {
  constructor() {
    this.logger = winston.createLogger();
  }

  log(Text) {
    let d = new Date();
    console.log(
      colors.gray(
        `[${d.getDate()}:${d.getMonth()}:${d.getFullYear()} - ${d.getHours()}:${d.getMinutes()}]`
      ) + colors.green(" | " + Text)
    );
  }

  warn(Text) {
    let d = new Date();
    console.log(
      colors.gray(
        `[${d.getDate()}:${d.getMonth()}:${d.getFullYear()} - ${d.getHours()}:${d.getMinutes()}]`
      ) + colors.yellow(" | " + Text)
    );
  }
  

  debug(Text) {
    let d = new Date();
    console.log(
      colors.magenta(
        `[${d.getDate()}:${d.getMonth()}:${d.getFullYear()} - ${d.getHours()}:${d.getMinutes()}]`
      ) + colors.magenta(" | " + Text)
    );
  }
  WError(error) {
//    if (config.debug) return

    let d = new Date();
    this.logger.log({
      timeStamp: `[${d.getDate()}/${d.getMonth()}/${d.getFullYear()} - ${d.getHours()}:${d.getMinutes()}]`,
      level: "error",
      message: "error: " + error,
    });
    console.log(
      colors.gray(
        `[${d.getDate()}:${d.getMonth()}:${d.getFullYear()} - ${d.getHours()}:${d.getMinutes()}]`
      ) + colors.red(" | " + error)
    );
    if (config.debug) return console.log(error)
    let cError = "```" + (error?.stack || error) + "```";

    const webhookClient = new WebhookClient({ url: config.WError });

    const errorEmbed = new EmbedBuilder()
      .setTitle('ERROR')
      .setDescription(cError)
      .setThumbnail(config.botURL)
      .setColor(10038562);

   webhookClient.send({
     username: 'SanAndreasDCErrors',
     avatarURL: config.botURL,
     embeds: [errorEmbed],
   });

  }


}

module.exports = Logger;