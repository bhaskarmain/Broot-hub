/*CMD
command: /buy_vip
help: Generates Dynamic UPI QR Code for VIP Pass
need_reply: false
auto_retry_time: 
folder: 
answer: 
keyboard: 
aliases: 
group: 
CMD*/

let pkgId = parseInt(params);
if (!pkgId) {
  Bot.runCommand("/vip");
  return;
}

let packages = [
  { id: 1, name: "7 Days VIP Pass", price: 49, days: 7 },
  { id: 2, name: "30 Days VIP Pass", price: 149, days: 30 },
  { id: 3, name: "Lifetime VIP Pass", price: 399, days: 9999 }
];

let selectedPkg = null;
for (let i = 0; i < packages.length; i++) {
  if (packages[i].id === pkgId) {
    selectedPkg = packages[i];
    break;
  }
}

if (!selectedPkg) {
  Bot.sendMessage("⚠️ Invalid VIP package selected.");
  Bot.runCommand("/vip");
  return;
}

let adminUpi = Bot.getProperty("admin_upi_id") || "paytmqr2810050501011@paytm";
let adminPayee = Bot.getProperty("admin_payee_name") || "Video Bot";

let orderId = "VIP-" + user.telegramid + "-" + Date.now().toString().slice(-5);

// Build standard UPI URI
let upiUri =
  "upi://pay?pa=" +
  encodeURIComponent(adminUpi) +
  "&pn=" +
  encodeURIComponent(adminPayee) +
  "&am=" +
  encodeURIComponent(selectedPkg.price.toFixed(2)) +
  "&cu=INR&tn=" +
  encodeURIComponent("VIP Order " + orderId);

// Dynamic QR code API
let qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=" + encodeURIComponent(upiUri);

// Save active order state
User.setProperty("active_order", {
  order_id: orderId,
  type: "vip",
  pkg_name: selectedPkg.name,
  amount: selectedPkg.price,
  days: selectedPkg.days,
  points: 0,
  upi_id: adminUpi,
  created_at: new Date().toISOString()
}, "json");
User.setProperty("awaiting_payment_screenshot", false, "boolean");

let caption =
  "👑 *VIP Pass — UPI Payment QR Code*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "🌟 *Plan:* *" + selectedPkg.name + "*\n" +
  "💰 *Total Amount:* *₹" + selectedPkg.price + "*\n" +
  "🧾 *Order ID:* `" + orderId + "`\n" +
  "📱 *UPI ID:* `" + adminUpi + "`\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "📌 *Instructions:*\n" +
  "1. Scan the QR code above using **GPay, PhonePe, Paytm, or BHIM**.\n" +
  "2. Complete the payment of *₹" + selectedPkg.price + "*.\n" +
  "3. Tap *I Have Paid* below and send your payment screenshot!";

let buttons = [
  [{ title: "✅ I Have Paid", command: "/i_have_paid", style: "primary" }],
  [
    { title: "❌ Cancel Payment", command: "/cancel_payment", style: "primary" },
    { title: "🔙 Back to VIP", command: "/vip", style: "primary" }
  ]
];

try {
  Api.sendPhoto({
    chat_id: chat.chatid,
    photo: qrUrl,
    caption: caption,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "✅ I Have Paid", callback_data: "/i_have_paid", style: "primary" }],
        [
          { text: "❌ Cancel Payment", callback_data: "/cancel_payment", style: "primary" },
          { text: "🔙 Back to VIP", callback_data: "/vip", style: "primary" }
        ]
      ]
    }
  });
} catch (e) {
  Bot.sendInlineKeyboard(buttons, caption);
}
