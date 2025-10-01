const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, ButtonBuilder } = require('discord.js');
const axios = require('axios')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('añadir-denuncia')
        .setDescription('Envia el embed con el boton de añadir denuncia'),
        async execute(interaction, client) {
  //addDenuncia


                    return await interaction.reply({
                            embeds: [
                                client.Embed('Para añadir una nueva denuncia'),
                            ],
                            components: [new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                .setCustomId('addDenuncia') 
                                .setLabel('Nueva denuncia')  
                                .setStyle(1))
                            ],
                            ephemeral: false,
                        });
    }
}