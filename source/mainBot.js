const { Client, GatewayIntentBits, Collection, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRow, ActionRowBuilder, ModalBuilder } = require("discord.js"),
  Logger = require('../utils/logger'),
  path = require('path'),
  fs = require('fs'),
  asciiTable = require("ascii-table"),
  ConfigFetcher = require("../utils/getConfig"),
  createDatabase = require("../database");

class mainBot extends Client {
  constructor(
    props = {
      intents: [
        GatewayIntentBits.Guilds,
        //GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
    }
  ) {
    super(props);

      ConfigFetcher()
        .then((conf) => {
          console.log("Config loaded");
          this.config = conf;
           this.db = createDatabase(this);
          this.build();
        })
        .catch((err) => {
          throw Error(err);
        });
        
    this.slashCommands = new Collection();
    this.logger = new Logger(path.join(__dirname, "..", "logs.log"));
    this.utils = require('../utils');

    this.loadEvents();
    this.loadCommands();
    
    this.userModalData = new Map();
  }


  //Start bot
  build() {
    this.log('Starting bot...')
    this.db.tryConnection();

    this.db.tryConnection().then(success => {
      if (success) {
        this.log("Conexión a la base de datos establecida correctamente");
      } else {
         this.warn("No se pudo conectar a la base de datos, configuracion incorrecta");
         process.exit(1);
      }
    });

    this.login(this.config.token)

    if (this.config.debug === true) {
      require('../scripts/deploy')
      this.debug("Debug mode is enabled!");
      this.debug("Auto reload Cmds enabled");
      setInterval(this.reloadCmds.bind(this), 5000);

      process.on("unhandledRejection", (error) => { console.log(error); return });
      process.on("uncaughtException", (error) => { console.log(error); return });

    } else {
      process.on("unhandledRejection", (error) => {
        this.WError(error)
        return
      });

      process.on("uncaughtException", (error) => {
        this.WError(error)
        return
      });
    }
    //let client = this;           
  }

  loadEvents() {
    let EventsDir = path.join(__dirname, "../events");
    fs.readdir(EventsDir, (err, files) => {

      let eventTable = new asciiTable
      eventTable.setHeading('Events', 'State').setBorder('|', '=', "0", "0")

      if (err) throw err;
      else
        files.forEach((file) => {
          const event = require(EventsDir + "/" + file);
          this.on(file.split(".")[0], event.bind(null, this));
          eventTable.addRow(file.split('.')[0], '✅')

        });
      this.warn('\n' + eventTable.toString())
    });
  }

  loadCommands() {
    let slashCmdsTable = new asciiTable
    slashCmdsTable.setHeading('Command', 'Category', 'State ').setBorder('|', '=', "0", "0")

    const foldersPath = path.join(__dirname, '../commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
      const commandsPath = path.join(foldersPath, folder);
      const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
      for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command && command) {
          command.category = folder;
          this.slashCommands.set(command.data.name, command);
          slashCmdsTable.addRow(command.data.name, folder, '✅')

        } else {
          slashCmdsTable.addRow(command.data.name, '❌')
        }
      }
    }
    this.warn('\n' + slashCmdsTable.toString())
  }

  //Loggers 
  log(Text) {
    this.logger.log(Text);
  }

  warn(Text) {
    this.logger.warn(Text);
  }

  //Its only for debug
  debug(debugTxt) {
    if (!this.config.debug) return;
    this.logger.debug(debugTxt);
  }
   WError(error) {
    this.logger.WError(error);
  }

  ErrorEmbed(text) {
    let embed = new EmbedBuilder()
      .setColor("Red")
      .setDescription("❌ " + text + " ❌")
      .setFooter({ text: `Data Center`, iconURL: this.config.botURL })
      .setTimestamp();

    return embed;
  }

  Embed(text) {
    let embed = new EmbedBuilder()
      .setColor('Green')
      .setFooter({ text: `Data Center`, iconURL: this.config.botURL })
      .setTimestamp()

    if (text) embed.setDescription(text);

    return embed;
  }

  denunciaModal(){
    let modal = new ModalBuilder()
			.setCustomId('den-verifyNames')
			.setTitle('Añadir nueva denuncia');
    return modal
  }
  async sendLogs(chId, customEmbed, role, user){
    const chLogs = this.channels.cache.get(chId);
    if (role || user) {chLogs.send({content: `${role ? `<@&${role}>` : " "} ${user ? `<@${user}>` : " "} `,})}
    chLogs.send(
      {
        content: '',  
        embeds: [
          customEmbed
        ]
      });
  }
  reloadCmds() {
    try {

      let SlashCommandsDirectory = path.join(__dirname, "../commands");
      let commandFolders = fs.readdirSync(SlashCommandsDirectory)

      for (const folder of commandFolders) {
        const commandsPath = path.join(SlashCommandsDirectory, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
          const filePath = path.join(commandsPath, file);
          const command = require(filePath);

          if ('data' in command && 'execute' in command) {
            delete require.cache[require.resolve(`${SlashCommandsDirectory}/${folder}/${file}`)];
            this.slashCommands.delete(command.data.name);
          } else {
            this.warn('Command cannot be reloaded' + command.data.name)
          }
        }
      }
      this.loadCommands();
      console.log(`Sucessfully Reloaded Commands! (/) SlashCommands ${this.slashCommands.size}`)

    } catch (err) {
      console.log(err);
    }
  }


}
module.exports = mainBot;