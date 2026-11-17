/*CMD
command: /admin_promo_create
help: Create a new promo code with points reward and user limit
need_reply: true
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

if (message && message.trim() === "/admin") {
  Bot.runCommand("/admin");
  return;
}

let input = message ? message.trim() : (params ? params.trim() : "");
let parts = input.split(/\s+/);

if (parts.length < 2 || !parts[0] || isNaN(parts[1])) {
  Bot.sendMessage(
    "📝 *Create Promo Code*\n" +
    "━━━━━━━━━━━━━━━━━━━━━\n" +
    "Send the code details in this exact format:\n\n" +
    "👉 `CODE POINTS MAX_USERS`\n\n" +
    "📌 *Examples:*\n" +
    "• `BONUS50 50 100` (Code BONUS50 gives 50 points, max 100 users)\n" +
    "• `WELCOME100 100 0` (Code WELCOME100 gives 100 points, 0 = unlimited users)\n\n" +
    "_(Send /admin to cancel)_"
  );
  Bot.run({ command: "/admin_promo_create" });
  return;
}

let codeName = parts[0].toUpperCase();
let rewardPoints = parseInt(parts[1]);
let maxUsers = parts.length >= 3 ? parseInt(parts[2]) : 0;

if (rewardPoints <= 0) {
  Bot.sendMessage("⚠️ Points must be greater than 0. Please try again or send /admin to cancel:");
  Bot.run({ command: "/admin_promo_create" });
  return;
}

let promoCodes = Bot.getProperty("promo_codes") || [];

// Check if duplicate code exists
for (let i = 0; i < promoCodes.length; i++) {
  if (promoCodes[i].code === codeName) {
    Bot.sendMessage("⚠️ Promo code *" + codeName + "* already exists! Enter a different name or send /admin to cancel:");
    Bot.run({ command: "/admin_promo_create" });
    return;
  }
}

promoCodes.push({
  code: codeName,
  points: rewardPoints,
  max_users: maxUsers,
  claimed_count: 0,
  active: true,
  created_at: new Date().toISOString()
});

Bot.setProperty("promo_codes", promoCodes, "json");

let buttons = [
  [{ title: "🎟 View Promo Codes", command: "/admin_promo", style: "primary" }],
  [{ title: "🛠 Admin Dashboard", command: "/admin", style: "primary" }]
];

let limitDisplay = maxUsers > 0 ? "*" + maxUsers + " Users*" : "*Unlimited Users*";
let successMsg =
  "✅ *Promo Code Created Successfully!*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "🎟 *Code:* `" + codeName + "`\n" +
  "🎁 *Points per Claim:* *" + rewardPoints + " Points*\n" +
  "👥 *Max Claim Limit:* " + limitDisplay + "\n\n" +
  "📢 You can now announce this code in your Telegram channel!\n" +
  "Users can redeem it by typing: `/redeem " + codeName + "`";

Bot.sendInlineKeyboard(buttons, successMsg);
