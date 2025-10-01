const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const getConfig = require("../util/getConfig");
const LoadCommands = require("../util/loadCommands");
const client = require("../index");


(async () => {
  const config = await getConfig();
  const rest = new REST({ version: "9" }).setToken(config.token);
  const commands = await LoadCommands().then((cmds) => {
    return [].concat(cmds.slash).concat(cmds.context);
  });

  client.debug(`Deploying commands to global...`);
  await rest
    .put(Routes.applicationCommands(config.clientId), {
      body: commands,
    })
    .catch(console.log);
   client.debug(`Successfully deployed commands!`);
})();

/*
async function LoadSlashs () { 
  const config = await getConfig();
  const rest = new REST({ version: "9" }).setToken(config.token);
  const commands = await LoadCommands().then((cmds) => {
    return [].concat(cmds.slash).concat(cmds.context);
  });

  Logger.debug("Deploying commands to global...");
  await rest
    .put(Routes.applicationCommands(config.clientId), {
      body: commands,
    })
    .catch(Logger.debug);
  Logger.debug("Successfully deployed commands!");
}; */