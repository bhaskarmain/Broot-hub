/*CMD
command: /admin_vid_save_cat
help: Save updated category for a specific video
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

if (!params) {
  Bot.runCommand("/admin_manage_vids");
  return;
}

let parts = params.split("_");
let vidId = parseInt(parts[0]);
let newCatId = parseInt(parts[1]);

let videos = Bot.getProperty("videos") || [];
let vidIndex = -1;
for (let i = 0; i < videos.length; i++) {
  if (videos[i].id === vidId) {
    vidIndex = i;
    break;
  }
}

if (vidIndex === -1) {
  Bot.sendMessage("⚠️ Video not found.");
  Bot.runCommand("/admin_manage_vids");
  return;
}

videos[vidIndex].category_id = (newCatId === 0 ? null : newCatId);
Bot.setProperty("videos", videos, "json");

let categories = Bot.getProperty("categories") || [];
let catName = "General (No Category)";
let catEmoji = "📁";
if (newCatId !== 0) {
  for (let c = 0; c < categories.length; c++) {
    if (categories[c].id === newCatId) {
      catName = categories[c].name;
      catEmoji = categories[c].emoji || "📁";
      break;
    }
  }
}

let buttons = [
  [{ title: "🎬 View Video Details", command: "/admin_vid_detail " + vidId }],
  [{ title: "📋 Videos List", command: "/admin_manage_vids" }]
];

Bot.sendInlineKeyboard(
  buttons,
  "✅ *Category Updated Successfully!*\n\n" +
  "🎬 *Video:* " + videos[vidIndex].title + "\n" +
  "📂 *New Category:* " + catEmoji + " " + catName
);
