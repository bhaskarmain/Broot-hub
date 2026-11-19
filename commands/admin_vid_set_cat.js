/*CMD
command: /admin_vid_set_cat
help: Change or assign category for a specific video
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

let vidId = parseInt(params);
if (!vidId) {
  Bot.runCommand("/admin_manage_vids");
  return;
}

let videos = Bot.getProperty("videos") || [];
let vid = null;
for (let i = 0; i < videos.length; i++) {
  if (videos[i].id === vidId) {
    vid = videos[i];
    break;
  }
}

if (!vid) {
  Bot.sendMessage("⚠️ Video not found.");
  Bot.runCommand("/admin_manage_vids");
  return;
}

let categories = Bot.getProperty("categories") || [];
let buttons = [];
let row = [];
for (let i = 0; i < categories.length; i++) {
  let cat = categories[i];
  row.push({
    title: (cat.emoji || "📁") + " " + cat.name,
    command: "/admin_vid_save_cat " + vid.id + "_" + cat.id
  });
  if (row.length === 2) {
    buttons.push(row);
    row = [];
  }
}
if (row.length > 0) buttons.push(row);

buttons.push([
  { title: "📁 General (Remove Category)", command: "/admin_vid_save_cat " + vid.id + "_0" }
]);
buttons.push([
  { title: "🔙 Back to Video Details", command: "/admin_vid_detail " + vid.id }
]);

let text =
  "📂 *Change Video Category*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "🎬 *Video:* " + vid.title + "\n\n" +
  "Select a new category for this video below:";

Bot.sendInlineKeyboard(buttons, text);
