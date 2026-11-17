/*CMD
command: /admin_vip_grant
help: Manually grant VIP Pass to a user by ID
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

let input = params ? params.trim() : "";
let parts = input.split(/\s+/);

if (parts.length < 2) {
  Bot.sendMessage(
    "👑 *Manual VIP Membership Grant*\n" +
    "━━━━━━━━━━━━━━━━━━━━━\n" +
    "Usage: `/admin_vip_grant USER_ID DAYS`\n\n" +
    "📌 *Examples:*\n" +
    "• `/admin_vip_grant 123456789 30` (Grants 30 days VIP)\n" +
    "• `/admin_vip_grant 123456789 lifetime` (Grants Lifetime VIP)\n\n" +
    "Tap Back below to return to Admin Dashboard:",
    {
      reply_markup: {
        inline_keyboard: [[{ text: "🔙 Admin Dashboard", callback_data: "/admin", style: "primary" }]]
      }
    }
  );
  return;
}

let targetUserId = parts[0].trim();
let duration = parts[1].trim().toLowerCase();

if (duration === "lifetime") {
  Bot.setProperty("user_vip_lifetime_" + targetUserId, true, "boolean");
  Bot.sendMessage("✅ *Lifetime VIP granted to user:* `" + targetUserId + "` ⭐");
  try {
    Bot.sendMessageToChatWithId(
      targetUserId,
      "👑 *Congratulations!*\n\n" +
      "The Administrator has granted you **Lifetime VIP Membership**! ⭐\n\n" +
      "Enjoy unlimited streaming and zero channel locks forever!\n" +
      "Tap /get_video to start watching videos now!"
    );
  } catch (e) {}
} else {
  let days = parseInt(duration);
  if (!days || days <= 0) {
    Bot.sendMessage("⚠️ Invalid number of days specified.");
    return;
  }
  let now = Date.now();
  let currentExpiry = Bot.getProperty("user_vip_until_" + targetUserId) || now;
  let baseTime = Math.max(now, currentExpiry);
  let newExpiry = baseTime + (days * 24 * 60 * 60 * 1000);
  Bot.setProperty("user_vip_until_" + targetUserId, newExpiry, "integer");

  let expiryStr = new Date(newExpiry).toISOString().split("T")[0];
  Bot.sendMessage("✅ *VIP granted to user:* `" + targetUserId + "` for *" + days + " days* (Valid until: `" + expiryStr + "`) ⭐");
  try {
    Bot.sendMessageToChatWithId(
      targetUserId,
      "👑 *Congratulations!*\n\n" +
      "The Administrator has granted you *" + days + " Days of VIP Membership*! ⭐\n\n" +
      "Valid until: `" + expiryStr + "`\n\n" +
      "Enjoy unlimited streaming with 0 points deducted!\n" +
      "Tap /get_video to start watching videos now!"
    );
  } catch (e) {}
}

Bot.runCommand("/admin");
