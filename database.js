const mysql = require('mysql2');

function createDatabase(client) {
  function createConnection() {
    if (!client.config || !client.config.mysql) {
      throw new Error("Database configuration is missing in config.");
    }

    const { host, user, port, password, database } = client.config.mysql;
    return mysql.createConnection({
      host,
      user,
      port: port || 3306,
      password,
      database,
      supportBigNumbers: true,
      bigNumberStrings: true,
    });
  }

  async function mQuery(query) {
    const db = createConnection();

    return new Promise((resolve, reject) => {
      db.connect(err => {
        if (err) {
          console.error("Error de conexión:", err);
          reject(err);
          return;
        }

        db.query(query, (err, rows) => {
          if (err) {
            console.error("Error al ejecutar la consulta:", err);
            reject(err);
            return;
          }
          resolve(rows);
        });

        db.end(err => {
          if (err) {
            console.error("Error al cerrar la conexión:", err);
          }
        });
      });
    });
  }

  async function tryConnection() {
    try {
      await mQuery("SELECT 1");
      return true;
    } catch (error) {
      console.error("Error de conexión:", error);
      return false;
    }
  }

  return {
    mQuery,
    tryConnection,
  };
}

module.exports = createDatabase;
