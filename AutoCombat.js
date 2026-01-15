const mineflayer = require("mineflayer");
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const pvp = require('@nxg-org/mineflayer-custom-pvp').default;
const armorManager = require('mineflayer-armor-manager');

const bot = mineflayer.createBot({
    host: "127.0.0.1",    // <--- Change to the server IP
    port: 25565,          // <--- Change if the server uses a different port
    username: "Sorobot",
    version: "1.21.1"
});

// Load all plugins
bot.loadPlugin(pathfinder);
bot.loadPlugin(pvp);
bot.loadPlugin(armorManager);

// --- 1. SETTINGS & SETUP ---
bot.once("spawn", () => {
    console.log("Sorobot is online and defending.");
    
    // Configure movements (jumping, sprinting)
    const defaultMove = new Movements(bot);
    defaultMove.allowSprinting = true;
    defaultMove.allowParkour = true;
    bot.pathfinder.setMovements(defaultMove);

    // PvP Settings
    bot.swordpvp.options.cps = 14; 
    bot.swordpvp.options.strafeConfig.enabled = true; 
    bot.swordpvp.options.critConfig.enabled = true;

    // Handle cracked server login/register
    setTimeout(() => {
        bot.chat('/register SorobotPass123 SorobotPass123');
        bot.chat('/login SorobotPass123');
    }, 2000);
});

// --- 2. WEAPON SELECTOR ---
function equipBestWeapon() {
    const weapon = bot.inventory.items().find(item => item.name.includes('sword')) 
                || bot.inventory.items().find(item => item.name.includes('axe'));
    if (weapon) {
        bot.equip(weapon, 'hand');
    }
}

// --- 3. AUTO-DEFENSE (HIT TO START) ---
bot.on('entityHurt', (entity) => {
    // If the bot is the one getting hurt
    if (entity !== bot.entity) return;

    // Find the closest player to retaliate against
    const attacker = bot.nearestEntity((e) => e.type === 'player');

    if (attacker) {
        console.log(`Defending against: ${attacker.username}`);
        equipBestWeapon();
        bot.armorManager.equipAll();
        bot.swordpvp.attack(attacker);
    }
});

// --- 4. DISTANCE CHECK (PREVENT GETTING LOST) ---
bot.on('physicsTick', () => {
    if (bot.swordpvp.isAttacking) {
        const target = bot.swordpvp.target;
        if (target) {
            const dist = bot.entity.position.distanceTo(target.position);
            // If the player runs more than 30 blocks away, stop chasing
            if (dist > 30) {
                bot.swordpvp.stop();
                console.log("Target escaped. Returning to standby.");
            }
        }
    }
});

// --- 5. UTILITY & CHAT ---
bot.on('playerCollect', () => {
    setTimeout(() => bot.armorManager.equipAll(), 500);
});

bot.on('chat', (username, message) => {
    if (message === 'stop') {
        bot.swordpvp.stop();
        bot.chat("Standing down.");
    }
});

// --- 6. ERROR HANDLING ---
bot.on('error', (err) => console.log('Bot Error:', err));
bot.on('kicked', (reason) => console.log('Kicked:', reason));
