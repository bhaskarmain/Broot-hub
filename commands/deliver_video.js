/*CMD
command: /deliver_video
help: Continuous video rotation with category support, random delivery, new video priority and transaction-safe delivery
need_reply: false
auto_retry_time: 
folder: 
answer: 
keyboard: 
aliases: 
group: 
CMD*/

let videos = Bot.getProperty("videos") || [];

// 1. Check if videos exist in the library
if (!videos || videos.length === 0) {
  let buttons = [[{ title: "🏠 Main Menu", command: "/start", style: "primary" }]];
  Bot.sendInlineKeyboard(
    buttons,
    "⚠️ *No video has been uploaded yet.*\n\nPlease check back later when an admin uploads videos!"
  );
  return;
}

// 2. Concurrency & Rapid Click Protection (debounce rapid taps)
let now = Date.now();
let lastClick = User.getProperty("last_get_video_click") || 0;
if (now - lastClick < 1500) {
  return;
}
User.setProperty("last_get_video_click", now, "integer");

// 3. User Identity & Points Setup
let primaryAdmin = Bot.getProperty("admin_id") || 9250034188;
let adminList = Bot.getProperty("admin_ids") || [primaryAdmin];
let isAdmin = false;
for (let a = 0; a < adminList.length; a++) {
  if (user.telegramid == adminList[a] || user.telegramid == String(adminList[a])) {
    isAdmin = true;
    break;
  }
}

let freeUsed = User.getProperty("free_videos_used") || 0;
let userPoints = Bot.getProperty("points_" + user.telegramid);
if (userPoints === null || userPoints === undefined) {
  userPoints = User.getProperty("points") || 0;
}
let videoCost = Bot.getProperty("points_per_video") || 5;
let isFreeVideo = (!isAdmin && freeUsed < 2);

// 4. Points Verification BEFORE Queue Progression
if (!isAdmin && !isFreeVideo && userPoints < videoCost) {
  let insufficientText =
    "⚠️ *Insufficient Points Balance!*\n\n" +
    "You need at least *" + videoCost + " Points* to stream this video.\n\n" +
    "💎 *Your Balance:* *" + userPoints + " Points*\n\n" +
    "💡 *How to get more points:*\n" +
    "• 🎁 *Daily Bonus:* Collect free daily points via /daily_bonus\n" +
    "• 👥 *Refer Friends:* Earn *10 Points* for every invited user\n" +
    "• 💳 *Instant Recharge:* UPI packages starting from *₹10*";

  let buttons = [
    [
      { title: "🎁 Daily Bonus", command: "/daily_bonus", style: "primary" },
      { title: "👥 Refer & Earn", command: "/referral", style: "primary" }
    ],
    [
      { title: "💳 Buy Points", command: "/buy_points", style: "primary" },
      { title: "🏠 Main Menu", command: "/start", style: "primary" }
    ]
  ];

  Bot.sendInlineKeyboard(buttons, insufficientText);
  return;
}

// 5. Parse Mode & Filter Category (if applicable)
let mode = "";
let catFilter = null;
let rawParam = params ? params.toString().trim() : (User.getProperty("pending_video_mode") || "");
User.setProperty("pending_video_mode", null, "string");

if (rawParam === "random") {
  mode = "random";
} else if (rawParam.indexOf("cat_") === 0) {
  mode = "category";
  catFilter = parseInt(rawParam.replace("cat_", ""));
}

let targetPool = videos;
let categoryName = "";
if (catFilter) {
  let filtered = [];
  for (let f = 0; f < videos.length; f++) {
    if (videos[f].category_id === catFilter) {
      filtered.push(videos[f]);
    }
  }
  if (filtered.length > 0) {
    targetPool = filtered;
    let categories = Bot.getProperty("categories") || [];
    for (let c = 0; c < categories.length; c++) {
      if (categories[c].id === catFilter) {
        categoryName = categories[c].name;
        break;
      }
    }
  }
}

// 6. Rotation / Selection Logic
let allSeen = User.getProperty("all_seen_video_ids") || User.getProperty("watched_videos") || [];
let cycleDelivered = User.getProperty("cycle_delivered_ids") || [];
let lastRegularId = User.getProperty("last_rotation_vid_id");
let cycleNumber = User.getProperty("rotation_cycle") || 1;

let nextVideo = null;
let isNewPriorityVideo = false;

// Step A: Priority Check - Look for brand new videos never seen by this user
let brandNewVideos = [];
for (let i = 0; i < targetPool.length; i++) {
  if (allSeen.indexOf(targetPool[i].id) === -1) {
    brandNewVideos.push(targetPool[i]);
  }
}

if (mode === "random") {
  // Random Video mode
  let pool = brandNewVideos.length > 0 ? brandNewVideos : targetPool;
  nextVideo = pool[Math.floor(Math.random() * pool.length)];
} else if (brandNewVideos.length > 0) {
  nextVideo = brandNewVideos[0];
  isNewPriorityVideo = true;
} else {
  // Step B: Continuous Sequential Rotation within targetPool
  let remainingInCycle = [];
  for (let i = 0; i < targetPool.length; i++) {
    if (cycleDelivered.indexOf(targetPool[i].id) === -1) {
      remainingInCycle.push(targetPool[i]);
    }
  }

  // If all videos in library/pool have been delivered in this cycle, advance to next cycle!
  if (remainingInCycle.length === 0) {
    cycleNumber = cycleNumber + 1;
    User.setProperty("rotation_cycle", cycleNumber, "integer");
    cycleDelivered = [];
    User.setProperty("cycle_delivered_ids", cycleDelivered, "json");
    lastRegularId = null;
    User.setProperty("last_rotation_vid_id", null, "string");
  }

  let lastIndex = -1;
  if (lastRegularId !== null && lastRegularId !== undefined) {
    for (let i = 0; i < targetPool.length; i++) {
      if (targetPool[i].id == lastRegularId) {
        lastIndex = i;
        break;
      }
    }
  }

  for (let i = lastIndex + 1; i < targetPool.length; i++) {
    if (cycleDelivered.indexOf(targetPool[i].id) === -1) {
      nextVideo = targetPool[i];
      break;
    }
  }

  if (!nextVideo) {
    for (let i = 0; i <= lastIndex && i < targetPool.length; i++) {
      if (cycleDelivered.indexOf(targetPool[i].id) === -1) {
        nextVideo = targetPool[i];
        break;
      }
    }
  }

  if (!nextVideo) {
    for (let i = 0; i < targetPool.length; i++) {
      if (cycleDelivered.indexOf(targetPool[i].id) === -1) {
        nextVideo = targetPool[i];
        break;
      }
    }
  }
}

if (!nextVideo) {
  Bot.sendMessage("⚠️ Unable to load next video. Please try again.");
  return;
}

// 7. Deduct Points or Increment Free Video Counter
let statusLine = "";
if (isAdmin) {
  statusLine = "👑 *Admin Access:* Unlimited";
} else if (isFreeVideo) {
  let newFree = freeUsed + 1;
  User.setProperty("free_videos_used", newFree, "integer");
  statusLine = "🎁 *Free Video:* " + newFree + " of 2 used (0 points deducted)";
} else {
  let newPoints = userPoints - videoCost;
  User.setProperty("points", newPoints, "integer");
  Bot.setProperty("points_" + user.telegramid, newPoints, "integer");

  let totalSpent = (User.getProperty("total_points_spent") || 0) + videoCost;
  User.setProperty("total_points_spent", totalSpent, "integer");

  let history = User.getProperty("points_history") || [];
  history.push({
    type: "spent",
    amount: videoCost,
    reason: "Watched video (" + nextVideo.title + ")",
    date: new Date().toISOString()
  });
  User.setProperty("points_history", history, "json");

  statusLine = "💎 *Points Balance:* *" + newPoints + " Points* (-" + videoCost + " pts)";
}

// 8. Update User Rotation State & History
if (allSeen.indexOf(nextVideo.id) === -1) {
  allSeen.push(nextVideo.id);
  User.setProperty("all_seen_video_ids", allSeen, "json");
  User.setProperty("watched_videos", allSeen, "json");
}

if (cycleDelivered.indexOf(nextVideo.id) === -1) {
  cycleDelivered.push(nextVideo.id);
  User.setProperty("cycle_delivered_ids", cycleDelivered, "json");
}

if (!isNewPriorityVideo && mode !== "random") {
  User.setProperty("last_rotation_vid_id", nextVideo.id, "string");
}

// Increment global views
for (let i = 0; i < videos.length; i++) {
  if (videos[i].id === nextVideo.id) {
    videos[i].views = (videos[i].views || 0) + 1;
    break;
  }
}
Bot.setProperty("videos", videos, "json");

let totalViews = Bot.getProperty("total_views_count") || 0;
Bot.setProperty("total_views_count", totalViews + 1, "integer");

// 9. Deliver Video to User
let priorityTag = isNewPriorityVideo ? "🔥 *[New Video Priority]*\n" : "";
if (mode === "random") {
  priorityTag = "🎲 *[Random Video]*\n";
} else if (categoryName) {
  priorityTag = "📂 *[" + categoryName + "]*\n";
}

let caption =
  priorityTag +
  "🎬 *" + nextVideo.title + "*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  statusLine + "\n" +
  "🔄 *Cycle:* #" + cycleNumber + " (" + cycleDelivered.length + " of " + targetPool.length + " in rotation)\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "✨ _Enjoy watching!_";

let inlineKeyboard = [];
if (catFilter) {
  inlineKeyboard.push([
    { text: "🎬 Next in " + (categoryName || "Category"), callback_data: "/deliver_video cat_" + catFilter, style: "primary" },
    { text: "📂 Categories", callback_data: "/categories", style: "primary" }
  ]);
} else if (mode === "random") {
  inlineKeyboard.push([
    { text: "🎲 Another Random", callback_data: "/random_video", style: "primary" },
    { text: "🎬 Next Video", callback_data: "/get_video", style: "primary" }
  ]);
} else {
  inlineKeyboard.push([
    { text: "🎬 Get Next Video", callback_data: "/get_video", style: "primary" },
    { text: "🎲 Random Video", callback_data: "/random_video", style: "primary" }
  ]);
}

inlineKeyboard.push([
  { text: "📂 Categories", callback_data: "/categories", style: "primary" },
  { text: "💰 My Points", callback_data: "/my_points", style: "primary" }
]);
inlineKeyboard.push([
  { text: "🏠 Main Menu", callback_data: "/start", style: "primary" }
]);

// Deliver Video using Storage Channel copyMessage if available, else sendVideo
if (nextVideo.storage_channel_id && nextVideo.storage_message_id) {
  try {
    Api.copyMessage({
      chat_id: chat.chatid,
      from_chat_id: nextVideo.storage_channel_id,
      message_id: nextVideo.storage_message_id,
      caption: caption,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: inlineKeyboard
      }
    });
    return;
  } catch (e) {
    // Fall back to sendVideo if copyMessage encounters an issue
  }
}

// Fallback: Direct Video Streaming via File ID
Api.sendVideo({
  chat_id: chat.chatid,
  video: nextVideo.storage_file_id || nextVideo.file_id,
  caption: caption,
  parse_mode: "Markdown",
  supports_streaming: true,
  reply_markup: {
    inline_keyboard: inlineKeyboard
  }
});
