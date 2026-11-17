/*CMD
command: /admin_promo
help: Manage promotional codes and create gift vouchers
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

let promoCodes = Bot.getProperty("promo_codes") || [];

let codeLines = [];
let buttons = [];

if (promoCodes.length === 0) {
  codeLines.push("_No promo codes created yet._");
} else {
  for (let i = 0; i < promoCodes.length; i++) {
    let p = promoCodes[i];
    let limitStr = p.max_users > 0 ? (p.claimed_count || 0) + "/" + p.max_users : (p.claimed_count || 0) + "/Unlimited";
    codeLines.push(
      "• 🎟 `" + p.code + "` — *" + p.points + " pts* (Claimed: " + limitStr + ")"
    );
    buttons.push([{
      title: "🗑 Delete " + p.code,
      command: "/admin_promo_del " + encodeURIComponent(p.code),
      style: "primary"
    }]);
  }
}

buttons.unshift([{ title: "➕ Create New Promo Code", command: "/admin_promo_create", style: "primary" }]);
buttons.push([{ title: "🔙 Back to Admin Dashboard", command: "/admin", style: "primary" }]);

let text =
  "🎟 *Promotional Codes Manager*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "Active Promo Codes:\n\n" +
  codeLines.join("\n") + "\n\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "Tap *Create New Promo Code* to launch a gift campaign for your channel members!";

Bot.sendInlineKeyboard(buttons, text);
