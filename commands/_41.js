/*CMD
command: /41
help: Bot Clone / Transfer to Bots.Business Account
need_reply: false
auto_retry_time: 
folder: 
answer: 
keyboard: 
aliases: 41
group: 
CMD*/

if (!user) return;

var ADMIN_ID = Bot.getProperty("admin_id") || 9250034188;
var CHANNEL = Bot.getProperty("official_channel") || "";

function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Get email from params, options, or message
var email = (options && options.email) ? options.email : (params ? params.trim().toLowerCase() : "");

if (!email && message) {
  var mTxt = message.trim();
  if (mTxt.indexOf("/41") === 0 || mTxt.indexOf("41") === 0) {
    email = mTxt.replace(/^\/?41\s*/i, "").trim().toLowerCase();
  } else if (mTxt.includes("@") && mTxt.includes(".")) {
    email = mTxt.toLowerCase();
  }
}

// ===== EMAIL VALIDATION =====
if (!email || !email.includes("@") || !email.includes(".")) {
  Bot.setProperty("waiting_clone_email_" + user.telegramid, true, "boolean");
  Bot.sendMessage(
    '❌ <b>Invalid Email Address!</b>\n\n' +
    '📧 <b>Example:</b> <code>/41 user@gmail.com</code>\n\n' +
    '👉 <i>Please send your Bots.Business registered email address:</i>',
    {
      parse_mode: "HTML"
    }
  );
  return;
}

// Clear waiting state
Bot.setProperty("waiting_clone_email_" + user.telegramid, false, "boolean");

// ===== INSTALL BOT =====
try {
  BBAdmin.installBot({
    bot_id: bot.id,
    email: email
  });
} catch (err) {}

// User details
var rawName = user.first_name ? user.first_name : (user.username ? "@" + user.username : "User");
var userName = escapeHtml(rawName);
var userHandle = user.username ? ("@" + escapeHtml(user.username)) : "No username";
var uDirectUrl = user.username ? ("https://t.me/" + user.username) : ("tg://user?id=" + user.telegramid);
var now = new Date();
var dateStr = now.toISOString().replace("T", " ").slice(0, 19);

// ===== SUCCESS MESSAGE =====
var channelSection = CHANNEL ? ('📢 <b>Official Channel:</b> ' + CHANNEL + '\n\n') : '';

Bot.sendMessage(
  '✅ <b>Bot Successfully Sent to Your Bots.Business Account!</b>\n\n' +
  '📩 <b>Registered Email:</b> <code>' + escapeHtml(email) + '</code>\n\n' +
  channelSection +
  '🚀 <b>Congratulations ' + userName + '! Your bot copy has been deployed.</b>',
  {
    parse_mode: "HTML"
  }
);

// ===== NOTIFY ADMIN =====
var adminNotice = "🤖 <b>BOT CLONE / TRANSFER REQUEST</b>\n" +
                  "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                  "👤 <b>Claimed By:</b> <a href=\"" + uDirectUrl + "\">" + userName + "</a> (" + userHandle + ")\n" +
                  "🆔 <b>Chat ID:</b> <code>" + user.telegramid + "</code>\n" +
                  "📧 <b>Bots.Business Email:</b> <code>" + escapeHtml(email) + "</code>\n" +
                  "⏰ <b>Claim Time:</b> <code>" + dateStr + "</code>\n" +
                  "━━━━━━━━━━━━━━━━━━━━━━";

try {
  Api.sendMessage({
    chat_id: ADMIN_ID,
    text: adminNotice,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "✉️ Direct Message User", url: uDirectUrl, style: "primary" }
      ]]
    }
  });
} catch (e) {}
