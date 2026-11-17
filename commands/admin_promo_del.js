/*CMD
command: /admin_promo_del
help: Delete a promotional gift code
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

let targetCode = params ? decodeURIComponent(params.toString().trim()).toUpperCase() : "";
if (!targetCode) {
  Bot.runCommand("/admin_promo");
  return;
}

let promoCodes = Bot.getProperty("promo_codes") || [];
let newCodes = [];
let found = false;

for (let i = 0; i < promoCodes.length; i++) {
  if (promoCodes[i].code.toUpperCase() === targetCode) {
    found = true;
  } else {
    newCodes.push(promoCodes[i]);
  }
}

if (found) {
  Bot.setProperty("promo_codes", newCodes, "json");
  Bot.sendMessage("🗑 Promo code *" + targetCode + "* has been deleted.");
} else {
  Bot.sendMessage("⚠️ Promo code *" + targetCode + "* not found.");
}

Bot.runCommand("/admin_promo");
