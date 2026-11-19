/*CMD
command: /admin_upload_to
help: Single Video Upload - Step 2: Prompt for Video File in Selected Category
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
  User.setProperty("admin_upload_cat_id", catId, "integer");
} else {
  User.setProperty("admin_upload_cat_id", null, "integer");
}

let buttons = [
  [{ title: "🔙 Choose Another Category", command: "/admin_upload" }],
  [{ title: "❌ Cancel & Return", command: "/admin" }]
];

let text =
  "📤 *Single Video Upload*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "📂 *Target Category:* " + catEmoji + " *" + catName + "*\n\n" +
  "👉 Send or forward the **MP4 or MOV video file** directly into this chat:\n\n" +
  "• Title caption ya filename se auto-extract ho jayega.\n" +
  "• Video direct upload hokar live ho jayegi!\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "_(Send /admin to cancel)_";

Bot.sendInlineKeyboard(buttons, text);
Bot.run({ command: "/admin_upload_got_video" });
