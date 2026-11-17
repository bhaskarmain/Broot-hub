/*CMD
command: /start
help: Starts the bot and displays the main dashboard
need_reply: false
auto_retry_time: 
folder: 
answer: 
keyboard: 
aliases: 
group: 
CMD*/

// 1. Check if user is banned
let isBanned = Bot.getProperty("banned_" + user.telegramid);
if (isBanned) {
  Bot.sendMessage("🚫 *Access Denied*\n\nYour account has been suspended by administrators.");
  return;
}

// 2. Register user & handle referral if new
let isRegistered = User.getProperty("is_registered");
if (!isRegistered) {
  User.setProperty("is_registered", true, "boolean");
  User.setProperty("points", 0, "integer");
  User.setProperty("free_videos_used", 0, "integer");
  User.setProperty("total_points_earned", 0, "integer");
  User.setProperty("total_points_spent", 0, "integer");
  User.setProperty("points_history", [], "json");
  User.setProperty("watched_videos", [], "json");
  User.setProperty("joined_at", new Date().toISOString(), "string");
  Bot.setProperty("points_" + user.telegramid, 0, "integer");

  // Track global user list
  let allUsers = Bot.getProperty("all_users_list") || [];
  allUsers.push({
    id: user.telegramid,
    name: user.first_name || "User",
    username: user.username || "",
    joined: new Date().toISOString()
  });
  Bot.setProperty("all_users_list", allUsers, "json");

  // Increment total users counter
  let totalUsers = Bot.getProperty("total_users_count") || 0;
  Bot.setProperty("total_users_count", totalUsers + 1, "integer");

  // Clear any old hardcoded seed categories
  let existingCats = Bot.getProperty("categories");
  if (existingCats && existingCats.length === 3 && existingCats[0].name === "Action & Thriller") {
    Bot.setProperty("categories", [], "json");
  }

  // Initialize default storage channel if not set
  if (!Bot.getProperty("storage_channel_id")) {
    Bot.setProperty("storage_channel_id", "-1003856912131", "string");
  }

  // Handle Referral
  if (params) {
    let cleanParam = params.toString().replace("ref_", "").replace("ref", "").trim();
    let refId = parseInt(cleanParam);
    if (refId && refId != user.telegramid) {
      let refEnabled = Bot.getProperty("referral_enabled");
      if (refEnabled !== false) {
        let refPoints = Bot.getProperty("points_per_referral") || 10;
        let refCount = Bot.getProperty("ref_count_" + refId) || 0;
        let newCount = refCount + 1;
        Bot.setProperty("ref_count_" + refId, newCount, "integer");

        let referrerPoints = Bot.getProperty("points_" + refId) || 0;
        let newReferrerPoints = referrerPoints + refPoints;
        Bot.setProperty("points_" + refId, newReferrerPoints, "integer");

        let refPointsEarned = Bot.getProperty("ref_points_" + refId) || 0;
        Bot.setProperty("ref_points_" + refId, refPointsEarned + refPoints, "integer");

        let refList = Bot.getProperty("ref_list_" + refId) || [];
        refList.push({
          id: user.telegramid,
          name: user.first_name || "Friend",
          username: user.username || "",
          date: new Date().toISOString()
        });
        Bot.setProperty("ref_list_" + refId, refList, "json");

        User.setProperty("referrer_id", refId, "string");

        let totalValid = Bot.getProperty("total_valid_referrals") || 0;
        Bot.setProperty("total_valid_referrals", totalValid + 1, "integer");

        let totalDist = Bot.getProperty("total_points_distributed") || 0;
        Bot.setProperty("total_points_distributed", totalDist + refPoints, "integer");

        try {
          Bot.sendMessageToChatWithId(
            refId,
            "🎉 *New Referral Joined!*\n\n" +
            "User *" + (user.first_name || "Friend") + "* joined using your link!\n" +
            "• Total Referrals: *" + newCount + "*\n\n" +
            "🎁 *+" + refPoints + " Points Credited!* (Your Balance: *" + newReferrerPoints + " Points*)\n\n" +
            "Tap /my_points to view your balance or /get_video to watch videos!"
          );
        } catch (e) {}
      }
    }
  }
}

// 3. Force Channels Check for normal users
let primaryAdmin = Bot.getProperty("admin_id") || 9250034188;
let adminList = Bot.getProperty("admin_ids") || [primaryAdmin];
let isAdmin = false;
for (let a = 0; a < adminList.length; a++) {
  if (user.telegramid == adminList[a] || user.telegramid == String(adminList[a])) {
    isAdmin = true;
    break;
  }
}

let channels = Bot.getProperty("force_channels") || [];
let activeChannels = [];
for (let i = 0; i < channels.length; i++) {
  if (channels[i].enabled !== false) activeChannels.push(channels[i]);
}

if (!isAdmin && activeChannels.length > 0 && params !== "dashboard") {
  Bot.runCommand("/verify_step 0");
  return;
}

// 4. Render Upgraded Main Menu Dashboard
let buttons = [
  [
    { title: "🎬 Get Video", command: "/get_video", style: "primary" },
    { title: "🎲 Random Video", command: "/random_video", style: "primary" }
  ],
  [
    { title: "📂 Categories", command: "/categories", style: "primary" },
    { title: "🎁 Daily Bonus", command: "/daily_bonus", style: "primary" }
  ],
  [
    { title: "💰 My Points", command: "/my_points", style: "primary" },
    { title: "👥 Refer & Earn", command: "/referral", style: "primary" }
  ],
  [
    { title: "💳 Buy Points", command: "/buy_points", style: "primary" },
    { title: "🏆 Leaderboard", command: "/leaderboard", style: "primary" }
  ],
  [
    { title: "ℹ️ Help & Support", command: "/help", style: "primary" }
  ]
];

// Show Admin button for authorized admins
if (isAdmin) {
  buttons.push([{ title: "🛠 Open Admin Panel", command: "/admin", style: "primary" }]);
}

let freeUsed = User.getProperty("free_videos_used") || 0;
let freeLeft = Math.max(0, 2 - freeUsed);
let userPoints = Bot.getProperty("points_" + user.telegramid);
if (userPoints === null || userPoints === undefined) {
  userPoints = User.getProperty("points") || 0;
}

// Bonus status preview
let now = Date.now();
let lastClaim = User.getProperty("last_bonus_claim_time") || 0;
let bonusAvailable = (now - lastClaim >= 24 * 60 * 60 * 1000);
let bonusBadge = bonusAvailable ? "🎁 *Daily Bonus:* Available Now!" : "⏳ *Daily Bonus:* Claimed Today";

let welcomeText =
  "👋 *Welcome, " + (user.first_name || "Friend") + "!*\n\n" +
  "🎬 *Smart Video Bot Dashboard*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "🎁 *Free Videos Left:* *" + freeLeft + " of 2 Free Videos*\n" +
  "💰 *My Points Balance:* *" + userPoints + " Points*\n" +
  bonusBadge + "\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "📌 *Key Features:*\n" +
  "• 🎁 *First 2 Videos FREE:* Stream right away with 0 points deducted!\n" +
  "• 🎁 *Daily Bonus:* Tap *Daily Bonus* to claim free daily points.\n" +
  "• 📂 *Categories & Random:* Explore by genre or get a random video.\n" +
  "• 👥 *Refer & Earn:* Earn *10 Points* for every invited friend.\n" +
  "• 💳 *Buy Points:* Instant UPI packages starting at *₹10 = 100 Points*.\n\n" +
  "Tap *🎬 Get Video* below to start streaming 👇";

Bot.sendInlineKeyboard(buttons, welcomeText);
