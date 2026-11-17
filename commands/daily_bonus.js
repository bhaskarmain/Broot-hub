/*CMD
command: /daily_bonus
help: Daily free points reward with streak multiplier
need_reply: false
auto_retry_time: 
folder: 
answer: 
keyboard: 
aliases: /bonus, /claim
group: 
CMD*/

// 1. Check if user is banned
let isBanned = Bot.getProperty("banned_" + user.telegramid);
if (isBanned) {
  Bot.sendMessage("🚫 *Access Denied*\n\nYour account has been suspended by administrators.");
  return;
}

// 2. Check if Daily Bonus feature is enabled
let bonusEnabled = Bot.getProperty("daily_bonus_enabled");
if (bonusEnabled === false) {
  Bot.sendInlineKeyboard(
    [[{ title: "🏠 Main Menu", command: "/start", style: "primary" }]],
    "⚠️ *Daily Bonus is currently disabled by administrators.*\n\nYou can still earn points via Referral or UPI packages!"
  );
  return;
}

// 3. Time calculation for 24-hour cooldown
let now = Date.now();
let lastClaim = User.getProperty("last_bonus_claim_time") || 0;
let cooldownMs = 24 * 60 * 60 * 1000; // 24 hours
let elapsed = now - lastClaim;

if (elapsed < cooldownMs) {
  let remainingMs = cooldownMs - elapsed;
  let remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
  let remainingMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  let remainingSecs = Math.floor((remainingMs % (1000 * 60)) / 1000);

  let waitText =
    "⏳ *Daily Bonus Already Claimed!*\n" +
    "━━━━━━━━━━━━━━━━━━━━━\n" +
    "You have already collected today's free bonus reward.\n\n" +
    "⏰ *Next Claim Available In:*\n" +
    "🕒 *" + remainingHours + "h " + remainingMins + "m " + remainingSecs + "s*\n\n" +
    "💡 *Want more points right now?*\n" +
    "• Invite friends with your referral link (*+10 Points* each)\n" +
    "• Buy instant points packages starting at *₹10*";

  let buttons = [
    [
      { title: "🎁 Refer & Earn", command: "/referral", style: "primary" },
      { title: "💳 Buy Points", command: "/buy_points", style: "primary" }
    ],
    [{ title: "🏠 Main Menu", command: "/start", style: "primary" }]
  ];

  Bot.sendInlineKeyboard(buttons, waitText);
  return;
}

// 4. Calculate streak and bonus points
let streak = User.getProperty("bonus_streak") || 0;
let gracePeriodMs = 48 * 60 * 60 * 1000; // 48 hours to preserve streak

if (lastClaim > 0 && elapsed <= gracePeriodMs) {
  streak = streak + 1;
} else {
  streak = 1;
}

let baseBonus = Bot.getProperty("daily_bonus_points") || 5;
let streakBonus = 0;
if (streak >= 7) {
  streakBonus = 5; // +5 extra bonus for 7-day streak
} else if (streak >= 3) {
  streakBonus = 2; // +2 extra bonus for 3-day streak
}

let totalReward = baseBonus + streakBonus;

// 5. Credit points
let currentPoints = Bot.getProperty("points_" + user.telegramid);
if (currentPoints === null || currentPoints === undefined) {
  currentPoints = User.getProperty("points") || 0;
}
let newBalance = currentPoints + totalReward;

User.setProperty("points", newBalance, "integer");
Bot.setProperty("points_" + user.telegramid, newBalance, "integer");
User.setProperty("last_bonus_claim_time", now, "integer");
User.setProperty("bonus_streak", streak, "integer");

let totalEarned = (User.getProperty("total_points_earned") || 0) + totalReward;
User.setProperty("total_points_earned", totalEarned, "integer");

// Record transaction history
let history = User.getProperty("points_history") || [];
history.push({
  type: "earned",
  amount: totalReward,
  reason: "Daily Bonus (Day " + streak + " Streak)",
  date: new Date().toISOString()
});
User.setProperty("points_history", history, "json");

// 6. Success Announcement
let streakMsg = streak >= 3 ? "\n🔥 *Active Streak:* *" + streak + " Days in a row!* (+" + streakBonus + " bonus pts)" : "";
let successText =
  "🎉 *Daily Bonus Claimed Successfully!*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "🎁 *Reward Received:* *+" + totalReward + " Points*\n" +
  streakMsg + "\n" +
  "💰 *Updated Points Balance:* *" + newBalance + " Points*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "Come back in *24 hours* to collect your next daily reward!\n\n" +
  "🎬 Tap *Get Video* below to start streaming videos now 👇";

let buttons = [
  [
    { title: "🎬 Get Video", command: "/get_video", style: "primary" },
    { title: "💰 My Points", command: "/my_points", style: "primary" }
  ],
  [
    { title: "🎁 Refer & Earn", command: "/referral", style: "primary" },
    { title: "🏠 Main Menu", command: "/start", style: "primary" }
  ]
];

Bot.sendInlineKeyboard(buttons, successText);
