/*CMD
command: /spin
help: Daily lucky spin wheel with points rewards and jackpot
need_reply: false
auto_retry_time: 
folder: 
answer: 
keyboard: 
aliases: /lucky_spin, /wheel
group: 
CMD*/

// 1. Check if user is banned
let isBanned = Bot.getProperty("banned_" + user.telegramid);
if (isBanned) {
  Bot.sendMessage("🚫 *Access Denied*\n\nYour account has been suspended by administrators.");
  return;
}

let now = Date.now();
let lastSpin = User.getProperty("last_spin_time") || 0;
let cooldownMs = 24 * 60 * 60 * 1000;
let elapsed = now - lastSpin;
let isExtraSpin = (params && params.trim() === "buy_spin");

let currentPoints = Bot.getProperty("points_" + user.telegramid);
if (currentPoints === null || currentPoints === undefined) {
  currentPoints = User.getProperty("points") || 0;
}

// 2. Cooldown check (unless buying extra spin for 2 points)
if (elapsed < cooldownMs && !isExtraSpin) {
  let remainingMs = cooldownMs - elapsed;
  let rHours = Math.floor(remainingMs / (1000 * 60 * 60));
  let rMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  let waitText =
    "⏳ *Daily Free Spin Already Used!*\n" +
    "━━━━━━━━━━━━━━━━━━━━━\n" +
    "Your daily free spin will recharge in:\n" +
    "🕒 *" + rHours + "h " + rMins + "m*\n\n" +
    "🎰 *Want to spin again right now?*\n" +
    "You can take an *Extra Spin* for just *2 Points*!";

  let buttons = [
    [{ title: "🎰 Extra Spin (Cost: 2 pts)", command: "/spin buy_spin", style: "primary" }],
    [
      { title: "🎁 Daily Bonus", command: "/daily_bonus", style: "primary" },
      { title: "👥 Refer & Earn", command: "/referral", style: "primary" }
    ],
    [{ title: "🏠 Main Menu", command: "/start", style: "primary" }]
  ];

  Bot.sendInlineKeyboard(buttons, waitText);
  return;
}

// 3. If buying extra spin, verify and deduct 2 points
if (isExtraSpin) {
  if (currentPoints < 2) {
    let failButtons = [
      [
        { title: "🎁 Refer & Earn", command: "/referral", style: "primary" },
        { title: "💳 Buy Points", command: "/buy_points", style: "primary" }
      ],
      [{ title: "🏠 Main Menu", command: "/start", style: "primary" }]
    ];
    Bot.sendInlineKeyboard(failButtons, "⚠️ *Not Enough Points!*\n\nYou need at least *2 Points* to take an extra spin.");
    return;
  }
  currentPoints = currentPoints - 2;
  User.setProperty("points", currentPoints, "integer");
  Bot.setProperty("points_" + user.telegramid, currentPoints, "integer");
} else {
  // Free spin resets cooldown
  User.setProperty("last_spin_time", now, "integer");
}

// 4. Weighted Prize Selection
// Probabilities: 2pts (35%), 5pts (30%), 8pts (15%), 10pts (10%), 15pts (7%), 25pts Jackpot (3%)
let rand = Math.floor(Math.random() * 100);
let prize = 2;
let isJackpot = false;

if (rand < 35) {
  prize = 2;
} else if (rand < 65) {
  prize = 5;
} else if (rand < 80) {
  prize = 8;
} else if (rand < 90) {
  prize = 10;
} else if (rand < 97) {
  prize = 15;
} else {
  prize = 25;
  isJackpot = true;
}

// Credit Prize
let newBalance = currentPoints + prize;
User.setProperty("points", newBalance, "integer");
Bot.setProperty("points_" + user.telegramid, newBalance, "integer");

let totalSpins = (User.getProperty("total_spins_count") || 0) + 1;
User.setProperty("total_spins_count", totalSpins, "integer");

let totalEarned = (User.getProperty("total_points_earned") || 0) + prize;
User.setProperty("total_points_earned", totalEarned, "integer");

// Record Transaction
let history = User.getProperty("points_history") || [];
history.push({
  type: "earned",
  amount: prize,
  reason: isJackpot ? "🎰 LUCKY JACKPOT SPIN!" : "🎡 Lucky Wheel Spin",
  date: new Date().toISOString()
});
User.setProperty("points_history", history, "json");

// 5. Result Presentation
let header = isJackpot
  ? "💥 *🎉 JACKPOT WINNER! 🎉* 💥"
  : "🎡 *Lucky Spin Wheel Result!*";

let spinCard =
  header + "\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "🎯 *The wheel landed on:* *" + prize + " Points!* 🎁\n" +
  (isJackpot ? "\n🔥 *CONGRATULATIONS! You hit the Mega Jackpot!* 🔥\n" : "") +
  "💰 *Updated Points Balance:* *" + newBalance + " Points*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "🎬 Tap *Get Video* below to stream videos now!";

let resultButtons = [
  [
    { title: "🎬 Get Video", command: "/get_video", style: "primary" },
    { title: "🎰 Spin Again (2 pts)", command: "/spin buy_spin", style: "primary" }
  ],
  [
    { title: "💰 My Points", command: "/my_points", style: "primary" },
    { title: "🏠 Main Menu", command: "/start", style: "primary" }
  ]
];

Bot.sendInlineKeyboard(resultButtons, spinCard);
