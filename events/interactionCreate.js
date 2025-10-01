const {ModalBuilder,ActionRowBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, MessageActionRow} = require('discord.js');
 
/**
  * @param {import('../source/mainBot')} client
 */
module.exports = async (client, interaction) => {
    if (interaction.isChatInputCommand()) {

        const command = client.slashCommands.get(interaction.commandName);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            interaction.reply({
                embeds: [
                    client.ErrorEmbed('**Error comando no encontrado!**')
                ], ephemeral: true
            });
            return;
        }

        try {
            if (!client.config.Admins.includes(interaction.user.id)) {
                if (command.category === '0.admin') return interaction.reply({
                    embeds: [
                        client.ErrorEmbed('No tienes permisos, solo para administradores')
                    ], ephemeral: true
                });
                
            if (command.category === 'LSPD' && (!interaction.member.roles.cache.has(client.config.LSPD.Role) || interaction.guild.id !== client.config.LSPD.Guild) ) { 
                return interaction.reply({
                    embeds: [
                        client.ErrorEmbed('No tienes permisos para esto solo miembros de la  **LSPD**')
                    ], ephemeral: true
                });
            }
            if (command.category === 'courts' && (!interaction.member.roles.cache.has(client.config.courts.Role) || interaction.guild.id !== client.config.courts.Guild )) return interaction.reply({
                    embeds: [
                        client.ErrorEmbed('No tienes permisos para esto solo **jueces**')
                    ], ephemeral: true
                });
            }
            await command.execute(interaction, client);

        } catch (error) {
            console.log(error)
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    embeds: [
                        client.ErrorEmbed('Error ejecutando interacción'),
                    ], ephemeral: true
                });

            } else {
                await interaction.reply({
                    embeds: [
                        client.ErrorEmbed('Error ejecutando interacción'),
                    ], ephemeral: true
                });
            }
        }
    }else if (interaction.isModalSubmit()) {
           if (interaction.customId === 'den-verifyNames') {
        const FName = interaction.fields.getTextInputValue('FNameInput');
        const SName = interaction.fields.getTextInputValue('SNameInput');

        let existsInDB = await client.utils.dbHelp.checkIfExistName(client, FName, SName);

       if (!existsInDB) {
            return await interaction.reply({
                embeds: [
                    client.ErrorEmbed('Personaje no encontrado en la base de datos. Revise la ortografía.'),
                ],
                ephemeral: true,
            });
        }
        client.userModalData.set(interaction.user.id, { FName: FName, SName: SName, AccountId: existsInDB.AccountID, CharacterId: existsInDB.Id });

        return await interaction.reply({
                embeds: [
                    client.Embed('Personaje encontrado en la base de datos correctamente!'),
                ],
                components: [new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                    .setCustomId('secondmodal_denuncia') 
                    .setLabel('Continuar denuncia')  
                    .setStyle(1))
                ],
                ephemeral: true,
            });
    }else if(interaction.customId === 'den-aditionalData') {
        console.log('den-aditionalData')
        let data = client.userModalData.get(interaction.user.id);
        let cargos = interaction.fields.getTextInputValue('cargos');
        let peligroso = interaction.fields.getTextInputValue('peligroso');
        let imagenes = interaction.fields.getTextInputValue('imagenes');
        
                if(!data || !cargos || ["si", "no"].includes(peligroso.toLowerCase()) === false ||  !imagenes  || typeof imagenes !== 'string' ||imagenes.length > 1000  ) {
                    return await interaction.reply({
                        embeds: [
                            client.ErrorEmbed('Datos de la denuncia incorrectos!'),
                        ],
                        ephemeral: true,
                    });
                }

            let result;
        try{
            result= await client.db.mQuery(`INSERT INTO denuncias (accountId, characterId, cargos, peligroso, imgLink) VALUES ('${data.AccountId}', '${data.CharacterId}','${cargos}', '${peligroso.toLowerCase() === 'si' ? 1 : 0}', '${imagenes}')`);
        }catch(err) {
            console.log(err)
            return await interaction.reply({ embeds: [ client.ErrorEmbed('Error cargando los datos de la denuncia contacta con el STAFF')],ephemeral: true})
        }

        await interaction.reply({
                embeds: [ 
                    client.Embed(`Datos de la denuncia  ${result.insertId} cargados correctamente!`)
                ],ephemeral: true
            })

            console.log(client.utils.dividirEnBloques(cargos, 'cargos'))
    let embedData = client.Embed(`Nueva denuncia ID: **${result.insertId}**`).addFields([
            {
                name: `Nombre y apellido`,
                value: `${client.utils.dbHelp.formatNames(data.FName)} ${client.utils.dbHelp.formatNames(data.SName)}`, 
                inline: false
            },
          /*  {
                name: `Cargos`,
                value: `${cargos}`, 
                inline: false
            },*/
            {
                name: `Fecha`,
                value: `${new Date().toLocaleString()}`, 
                inline: false
            },
            {
                name: `Imagenes`,
                value: `${imagenes}`, 
                inline: false
            }]).addFields(client.utils.dividirEnBloques(cargos, 'cargos'))

            client.sendLogs(client.config.LSPD.denuncias, embedData)
            client.sendLogs(client.config.SADC.denuncias, embedData)
            client.sendLogs(client.config.courts.denuncias, embedData, (peligroso.toLowerCase() === "si") ? client.config.courts.Role : null)//mention if peligroso    
}else if(interaction.customId === 'den-sentencia') {
    console.log('sentencia')
        let id = interaction.fields.getTextInputValue('id');
        let sentencia = interaction.fields.getTextInputValue('sentencia');
        let fechaCita = interaction.fields.getTextInputValue('cita');
        let existsInDB = await client.db.mQuery(`SELECT * FROM denuncias WHERE id_denuncia = '${id}'`);
    
        if(isNaN(id) || !id || !sentencia || !existsInDB[0]) {
            return await interaction.reply({
                embeds: [
                    client.ErrorEmbed('Datos de la denuncia incorrectos!'),
                ],
                ephemeral: true,
            });
        }


try{
    await client.db.mQuery(`UPDATE denuncias SET sentencia = '${sentencia}', fecha_citado = '${fechaCita}'  WHERE id_denuncia = '${id}'`);
}catch(err) {
    console.log(err)
    return await interaction.reply({ embeds: [ client.ErrorEmbed('Error cargando los datos de la denuncia contacta con el STAFF')],ephemeral: true})
}
let accountInfo = await client.db.mQuery(`SELECT * FROM accounts WHERE _id = '${existsInDB[0].accountId}'`)
let character = await client.db.mQuery(`SELECT * FROM characters WHERE Id = '${existsInDB[0].characterId}'`)
let embedCensured = client.Embed(`Sentencia a ${character[0].FName} ${character[0].SName} - N° de sentencia **${existsInDB[0].id_denuncia}**`).addFields([
          {

                name: `Nombre y apellido`,
                value: `${character[0].FName} ${character[0].SName}`, 
                inline: false
            },
          /*{
                name: `Sentencia`,
                value: `${sentencia}`, 
                inline: false
            },*/
            {
                name: `Citación`,
                value: `${fechaCita}`, 
                inline: false
            }, 
            ]).addFields(client.utils.dividirEnBloques(sentencia, 'sentencia'))

    
        let embed = client.Embed(`Nueva sentencia hacia la denuncia con ID: **${existsInDB[0].id_denuncia}**`).addFields([
          {
                name: `Nombre y apellido`,
                value: `${character[0].FName} ${character[0].SName}`, 
                inline: false
            },
            /*{
                name: `Sentencia`,
                value: `${sentencia}`, 
                inline: false
            },*/   
            {
                name: `Citación`,
                value: `${fechaCita}`, 
                inline: false
            },   
            /*{
                name: `Cargos`,
                value: `${existsInDB[0].cargos}`, 
                inline: false
            },*/
             {
                name: `Imagenes`,
                value: `${existsInDB[0].imgLink}`, 
                inline: false
            },
            ]).addFields(client.utils.dividirEnBloques(existsInDB[0].cargos, 'cargos'))

            let embedSentencia = client.Embed(`Sentencia de la denuncia id ${existsInDB[0].id_denuncia}`).addFields(client.utils.dividirEnBloques(sentencia, 'sentencia'))

    
            await client.sendLogs(client.config.Undefined.sentencias, embedCensured, null, accountInfo[0].discordId) //cargos


              //envia a canales split in to logs because discord has limit to 6k characters per embed
            client.sendLogs(client.config.LSPD.sentencias, embed, existsInDB[0].peligroso  ? client.config.LSPD.Role : null, null)//mention if peligroso    
            client.sendLogs(client.config.LSPD.sentencias, embedSentencia, null, null)
            
            client.sendLogs(client.config.courts.sentencias, embed, null, null)
            client.sendLogs(client.config.courts.sentencias, embedSentencia, null, null)

            client.sendLogs(client.config.SADC.sentencias, embed, null, null)

            return interaction.reply({
                embeds: [
                    client.Embed(`Sentencia cargada correctamente en el sistema!`),
                ],
                ephemeral: true,
            });
}
      
    }else if(interaction.isButton()) {
        if(interaction.customId === 'addDenuncia') {
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

        }else if (interaction.customId === 'secondmodal_denuncia') {
            let data = client.userModalData.get(interaction.user.id);
            if (!data) {
                    client.userModalData.delete(interaction.user.id);
                return await interaction.reply({
                    embeds: [
                        client.ErrorEmbed('No se encontraron datos de la denuncia'),
                    ],
                    ephemeral: true,
                });
            }

        let modal2 = client.denunciaModal().setCustomId('den-aditionalData').setTitle('Ficha ' + data.FName + ' ' + data.SName);

        const cargosInput = new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('cargos')
                .setLabel('Cargos')
                .setStyle(TextInputStyle.Paragraph)
        );

        const imagenesInput = new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('imagenes')
                .setLabel('Enlace de los hechos (Imágenes o videos)')
                .setPlaceholder('Máximo 1000 carácteres')
                .setStyle(TextInputStyle.Paragraph)
        );
        const peligroso = new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('peligroso')
                .setLabel('Sujeto peligroso o prioritario')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Solo "SI" o "NO"')
        );

            modal2.addComponents(cargosInput, imagenesInput, peligroso);
            await interaction.showModal(modal2);
        }else if(interaction.customId === 'add_sentencia') {
            //handler to add sentencia
        }
    }
};
