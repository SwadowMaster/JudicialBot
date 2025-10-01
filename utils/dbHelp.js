module.exports = {
async checkIfExistName(client, FName, SName) {
            let AccountID = await client.db.mQuery(`SELECT AccountID, Id FROM characters WHERE FName = '${this.formatNames(FName)}' AND SName = '${this.formatNames(SName)}'` )
            if(AccountID.length < 0 || !AccountID[0]) {
                return false
            }
return AccountID[0]
},
formatNames(name) {
    if (!name || typeof name !== 'string') {
        throw new Error('Debes proporcionar una palabra válida.');
    }
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}


}
