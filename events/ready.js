module.exports = async (client) => {

    client.user.setPresence({
        activities: [{ name: `Gestionando denuncias`, type: 4 }],
        status: 'dnd',
    })

    client.log('Status loaded (ツ) ')
    client.log("Successfully Logged in as " + client.user.tag);
};
