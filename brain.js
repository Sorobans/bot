const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const pvp = require('@nxg-org/mineflayer-custom-pvp').default;
const armorManager = require('mineflayer-armor-manager');
const collectBlock = require('mineflayer-collectblock').plugin;
const tool = require('mineflayer-tool').plugin;
const autoeat = require('mineflayer-auto-eat').plugin;

const bot = mineflayer.createBot({
    host: "127.0.0.1",
    port: 25565,
    username: "Sorobot",
    version: "1.21.1"
});

// Load all survival plugins
bot.loadPlugin(pathfinder);
bot.loadPlugin(pvp);
bot.loadPlugin(armorManager);
bot.loadPlugin(collectBlock);
bot.loadPlugin(tool);
bot.loadPlugin(autoeat);

bot.once("spawn", () => {
    console.log("Sorobot is fully autonomous.");
    const mcData = require('minecraft-data')(bot.version);
    
    const defaultMove = new Movements(bot, mcData);
    defaultMove.allowSprinting = true;
    defaultMove.canDig = true; // Allows bot to break blocks to reach a goal
    bot.pathfinder.setMovements(defaultMove);
});

// --- 1. FREEDOM TO FIGHT (RETALIATION) ---
bot.on('entityHurt', (entity) => {
    if (entity !== bot.entity) return;
    
    // Nearest hostile mob OR player
    const attacker = bot.nearestEntity((e) => 
        e.type === 'player' || 
        (e.type === 'hostile' || e.type === 'mob' && e.kind === 'Hostile mobs')
    );

    if (attacker) {
        bot.armorManager.equipAll();
        bot.swordpvp.attack(attacker);
    }
});

// --- 2. FREEDOM TO GATHER ---
bot.on('chat', async (username, message) => {
    if (username === bot.username) return;
    const args = message.split(' ');

    // Command: "mine diamond_ore"
    if (args[0] === 'mine') {
        const blockName = args[1];
        const blockType = bot.registry.blocksByName[blockName];
        
        if (!blockType) return bot.chat("I don't know what " + blockName + " is.");
        
        const block = bot.findBlock({
            matching: blockType.id,
            maxDistance: 64
        });

        if (block) {
            bot.chat(`Going to mine ${blockName}...`);
            try {
                await bot.collectBlock.collect(block);
                bot.chat("Task complete!");
            } catch (err) {
                bot.chat("I couldn't reach it.");
            }
        } else {
            bot.chat("I can't see any nearby.");
        }
    }
    
    if (message === 'stop') {
        bot.swordpvp.stop();
        bot.pathfinder.setGoal(null);
    }
});

// --- 3. FREEDOM TO SURVIVE (AUTO-EAT) ---
bot.on('autoeat_started', () => console.log('Eating...'));
bot.on('error', (err) => console.log('Error:', err));
