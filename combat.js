const mineflayer = require("mineflayer");
const { pathfinder } = require('mineflayer-pathfinder');

// THE FIX: Use .default instead of .plugin
const pvp = require('@nxg-org/mineflayer-custom-pvp').default;

const bot = mineflayer.createBot({
    host: "127.0.0.1",
    port: 25565,       // MAKE SURE TO /publish 25565 IN MC
    username: "EliteWarrior",
    version: "1.21.1"
});

// Load plugins
bot.loadPlugin(pathfinder);
bot.loadPlugin(pvp);

bot.once("spawn", () => {
    console.log("Elite Warrior joined! Type 'fight' in Minecraft chat.");
    bot.chat("Ready for combat.");
});

bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    const target = bot.players[username]?.entity;

    if (message === 'fight') {
        if (target) {
            bot.chat("Combat enabled!");
            bot.swordpvp.attack(target);
        } else {
            bot.chat("I can't see you!");
        }
    }

    if (message === 'stop') {
        bot.swordpvp.stop();
        bot.chat("Standing down.");
    }
});

// Prevents the bot from crashing if it hits an error
bot.on('error', (err) => console.log('Bot Error:', err));
