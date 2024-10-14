db.users.update(
  {},
  { $inc: { 'achievements.SyndromicaDays': 1 } },
  { multi: 1 },
);
