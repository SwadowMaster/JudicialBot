const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const axios = require('axios')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sentencia')
        .setDescription('Sentencia una denuncia'),
        async execute(interaction, client) {
        
            let modalsentencia = client.denunciaModal().setCustomId('den-sentencia').setTitle('Sentencia de la denuncia');

        const cargosInput = new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('id')
                .setLabel('ID de la denuncia')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Si es incorrecto se perderan los cambios')
        );

        const sentencia = new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('sentencia')
                .setLabel('Sentencia de la denuncia')
                .setStyle(TextInputStyle.Paragraph)
        );
        const cita = new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('cita')
                .setLabel('Cita con el denunciado')
                .setPlaceholder('"Deberá presentarse el 09/10/2024 a las 21:00 en el juzgado"')
                .setStyle(TextInputStyle.Short)
        );
            modalsentencia.addComponents(cargosInput, sentencia, cita);
            await interaction.showModal(modalsentencia);
    }
}