/*CMD
command: /categories
help: Browse videos by category and stream random video instantly
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

if (!categories || categories.length === 0) {
  categories = [
    { id: 101, name: "Cartoon", emoji: "🎨" },
    { id: 102, name: "Movies", emoji: "🍿" },
    { id: 103, name: "Comedy", emoji: "😂" },
    { id: 104, name: "Action", emoji: "💥" }
  ];
  Bot.setProperty("categories", categories, "json");
}

// Calculate video counts per category
let catCounts = {};
for (let v = 0; v < videos.length; v++) {
  let cId = videos[v].category_id;
  if (cId) {
    catCounts[cId] = (catCounts[cId] || 0) + 1;
  }
}

let catButtons = [];
for (let i = 0; i < categories.length; i++) {
  let cat = categories[i];
  let count = catCounts[cat.id] || 0;
  let countStr = count > 0 ? " (" + count + ")" : "";
  catButtons.push({
    title: (cat.emoji || "📁") + " " + cat.name + countStr,
    command: "/deliver_video cat_" + cat.id,
    style: "primary"
  });
}

let buttons = [];
for (let i = 0; i < catButtons.length; i += 2) {
  if (i + 1 < catButtons.length) {
    buttons.push([catButtons[i], catButtons[i + 1]]);
  } else {
    buttons.push([catButtons[i]]);
  }
}

buttons.push([
  { title: "🎲 Any Random Video", command: "/deliver_video random", style: "primary" },
  { title: "🎬 All Videos", command: "/get_video", style: "primary" }
]);
buttons.push([{ title: "🏠 Main Menu", command: "/start", style: "primary" }]);

let text =
  "📂 *Choose a Video Category*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "👇 *Neeche di gayi kisi bhi Category par click karein:*\n" +
  "Us category ki *Random Video* turant play hona shuru ho jayegi!\n\n" +
  "📊 *Total Categories:* *" + categories.length + "* | 🎬 *Total Library:* *" + videos.length + " videos*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "Apni pasandida category select karein 👇";

Bot.sendInlineKeyboard(buttons, text);
