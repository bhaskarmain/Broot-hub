/*CMD
command: /search
help: Search video library by title or keyword
need_reply: false
auto_retry_time: 
folder: 
answer: 
keyboard: 
aliases: /find
group: 
CMD*/

let query = "";
if (params) {
  query = params.toString().trim();
} else if (message) {
  let mTxt = message.trim();
  if (mTxt.indexOf("/search") === 0 || mTxt.indexOf("/find") === 0) {
    query = mTxt.replace(/^\/(search|find)\s*/i, "").trim();
  } else if (!mTxt.startsWith("/")) {
    query = mTxt.trim();
  }
}

if (!query) {
  let promptText =
    "🔍 *Search Video Library*\n" +
    "━━━━━━━━━━━━━━━━━━━━━\n" +
    "Type a keyword, title, or genre to search videos:\n\n" +
    "👉 Send your search query now (e.g. `Action`, `Part 1`, `Episode`), or tap Cancel:";

  let promptButtons = [
    [
      { title: "📂 Browse Categories", command: "/categories", style: "primary" },
      { title: "🏠 Cancel", command: "/start", style: "primary" }
    ]
  ];

  User.setProperty("awaiting_search_query", true, "boolean");
  Bot.sendInlineKeyboard(promptButtons, promptText);
  return;
}

User.setProperty("awaiting_search_query", false, "boolean");

let videos = Bot.getProperty("videos") || [];
let qLower = query.toLowerCase();
let matches = [];

for (let i = 0; i < videos.length; i++) {
  let v = videos[i];
  let titleMatch = v.title && v.title.toLowerCase().indexOf(qLower) > -1;
  let descMatch = v.description && v.description.toLowerCase().indexOf(qLower) > -1;
  if (titleMatch || descMatch) {
    matches.push(v);
  }
}

if (matches.length === 0) {
  let failButtons = [
    [
      { title: "🔍 Search Again", command: "/search", style: "primary" },
      { title: "📂 Categories", command: "/categories", style: "primary" }
    ],
    [{ title: "🏠 Main Menu", command: "/start", style: "primary" }]
  ];

  Bot.sendInlineKeyboard(
    failButtons,
    "❌ *No Videos Found*\n\nNo videos matching *" + query + "* were found in our library.\nTry searching with a shorter keyword or browse categories below!"
  );
  return;
}

let buttons = [];
let maxResults = Math.min(matches.length, 8);
for (let i = 0; i < maxResults; i++) {
  let v = matches[i];
  buttons.push([{
    title: "▶️ " + (v.title || "Video " + (i + 1)),
    command: "/play_fav " + v.id,
    style: "primary"
  }]);
}

buttons.push([
  { title: "🔍 New Search", command: "/search", style: "primary" },
  { title: "📂 Categories", command: "/categories", style: "primary" }
]);
buttons.push([{ title: "🏠 Main Menu", command: "/start", style: "primary" }]);

let text =
  "🔍 *Search Results for: \"" + query + "\"*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "Found *" + matches.length + " matching videos*:\n\n" +
  "Tap any video below to stream 👇";

Bot.sendInlineKeyboard(buttons, text);
