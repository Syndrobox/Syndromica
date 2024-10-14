import SyndromicaMarkdown from 'syndromica-markdown';

export default function markdown (el, { value, oldValue }) {
  if (value === oldValue) return;

  if (value) {
    el.innerHTML = SyndromicaMarkdown.render(String(value));
  } else {
    el.innerHTML = '';
  }

  el.classList.add('markdown');
}
