const express = require("express");
const expressLayouts = require("express-ejs-layouts");

const app = express();

module.exports = (client) => {
    app.use(expressLayouts);

    app.set("view engine", "ejs");
    app.set("views", `${__dirname}/views`);
    app.use(express.static(`${__dirname}/public`));

    app.get("/", (req, res) => {
        res.render("index", {
            client: client,
            stats: {
                discord: {
                    members: client.guilds.get(client.config.guilds.currentGuild).members.size,
                    online: client.guilds.get(client.config.guilds.currentGuild).members.filter(member => member.user.presence.status !== "offline").size,
                    offline: client.guilds.get(client.config.guilds.currentGuild).members.filter(member => member.user.presence.status === "offline").size,
                    voice: client.guilds.get(client.config.guilds.currentGuild).members.filter(member => member.voice.channel).size
                }
            }
        });
    });

    app.get("/rules", (req, res) => {
        res.render("rules", {
            client: client,
            header: "Rules"
        });
    });

    app.get("/staff", (req, res) => {
        res.render("staff", {
            client: client,
            header: "Staff Team"
        });
    });

    app.get("/stats", async (req, res) => {
        res.render("stats", {
            client: client,
            header: "Stats",
            stats: {
                discord: {
                    members: client.guilds.get(client.config.guilds.currentGuild).members.size,
                    online: client.guilds.get(client.config.guilds.currentGuild).members.filter(member => member.user.presence.status !== "offline").size,
                    offline: client.guilds.get(client.config.guilds.currentGuild).members.filter(member => member.user.presence.status === "offline").size,
                    voice: client.guilds.get(client.config.guilds.currentGuild).members.filter(member => member.voice.channel).size
                },
                db: {
                    cachedUsers: (await client.redis.keys("*")).length,
                    databaseUsers: (await client.db.raw.query("SELECT * FROM users"))[0].length
                },
                mem: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
                processUptime: client.utils.convertTime(process.uptime),
                uptime: client.utils.convertTime(client.uptime),
                commands: client.cache.stats.commands
            }
        });
    });

    app.get("/leaderboard", async (req, res) => {
        // let results = await Promise.all((await client.db.query("SELECT * FROM users ORDER BY balance"))[0].map(row => {
        //     return client.utils.getUserInfo(client, row);
        // }));

        // let results = await (await client.db.raw.query("SELECT * FROM users ORDER BY balance DESC LIMIT 10"));[0]

        // let resultsNew = [];

        let results = await Promise.all((await client.db.raw.query("SELECT * FROM users ORDER BY balance DESC LIMIT 20"))[0].map(row => {
            let user = client.users.get(row.id);
            if(!user) return;

            row.username = user.username;
            row.tag = user.tag;
            row.avatar = user.displayAvatarURL({ size: 32 });

            return row;
        }));

        res.render("leaderboard", {
            client: client,
            headers: "Leaderboard",
            results: results
        });
    });

    app.listen(process.env.PORT || client.config.website.port);
};