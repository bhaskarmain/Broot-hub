/*CMD
command: /admin_bonus_settings
help: Configure Daily Bonus Points & Status
need_reply: false
auto_retry_time: 
folder: 
answer: 
keyboard: 
aliases: 
group: 
CMD*/

let primaryAdmin = Bot.getProperty("admin_id") || 9250034188;
let adminList = Bot.getProperty("admin_ids") || [primaryAdmin];
let isAdmin = false;
for (let a = 0; a < adminList.length; a++) {
  if (user.telegramid == adminList[a] || user.telegramid == String(adminList[a])) {
    isAdmin = true;
    break;
  }
}

if (!isAdmin) {
  Bot.sendMessage("🚫 *Access Denied.*");
  return;
}

if (params) {
  let paramStr = params.toString().trim();
  if (paramStr === "toggle") {
    let current = Bot.getProperty("daily_bonus_enabled");
    let newState = (current === false) ? true : false;
    Bot.setProperty("daily_bonus_enabled", newState, "boolean");
    Bot.sendMessage("✅ *Daily Bonus status updated to:* *" + (newState ? "ENABLED" : "DISABLED") + "*");
  } else if (paramStr.indexOf("set_") === 0) {
    let pts = parseInt(paramStr.replace("set_", ""));
    if (pts && pts > 0) {
      Bot.setProperty("daily_bonus_points", pts, "integer");
      Bot.sendMessage("✅ *Daily Bonus Points set to:* *" + pts + " Points*");
    }
  }
}

let bonusEnabled = Bot.getProperty("daily_bonus_enabled") !== false;
let bonusPts = Bot.getProperty("daily_bonus_points") || 5;

let text =
  "🎁 *Daily Bonus Configuration*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "• Status: *" + (bonusEnabled ? "🟢 ENABLED" : "🔴 DISABLED") + "*\n" +
  "• Base Points per Claim: *" + bonusPts + " Points*\n" +
  "• Cooldown Period: *24 Hours*\n" +
  "• Streak Bonus: *+2 pts (3-day) | +5 pts (7-day)*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "Select a configuration option below 👇";

let buttons = [
  [{ title: (bonusEnabled ? "🔴 Disable Daily Bonus" : "🟢 Enable Daily Bonus"), command: "/admin_bonus_settings toggle", style: "primary" }],
  [
    { title: "Set 3 Points", command: "/admin_bonus_settings set_3", style: "primary" },
    { title: "Set 5 Points", command: "/admin_bonus_settings set_5", style: "primary" },
    { title: "Set 10 Points", command: "/admin_bonus_settings set_10", style: "primary" }
  ],
  [{ title: "🔙 Back to Admin Dashboard", command: "/admin", style: "primary" }]
];

Bot.sendInlineKeyboard(buttons, text);
