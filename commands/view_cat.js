/*CMD
command: /view_cat
help: View category details and start streaming from it
need_reply: false
auto_retry_time: 
folder: 
answer: 
keyboard: 
aliases: 
group: 
CMD*/

let catId = parseInt(params);
if (!catId) {
  Bot.runCommand("/categories");
  return;
}

let categories = Bot.getProperty("categories") || [];
let selectedCat = null;
for (let i = 0; i < categories.length; i++) {
  if (categories[i].id === catId) {
    selectedCat = categories[i];
    break;
  }
}

if (!selectedCat) {
  Bot.sendMessage("⚠️ Category not found.");
  Bot.runCommand("/categories");
  return;
}

let videos = Bot.getProperty("videos") || [];
let catVideos = [];
for (let v = 0; v < videos.length; v++) {
  if (videos[v].category_id === catId) {
    catVideos.push(videos[v]);
  }
}

let buttons = [];
if (catVideos.length > 0) {
  buttons.push([{
    title: "🎬 Play from " + selectedCat.name,
    command: "/deliver_video cat_" + catId,
    style: "primary"
  }]);
}

buttons.push([
  { title: "🔙 Back to Categories", command: "/categories", style: "primary" },
  { title: "🏠 Main Menu", command: "/start", style: "primary" }
]);

let recentTitles = [];
let maxShow = Math.min(catVideos.length, 5);
for (let i = 0; i < maxShow; i++) {
  recentTitles.push("• " + (catVideos[i].title || "Video " + (i + 1)));
}

let titlesSection = recentTitles.length > 0
  ? "\n📋 *Recent Titles in this Category:*\n" + recentTitles.join("\n") + "\n"
  : "\n_No videos have been uploaded to this category yet._\n";

let text =
  (selectedCat.emoji || "📁") + " *" + selectedCat.name + " Category*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "📊 *Total Videos Available:* *" + catVideos.length + " videos*\n" +
  titlesSection +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  (catVideos.length > 0 ? "Tap below to start streaming videos from this category 👇" : "");

Bot.sendInlineKeyboard(buttons, text);
