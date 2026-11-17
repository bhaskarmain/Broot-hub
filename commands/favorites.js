/*CMD
command: /favorites
help: View saved favorite videos watchlist
need_reply: false
auto_retry_time: 
folder: 
answer: 
keyboard: 
aliases: /favs, /watchlist
group: 
CMD*/

let favIds = User.getProperty("favorite_videos") || [];
let videos = Bot.getProperty("videos") || [];

let favVideos = [];
for (let f = 0; f < favIds.length; f++) {
  for (let v = 0; v < videos.length; v++) {
    if (videos[v].id === favIds[f]) {
      favVideos.push(videos[v]);
      break;
    }
  }
}

if (favVideos.length === 0) {
  let emptyButtons = [
    [{ title: "🎬 Browse Videos", command: "/get_video", style: "primary" }],
    [{ title: "🏠 Main Menu", command: "/start", style: "primary" }]
  ];

  Bot.sendInlineKeyboard(
    emptyButtons,
    "⭐ *Your Favorites Watchlist is Empty!*\n\n" +
    "Whenever you watch a video, tap *⭐ Save to Favorites* under the video to keep it in your personal collection."
  );
  return;
}

let buttons = [];
for (let i = 0; i < favVideos.length; i++) {
  let v = favVideos[i];
  buttons.push([{
    title: "▶️ " + (v.title || "Video " + (i + 1)),
    command: "/play_fav " + v.id,
    style: "primary"
  }]);
}

buttons.push([
  { title: "🎬 Stream New Videos", command: "/get_video", style: "primary" },
  { title: "🏠 Main Menu", command: "/start", style: "primary" }
]);

let text =
  "⭐ *Your Saved Favorites (" + favVideos.length + " Videos)*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "Tap any video title below to re-watch instantly without any point deduction:\n\n" +
  "━━━━━━━━━━━━━━━━━━━━━";

Bot.sendInlineKeyboard(buttons, text);
