/*CMD
command: /play_fav
help: Stream a saved favorite video directly with 0 points deducted
need_reply: false
auto_retry_time: 
folder: 
answer: 
keyboard: 
aliases: 
group: 
CMD*/

let vidId = parseInt(params);
if (!vidId) {
  Bot.runCommand("/favorites");
  return;
}

let videos = Bot.getProperty("videos") || [];
let targetVideo = null;
for (let i = 0; i < videos.length; i++) {
  if (videos[i].id === vidId) {
    targetVideo = videos[i];
    break;
  }
}

if (!targetVideo) {
  Bot.sendMessage("⚠️ Video no longer available in the library.");
  Bot.runCommand("/favorites");
  return;
}

let caption =
  "⭐ *[Favorite Video]*\n" +
  "🎬 *" + (targetVideo.title || "Video") + "*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "✨ _Free replay from your personal watchlist!_";

let inlineKeyboard = [
  [
    { text: "⭐ All Favorites", callback_data: "/favorites", style: "primary" },
    { text: "🎬 Stream Next Video", callback_data: "/get_video", style: "primary" }
  ],
  [{ text: "🏠 Main Menu", callback_data: "/start", style: "primary" }]
];

// Deliver Video using Storage Channel copyMessage if available, else sendVideo
if (targetVideo.storage_channel_id && targetVideo.storage_message_id) {
  try {
    Api.copyMessage({
      chat_id: chat.chatid,
      from_chat_id: targetVideo.storage_channel_id,
      message_id: targetVideo.storage_message_id,
      caption: caption,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: inlineKeyboard
      }
    });
    return;
  } catch (e) {}
}

Api.sendVideo({
  chat_id: chat.chatid,
  video: targetVideo.storage_file_id || targetVideo.file_id,
  caption: caption,
  parse_mode: "Markdown",
  supports_streaming: true,
  reply_markup: {
    inline_keyboard: inlineKeyboard
  }
});
