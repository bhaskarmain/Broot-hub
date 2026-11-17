/*CMD
command: /random_video
help: Deliver a surprise random video to the user
need_reply: false
auto_retry_time: 
folder: 
answer: 
keyboard: 
aliases: /random
group: 
CMD*/

let primaryAdmin = 9250034188;
let isAdmin = (user.telegramid == primaryAdmin || user.telegramid == String(primaryAdmin));

let channels = Bot.getProperty("force_channels") || [];
let activeChannels = [];
for (let i = 0; i < channels.length; i++) {
  if (channels[i].enabled !== false) activeChannels.push(channels[i]);
}

if (!isAdmin && activeChannels.length > 0) {
  User.setProperty("pending_video_request", true, "boolean");
  User.setProperty("pending_video_mode", "random", "string");
  Bot.runCommand("/verify_step 0");
  return;
}

Bot.runCommand("/deliver_video random");
