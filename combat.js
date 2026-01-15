const mineflayer = require('mineflayer');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const customPVP = require('@nxg-org/mineflayer-custom-pvp');
const armorManager = require('mineflayer-armor-manager');

const bot = mineflayer.createBot({
    host: '127.0.0.1',
    port: 25565, // Change this to your LAN port
    username: 'NotSoroban',
    version: '1.21.1'
});

// Load all the plugins
bot.loadPlugin(pathfinder);
bot.loadPlugin(customPVP);
bot.loadPlugin(armorManager);

bot.once('spawn', () => {
    bot.chat("Elite Combat System: Online.");
    
    // Configure Pathfinder
    const moves = new Movements(bot);
    moves.allowSprinting = true;
    moves.allowParkour = true; // Bot will jump over gaps
    bot.pathfinder.setMovements(moves);

    // Elite PVP Settings
    bot.swordpvp.options.cps = 15; // Clicks per second
    bot.swordpvp.options.strafeConfig.enabled = true; // Enable circle strafing
    bot.swordpvp.options.critConfig.enabled = true; // Always try to jump-crit
    bot.swordpvp.options.tapConfig.enabled = true; // W-Tap for extra knockback
});

// AUTO-REALIATE: Fight back if hit
bot.on('entityHurt', (entity) => {
    if (entity !== bot.entity) return;

    const attacker = bot.nearestEntity((e) => e.type === 'player' || e.type === 'mob');
    if (attacker) {
        bot.chat(`Engaging target: ${attacker.username || attacker.name}`);
        bot.swordpvp.attack(attacker);
    }
});

// COMMANDS: Use chat to control the bot
bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    const target = bot.players[username]?.entity;

    if (message === 'kill') {
        if (target) {
            bot.chat("Target locked.");
            bot.swordpvp.attack(target);
        }
    } else if (message === 'stop') {
        bot.chat("Ceasing fire.");
        bot.swordpvp.stop();
    }
});

// AUTO-EQUIP: Put on armor the second it enters inventory
bot.on('playerCollect', () => {
    setTimeout(() => bot.armorManager.equipAll(), 100);
});
