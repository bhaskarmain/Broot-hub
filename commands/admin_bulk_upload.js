/*CMD
command: /admin_bulk_upload
help: Bulk Video Upload - Step 1: Select Category for batch
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
    command: "/admin_bulk_start " + cat.id
  });
  if (row.length === 2) {
    buttons.push(row);
    row = [];
  }
}
if (row.length > 0) buttons.push(row);

buttons.push([
  { title: "📁 General (No Category)", command: "/admin_bulk_start 0" }
]);
buttons.push([
  { title: "➕ Add Category", command: "/admin_add_cat" },
  { title: "🔙 Admin Menu", command: "/admin" }
]);

let text =
  "📦 *Bulk Video Upload — Select Category*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "👉 Is batch ki saari videos kis Category mein upload karni hain?\n\n" +
  "• Category choose karte hi aap ek saath multiple videos forward kar sakenge.\n" +
  "• Saari videos directly us category (e.g. 🎨 Cartoon) mein save hongi!\n" +
  "━━━━━━━━━━━━━━━━━━━━━";

Bot.sendInlineKeyboard(buttons, text);
