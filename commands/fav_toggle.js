/*CMD
command: /fav_toggle
help: Add or remove video from user favorites watchlist
need_reply: false
auto_retry_time: 
folder: 
answer: 
keyboard: 
aliases: 
group: 
CMD*/

let vidId = parseInt(params);
if (!vidId) return;

let favs = User.getProperty("favorite_videos") || [];
let idx = favs.indexOf(vidId);
let added = false;

if (idx > -1) {
  favs.splice(idx, 1);
  added = false;
} else {
  favs.push(vidId);
  added = true;
}

User.setProperty("favorite_videos", favs, "json");

let videos = Bot.getProperty("videos") || [];
let vidTitle = "Video";
for (let i = 0; i < videos.length; i++) {
  if (videos[i].id === vidId) {
    vidTitle = videos[i].title || "Video";
    break;
  }
}

let msg = added
  ? "⭐ *Saved to Favorites!*\n\n*" + vidTitle + "* has been added to your favorites list. Access it anytime via /favorites!"
  : "❌ *Removed from Favorites!*\n\n*" + vidTitle + "* has been removed from your favorites.";

let buttons = [
  [{ title: "⭐ View All Favorites", command: "/favorites", style: "primary" }],
  [{ title: "🎬 Continue Streaming", command: "/get_video", style: "primary" }]
];

Bot.sendInlineKeyboard(buttons, msg);
