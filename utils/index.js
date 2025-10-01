let dbHelp = require('./dbHelp')

function dividirEnBloques(frase, tipo, maxCaracteres = 1023) {
    if (typeof frase !== "string") {
        throw new Error("El argumento debe ser una cadena de texto.");
    }

    const bloques = [];
    for (let i = 0; i < frase.length; i += maxCaracteres) {
        bloques.push({
                        name: `Parte ${bloques.length + 1} ${tipo}`,
                        value: `${frase.slice(i, i + maxCaracteres)}`, 
                        inline: false
                    });
    }
    return bloques;
}

module.exports={ dbHelp, dividirEnBloques}
