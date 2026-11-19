/*CMD
command: /admin_bulk_start
help: Bulk Video Upload - Step 2: Start Bulk Upload in Selected Category
need_reply: false
auto_retry_time: 
folder: 
answer: 
keyboard: 
aliases: 
group: 
CMD*/

let primaryAdmin = 9250034188;
if (user.telegramid != primaryAdmin && user.telegramid != String(primaryAdmin)) {
  Bot.sendMessage("🚫 *Access Denied.*");
  return;
}

let catId = parseInt(params);
let categories = Bot.getProperty("categories") || [];
let catName = "General (No Category)";
let catEmoji = "📁";

if (catId && catId !== 0) {
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].id === catId) {
      catName = categories[i].name;
      catEmoji = categories[i].emoji || "📁";
      break;
    }
  }
  User.setProperty("admin_bulk_cat_id", catId, "integer");
} else {
  User.setProperty("admin_bulk_cat_id", null, "integer");
}

User.setProperty("admin_bulk_mode", true, "boolean");
User.setProperty("admin_bulk_uploaded", 0, "integer");
User.setProperty("admin_bulk_failed", 0, "integer");

let buttons = [
  [{ title: "🏁 Finish Bulk Upload", command: "/admin_bulk_finish" }],
  [{ title: "❌ Cancel & Return", command: "/admin" }]
];

let text =
  "📦 *Bulk Video Upload Mode Active!*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "📂 *Target Category:* " + catEmoji + " *" + catName + "*\n\n" +
  "👉 Ab is chat mein multiple **MP4 ya MOV videos** forward ya send karna shuru karein (ek saath select karke forward kar sakte hain).\n\n" +
  "• Saari videos automatically *" + catName + "* category mein add hongi.\n" +
  "• Duplicate videos skip hongi.\n\n" +
  "Jab saari videos bhej chuke hon toh **🏁 Finish Bulk Upload** dabayein! 👇";

Bot.sendInlineKeyboard(buttons, text);
