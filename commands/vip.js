/*CMD
command: /vip
help: VIP Premium membership dashboard and passes
need_reply: false
auto_retry_time: 
folder: 
answer: 
keyboard: 
aliases: /premium, /vippass
group: 
CMD*/

let now = Date.now();
let isLifetime = User.getProperty("vip_lifetime") || false;
let vipUntil = User.getProperty("vip_until") || 0;
let isVip = isLifetime || (vipUntil > now);

let statusBlock = "";
if (isLifetime) {
  statusBlock =
    "👑 *VIP Status:* *Active (Lifetime VIP Member)* ⭐\n" +
    "✨ _Enjoy unlimited streaming and zero channel restrictions forever!_";
} else if (isVip) {
  let remainingMs = vipUntil - now;
  let remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
  let expiryDate = new Date(vipUntil).toISOString().split("T")[0];
  statusBlock =
    "👑 *VIP Status:* *Active ⭐*\n" +
    "📅 *Valid Until:* `" + expiryDate + "` (*" + remainingDays + " days remaining*)\n" +
    "✨ _Enjoy unlimited video streaming with 0 points deducted!_";
} else {
  statusBlock =
    "⚪ *VIP Status:* *Regular Member*\n" +
    "Upgrade to VIP for unlimited videos and ad-free experience!";
}

let vipPerks =
  "💎 *Exclusive VIP Membership Perks:*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "• 🎬 *Unlimited Streaming:* Watch all videos with *0 Points* deducted!\n" +
  "• 🔓 *Zero Channel Locks:* Skip all force channel requirements.\n" +
  "• ⚡ *High-Speed Priority:* Instant video access without queues.\n" +
  "• 👑 *VIP Crown Badge:* Golden badge on profile and leaderboard.\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "📌 *Choose a VIP Pass Package Below:*";

let packages = [
  { id: 1, name: "🌟 7 Days VIP Pass", price: 49, days: 7 },
  { id: 2, name: "🌟 30 Days VIP Pass", price: 149, days: 30 },
  { id: 3, name: "👑 Lifetime VIP Pass", price: 399, days: 9999 }
];

let buttons = [];
for (let p = 0; p < packages.length; p++) {
  let pkg = packages[p];
  buttons.push([{
    title: pkg.name + " — ₹" + pkg.price,
    command: "/buy_vip " + pkg.id,
    style: "primary"
  }]);
}

buttons.push([
  { title: "💳 Buy Points Instead", command: "/buy_points", style: "primary" },
  { title: "🏠 Main Menu", command: "/start", style: "primary" }
]);

let fullText =
  "👑 *VIP Premium Club*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  statusBlock + "\n\n" +
  vipPerks;

Bot.sendInlineKeyboard(buttons, fullText);
