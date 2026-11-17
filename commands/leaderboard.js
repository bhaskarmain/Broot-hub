/*CMD
command: /leaderboard
help: Top referrers and points leaderboard with personal rank
need_reply: false
auto_retry_time: 
folder: 
answer: 
keyboard: 
aliases: /top, /ranks
group: 
CMD*/

let allUsers = Bot.getProperty("all_users_list") || [];
let myId = user.telegramid;

// Compile leaderboard data
let leaderboard = [];
for (let i = 0; i < allUsers.length; i++) {
  let u = allUsers[i];
  let refs = Bot.getProperty("ref_count_" + u.id) || 0;
  let points = Bot.getProperty("points_" + u.id) || 0;
  leaderboard.push({
    id: u.id,
    name: u.name || "Member",
    username: u.username || "",
    refs: refs,
    points: points
  });
}

// Sort descending by referrals, then points
leaderboard.sort(function(a, b) {
  if (b.refs !== a.refs) {
    return b.refs - a.refs;
  }
  return b.points - a.points;
});

// Find current user's rank
let myRank = "Unranked";
let myRefs = Bot.getProperty("ref_count_" + myId) || 0;
let myPoints = Bot.getProperty("points_" + myId) || User.getProperty("points") || 0;

for (let r = 0; r < leaderboard.length; r++) {
  if (leaderboard[r].id == myId) {
    myRank = "#" + (r + 1);
    break;
  }
}

// Medals for top positions
let medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
let topLines = [];
let topLimit = Math.min(leaderboard.length, 10);

if (topLimit === 0) {
  topLines.push("_No participants yet. Be the first to invite friends!_");
} else {
  for (let i = 0; i < topLimit; i++) {
    let entry = leaderboard[i];
    let icon = medals[i] || (i + 1) + ".";
    let displayName = entry.name;
    if (entry.username) {
      displayName = "@" + entry.username;
    }
    topLines.push(
      icon + " *" + displayName + "* — *" + entry.refs + " Referrals* (" + entry.points + " pts)"
    );
  }
}

let text =
  "🏆 *Top Referrers & Community Leaderboard*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  topLines.join("\n") + "\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "👤 *Your Performance:*\n" +
  "• Rank: *" + myRank + "* of *" + allUsers.length + " members*\n" +
  "• Referrals: *" + myRefs + " Invited*\n" +
  "• Points Balance: *" + myPoints + " Points*\n" +
  "━━━━━━━━━━━━━━━━━━━━━\n" +
  "💡 _Invite more friends to climb the leaderboard and unlock unlimited video access!_";

let buttons = [
  [
    { title: "🎁 Refer & Earn", command: "/referral", style: "primary" },
    { title: "🔄 Refresh", command: "/leaderboard", style: "primary" }
  ],
  [{ title: "🏠 Main Menu", command: "/start", style: "primary" }]
];

Bot.sendInlineKeyboard(buttons, text);
