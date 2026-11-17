/*CMD
command: /redeem
help: Redeem promotional gift code for free points
need_reply: false
auto_retry_time: 
folder: 
answer: 
keyboard: 
aliases: /promo, /gift, /claim_code
group: 
CMD*/

// 1. Check if user is banned
let isBanned = Bot.getProperty("banned_" + user.telegramid);
if (isBanned) {
  Bot.sendMessage("🚫 *Access Denied*\n\nYour account has been suspended by administrators.");
  return;
}

// 2. Extract code from parameters or message
let inputCode = "";
if (params) {
  inputCode = params.toString().trim().toUpperCase();
} else if (message) {
  let cleanMsg = message.trim();
  if (cleanMsg.indexOf("/redeem") === 0 || cleanMsg.indexOf("/promo") === 0) {
    inputCode = cleanMsg.replace(/^\/(redeem|promo|gift|claim_code)\s*/i, "").trim().toUpperCase();
  } else if (!cleanMsg.startsWith("/")) {
    inputCode = cleanMsg.trim().toUpperCase();
  }
}

if (!inputCode) {
  let promptText =
    "🎟 *Redeem Promo Code*\n" +
    "━━━━━━━━━━━━━━━━━━━━━\n" +
    "Have a secret promo code from our official channels?\n\n" +
    "👉 Send your code now (e.g. `WELCOME50` or `BONUS100`), or tap Cancel:";

  let promptButtons = [
    [{ title: "🏠 Cancel & Return", command: "/start", style: "primary" }]
  ];

  User.setProperty("awaiting_redeem_code", true, "boolean");
  Bot.sendInlineKeyboard(promptButtons, promptText);
  return;
}

User.setProperty("awaiting_redeem_code", false, "boolean");

// 3. Lookup Code
let promoCodes = Bot.getProperty("promo_codes") || [];
let selectedPromo = null;
let promoIndex = -1;

for (let i = 0; i < promoCodes.length; i++) {
  if (promoCodes[i].code.toUpperCase() === inputCode) {
    selectedPromo = promoCodes[i];
    promoIndex = i;
    break;
  }
}

if (!selectedPromo || selectedPromo.active === false) {
  let failButtons = [
    [{ title: "🔄 Try Another Code", command: "/redeem", style: "primary" }],
    [{ title: "🏠 Main Menu", command: "/start", style: "primary" }]
  ];
  Bot.sendInlineKeyboard(failButtons, "❌ *Invalid or Expired Promo Code!*\n\nPlease check the spelling or ask an admin for an active code.");
  return;
}

// 4. Check if user already claimed this specific promo
let alreadyClaimed = User.getProperty("claimed_promo_" + selectedPromo.code);
if (alreadyClaimed) {
  let dupButtons = [
    [{ title: "💰 My Points", command: "/my_points", style: "primary" }],
    [{ title: "🏠 Main Menu", command: "/start", style: "primary" }]
  ];
  Bot.sendInlineKeyboard(dupButtons, "⚠️ *Already Redeemed!*\n\nYou have already claimed promo code *" + selectedPromo.code + "*.");
  return;
}

// 5. Check max usage limit
let currentUses = selectedPromo.claimed_count || 0;
if (selectedPromo.max_users > 0 && currentUses >= selectedPromo.max_users) {
  let maxButtons = [
    [{ title: "🏠 Main Menu", command: "/start", style: "primary" }]
  ];
  Bot.sendInlineKeyboard(maxButtons, "⚠️ *Promo Limit Reached!*\n\nThis promo code has reached its maximum claim limit of *" + selectedPromo.max_users + " users*.");
  return;
}

// 6. Award Points
let rewardPts = selectedPromo.points || 10;
let currentPoints = Bot.getProperty("points_" + user.telegramid);
if (currentPoints === null || currentPoints === undefined) {
  currentPoints = User.getProperty("points") || 0;
}
let newBalance = currentPoints + rewardPts;

User.setProperty("points", newBalance, "integer");
Bot.setProperty("points_" + user.telegramid, newBalance, "integer");
User.setProperty("claimed_promo_" + selectedPromo.code, true, "boolean");

// Increment code claim counter
promoCodes[promoIndex].claimed_count = currentUses + 1;
Bot.setProperty("promo_codes", promoCodes, "json");

let totalEarned = (User.getProperty("total_points_earned") || 0) + rewardPts;
User.setProperty("total_points_earned", totalEarned, "integer");

// Record transaction
let history = User.getProperty("points_history") || [];
history.push({
  type: "earned",
  amount: rewardPts,
  reason: "Promo Code (" + selectedPromo.code + ")",
  date: new Date().toISOString()
});
User.setProperty("points_history", history, "json");

// 7. Success Response
let successText =
  "🎉 *Promo Code Redeemed Successfully!*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "🎟 *Code:* `" + selectedPromo.code + "`\n" +
  "🎁 *Points Credited:* *+" + rewardPts + " Points*\n" +
  "💰 *Updated Points Balance:* *" + newBalance + " Points*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "Enjoy your free points! Tap *Get Video* below to start streaming 👇";

let successButtons = [
  [
    { title: "🎬 Get Video", command: "/get_video", style: "primary" },
    { title: "💰 My Points", command: "/my_points", style: "primary" }
  ],
  [{ title: "🏠 Main Menu", command: "/start", style: "primary" }]
];

Bot.sendInlineKeyboard(successButtons, successText);
