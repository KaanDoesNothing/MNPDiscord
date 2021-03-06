const mysql = require("mysql2/promise");
const redis = require("ioredis");

module.exports.init = async (client) => {
    let db = await mysql.createConnection(client.config.database);
    
    client.redis = new redis();

    // console.log(await client.redis.info());

    client.db = {
        query: async (sql) => (await db.query(sql))[0][0],
        execute: async (sql) => (await db.execute(sql)),
        raw: db
    };

    await db.execute("CREATE TABLE IF NOT EXISTS users (id TEXT, balance BIGINT, lastDaily BIGINT(20), afk_enabled TINYINT(4), afk_reason TEXT, afk_date BIGINT(20), afk_messages INT(11), afk_lastMessageDate BIGINT(20))");

    await db.execute("CREATE TABLE IF NOT EXISTS settings (name TEXT, value TEXT)");

    await db.execute("CREATE TABLE IF NOT EXISTS bans (id TEXT, date BIGINT)");

    let requiredValues = [
        {
            name: "welcome",
            value : {
                enabled: false,
                channel: null
            }
        },
        {
            name: "drop",
            value : {
                enabled: false,
                channel: null
            }
        }
    ];

    let values = (await db.query("SELECT * FROM settings"))[0].map(row => {
        return row.name;
    });

    requiredValues.map(async row => {
        if(values.includes(row.name)) return;

        await db.execute(`INSERT INTO settings VALUES ('${row.name}', '${JSON.stringify(row.value)}')`);
    });
};

module.exports.sync = async (client) => {
    let allUsers = (await client.db.raw.query("SELECT * FROM users"))[0];

    allUsers.map(row => {
        client.userData.get(client, row.id);
    });
}