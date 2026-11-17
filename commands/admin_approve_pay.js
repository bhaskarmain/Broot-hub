/*CMD
command: /admin_approve_pay
help: Approve pending payment and credit points or activate VIP
need_reply: false
auto_retry_time: 
folder: 
answer: 
keyboard: 
aliases: 
group: 
CMD*/

let primaryAdmin = Bot.getProperty("admin_id") || 9250034188;
let adminList = Bot.getProperty("admin_ids") || [primaryAdmin];
let isAdmin = false;
for (let a = 0; a < adminList.length; a++) {
  if (user.telegramid == adminList[a] || user.telegramid == String(adminList[a])) {
    isAdmin = true;
    break;
  }
}

if (!isAdmin) {
  Bot.sendMessage("🚫 *Access Denied.*");
  return;
}

let orderId = (params || "").trim();
if (!orderId) {
  Bot.runCommand("/admin_payments");
  return;
}

let payments = Bot.getProperty("payment_requests") || [];
let paymentIndex = -1;
for (let i = 0; i < payments.length; i++) {
  if (payments[i].order_id === orderId) {
    paymentIndex = i;
    break;
  }
}

if (paymentIndex === -1) {
  Bot.sendMessage("⚠️ Payment request not found.");
  Bot.runCommand("/admin_payments");
  return;
}

let pay = payments[paymentIndex];

// Security: Prevent duplicate credit!
if (pay.status === "approved") {
  Bot.sendMessage("⚠️ *Already Approved:* This payment was already approved on " + (pay.reviewed_at || "earlier") + ".");
  return;
}

if (pay.status === "rejected") {
  Bot.sendMessage("⚠️ *Already Rejected:* This payment was marked rejected earlier.");
  return;
}

// Mark Approved
payments[paymentIndex].status = "approved";
payments[paymentIndex].reviewed_at = new Date().toISOString();
Bot.setProperty("payment_requests", payments, "json");

let isVipOrder = (pay.type === "vip" || pay.order_type === "vip");

if (isVipOrder) {
  let days = pay.days || 30;
  if (days >= 9999) {
    Bot.setProperty("user_vip_lifetime_" + pay.user_id, true, "boolean");
  } else {
    let now = Date.now();
    let currentExpiry = Bot.getProperty("user_vip_until_" + pay.user_id) || now;
    let baseTime = Math.max(now, currentExpiry);
    let newExpiry = baseTime + (days * 24 * 60 * 60 * 1000);
    Bot.setProperty("user_vip_until_" + pay.user_id, newExpiry, "integer");
  }

  // Notify user of VIP activation
  try {
    let userNotice =
      "👑 *VIP Pass Activated!*\n\n" +
      "━━━━━━━━━━━━━━━━━━━━━\n" +
      "Your payment of *₹" + pay.amount + "* (Order ID: `" + pay.order_id + "`) has been verified and approved!\n\n" +
      "🌟 *Plan:* *" + (pay.pkg_name || "VIP Membership") + "*\n" +
      "✨ *Perks Unlocked:*\n" +
      "• Unlimited Video Streaming (0 points deducted)\n" +
      "• All force channel locks bypassed\n" +
      "• Priority streaming speed\n" +
      "━━━━━━━━━━━━━━━━━━━━━\n" +
      "Tap below to start watching videos now 👇";

    let userButtons = [
      [{ title: "🎬 Get Video", command: "/get_video" }],
      [{ title: "👑 VIP Status", command: "/vip" }]
    ];
    Bot.sendInlineKeyboardToChatWithId(pay.user_id, userButtons, userNotice);
  } catch (e) {}

  let adminButtons = [
    [{ title: "📋 View Pending Payments", command: "/admin_payments" }],
    [{ title: "🛠 Admin Dashboard", command: "/admin" }]
  ];

  Bot.sendInlineKeyboard(
    adminButtons,
    "✅ *VIP Payment Approved Successfully!*\n\n" +
    "🧾 Order ID: `" + pay.order_id + "`\n" +
    "👤 User ID: `" + pay.user_id + "`\n" +
    "💰 Amount: *₹" + pay.amount + "*\n" +
    "👑 VIP Plan: *" + (pay.pkg_name || "VIP Pass") + "* activated!"
  );
  return;
}

// Regular Points Credit to User
let currentPoints = Bot.getProperty("points_" + pay.user_id) || 0;
let newPoints = currentPoints + pay.points;
Bot.setProperty("points_" + pay.user_id, newPoints, "integer");

let totalDistributed = (Bot.getProperty("total_points_distributed") || 0) + pay.points;
Bot.setProperty("total_points_distributed", totalDistributed, "integer");

// Record transaction on user profile
let history = Bot.getProperty("user_history_" + pay.user_id) || [];
history.push({
  type: "earned",
  amount: pay.points,
  reason: "Purchased package ₹" + pay.amount,
  date: new Date().toISOString()
});
Bot.setProperty("user_history_" + pay.user_id, history, "json");

// Send instant notification to User
try {
  let userNotice =
    "🎉 *Payment Approved!*\n\n" +
    "━━━━━━━━━━━━━━━━━━━━━\n" +
    "Your payment of *₹" + pay.amount + "* (Order ID: `" + pay.order_id + "`) has been verified and approved by the Administrator!\n\n" +
    "🎁 *+" + pay.points + " Points Credited to your account!*\n" +
    "💎 *Your New Balance:* *" + newPoints + " Points*\n" +
    "━━━━━━━━━━━━━━━━━━━━━\n" +
    "Tap below to browse and stream videos now 👇";

  let userButtons = [
    [{ title: "🎬 Get Video", command: "/get_video" }],
    [{ title: "💰 My Points", command: "/my_points" }]
  ];
  Bot.sendInlineKeyboardToChatWithId(pay.user_id, userButtons, userNotice);
} catch (e) {}

let adminButtons = [
  [{ title: "📋 View Pending Payments", command: "/admin_payments" }],
  [{ title: "🛠 Admin Dashboard", command: "/admin" }]
];

Bot.sendInlineKeyboard(
  adminButtons,
  "✅ *Payment Approved Successfully!*\n\n" +
  "🧾 Order ID: `" + pay.order_id + "`\n" +
  "👤 User ID: `" + pay.user_id + "`\n" +
  "💰 Amount: *₹" + pay.amount + "*\n" +
  "🎁 Points Credited: *" + pay.points + " Points*\n" +
  "💎 User New Total: *" + newPoints + " Points*"
);
