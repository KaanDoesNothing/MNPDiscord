let modules = {
    userData: require("../modules/userData"),
    afk: require("../modules/afk")
};

module.exports = async (client, msg) => {
    console.time("Message_Event");
    if(msg.channel.type !== "text") return;
    if(msg.author.bot) return;

    let prefix = client.config.prefix;

    let msgArray = msg.content.split(" ");
    let cmd = msgArray[0];
    let args = msgArray.slice(1);

    //userData
    let userData = await modules.userData(client, msg);

    /*
        afk
    */
    // if(client.config.development) {
    //     modules.afk(client, msg, userData);
    // }

    console.timeEnd("Message_Event");

    if(!msg.content.startsWith(prefix)) return;

    let cmdFile = client.commands.get(cmd.slice(prefix.length));

    if(cmdFile) {
        client.cache.stats.commands += 1;
        cmdFile.run(client, msg, args);
    }

};