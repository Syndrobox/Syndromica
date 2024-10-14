import SyndromicaMarkdown from 'syndromica-markdown/withMentions';

export default function renderWithMentions (text, user) {
  if (!text) return null;
  const env = { userName: user.auth.local.username, displayName: user.profile.name };
  return SyndromicaMarkdown.render(String(text), env);
}
