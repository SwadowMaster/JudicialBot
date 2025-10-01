const { SlashCommandBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const axios = require('axios')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('denuncia')
        .setDescription('Añadre una denuncia'),
    async execute(interaction, client) {
        let modal = client.denunciaModal()

		const FNameInput = new TextInputBuilder()
			.setCustomId('FNameInput')
			.setLabel("Nombre")
			.setStyle(TextInputStyle.Short);

		const SNameInput = new TextInputBuilder()
			.setCustomId('SNameInput')
			.setLabel("Apellido")
			.setStyle(TextInputStyle.Short);

		const FName = new ActionRowBuilder().addComponents(FNameInput);
		const SName = new ActionRowBuilder().addComponents(SNameInput);

		modal.addComponents(FName, SName);
		await interaction.showModal(modal);
    }
}