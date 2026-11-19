/*CMD
command: /admin_upload
help: Single Video Upload - Step 1: Select Category
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

let categories = Bot.getProperty("categories") || [];
if (!categories || categories.length === 0) {
  categories = [
    { id: 101, name: "Cartoon", emoji: "🎨" },
    { id: 102, name: "Movies", emoji: "🍿" },
    { id: 103, name: "Comedy", emoji: "😂" },
    { id: 104, name: "Action", emoji: "💥" }
  ];
  Bot.setProperty("categories", categories, "json");
}

let buttons = [];
let row = [];
for (let i = 0; i < categories.length; i++) {
  let cat = categories[i];
  row.push({
    title: (cat.emoji || "📁") + " " + cat.name,
    command: "/admin_upload_to " + cat.id
  });
  if (row.length === 2) {
    buttons.push(row);
    row = [];
  }
}
if (row.length > 0) buttons.push(row);

buttons.push([
  { title: "📁 General (No Category)", command: "/admin_upload_to 0" }
]);
buttons.push([
  { title: "➕ Add New Category", command: "/admin_add_cat" },
  { title: "🔙 Admin Menu", command: "/admin" }
]);

let text =
  "📤 *Single Video Upload — Select Category*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "👉 Video kis Category mein add karni hai? Choose karein:\n\n" +
  "• Jaise hi aap category (e.g. 🎨 Cartoon) select karenge, bot aapse video mangega.\n" +
  "• Upload hone ke baad users us category par click karke random video stream kar sakenge!\n" +
  "━━━━━━━━━━━━━━━━━━━━━";

Bot.sendInlineKeyboard(buttons, text);
