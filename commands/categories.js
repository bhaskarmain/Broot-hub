/*CMD
command: /categories
help: Browse videos by category and genres
need_reply: false
auto_retry_time: 
folder: 
answer: 
keyboard: 
aliases: /cats, /genre
group: 
CMD*/

let categories = Bot.getProperty("categories") || [];
let videos = Bot.getProperty("videos") || [];

if (categories.length === 0) {
  let buttons = [
    [
      { title: "🎬 Stream All Videos", command: "/get_video", style: "primary" },
      { title: "🎲 Random Video", command: "/random_video", style: "primary" }
    ],
    [{ title: "🏠 Main Menu", command: "/start", style: "primary" }]
  ];

  Bot.sendInlineKeyboard(
    buttons,
    "📂 *Video Categories*\n" +
    "━━━━━━━━━━━━━━━━━━━━━\n" +
    "All *" + videos.length + " videos* are currently available in the main video library.\n\n" +
    "Tap *🎬 Stream All Videos* or *🎲 Random Video* below to start watching!"
  );
  return;
}

// Calculate video counts per category
let catCounts = {};
for (let v = 0; v < videos.length; v++) {
  let cId = videos[v].category_id;
  if (cId) {
    catCounts[cId] = (catCounts[cId] || 0) + 1;
  }
}

let buttons = [];
for (let i = 0; i < categories.length; i++) {
  let cat = categories[i];
  let count = catCounts[cat.id] || 0;
  buttons.push([{
    title: (cat.emoji || "📁") + " " + cat.name + " (" + count + " videos)",
    command: "/view_cat " + cat.id,
    style: "primary"
  }]);
}

buttons.push([
  { title: "🎲 Random Video", command: "/random_video", style: "primary" },
  { title: "🎬 All Videos", command: "/get_video", style: "primary" }
]);
buttons.push([{ title: "🏠 Main Menu", command: "/start", style: "primary" }]);

let text =
  "📂 *Browse Video Categories*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "Select a category below to explore and stream videos:\n\n" +
  "📊 *Total Categories:* *" + categories.length + "* | 🎬 *Total Library:* *" + videos.length + " videos*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "Tap your preferred category below 👇";

Bot.sendInlineKeyboard(buttons, text);
