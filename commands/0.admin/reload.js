const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path'),
    fs = require('fs');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reload the bot commands, only for Developers!'),
    async execute(interaction, client) {

        if (client.config.Admins.includes(interaction.user.id)) {
            try {

                let SlashCommandsDirectory = path.join(__dirname, "../../commands");
                let commandFolders = fs.readdirSync(SlashCommandsDirectory)

                for (const folder of commandFolders) {
                    const commandsPath = path.join(SlashCommandsDirectory, folder);
                    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
                    for (const file of commandFiles) {
                        const filePath = path.join(commandsPath, file);
                        const command = require(filePath);

                        if ('data' in command && 'execute' in command) {
                            delete require.cache[require.resolve(`${SlashCommandsDirectory}/${folder}/${file}`)];
                            client.slashCommands.delete(command.data.name);
                        } else {
                            client.WError('Command cannot be reloaded' + command.data.name)
                        }
                    }
                }
                client.loadCommands();

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(`Sucessfully Reloaded Commands!\nSlashCommands\`${client.slashCommands.size}\``)
                            .setFooter({ text: `${client.user.username} was reloaded by ${interaction.user.username}` })
                            .setTimestamp(),
                    ], ephemeral: true
                });
            } catch (err) {
                console.log(err);
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(
                                "An error has occuRed. For more details please check console."
                            ),
                    ], ephemeral: true
                });
            }
        } else {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('Este comando es solo para developers')
                ], ephemeral: true
            });
        }
    },
};