/**
 * Helpers for the reading view: word count, reading time and a flat table of
 * contents built from the rendered HTML (hexo-renderer-marked already gives
 * every heading an id, so we only have to read them back out).
 */

var rBlockTag = /<(script|style)[\s\S]*?<\/\1>/gi;
var rTag = /<[^>]+>/g;
var rEntity = /&(?:#\d+|#x[0-9a-f]+|[a-z]+);/gi;
var rCJK = /[㐀-龿぀-ヿ]/g;
var rHeading = /<h([23])\s[^>]*id="([^"]*)"[^>]*>([\s\S]*?)<\/h\1>/gi;

function toText(html) {
  return String(html || '')
    .replace(rBlockTag, ' ')
    .replace(rTag, ' ')
    .replace(rEntity, ' ');
}

function countWords(content) {
  var text = toText(content).trim();
  if (!text) return 0;

  var cjk = text.match(rCJK);
  var latin = text.replace(rCJK, ' ').match(/\S+/g);

  return (cjk ? cjk.length : 0) + (latin ? latin.length : 0);
}

hexo.extend.helper.register('word_count', countWords);

hexo.extend.helper.register('reading_time', function (content) {
  var perMinute = Number(this.theme.words_per_minute) || 200;
  return Math.max(1, Math.round(countWords(content) / perMinute));
});

// "2900" -> "2 900" (thin space), matching the design's figure style.
hexo.extend.helper.register('group_digits', function (value) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
});

// The <!-- more --> excerpt when the post has one, otherwise the opening of
// the body trimmed to a whole word.
hexo.extend.helper.register('post_summary', function (post, length) {
  var limit = length || 220;
  var source = post.description || post.excerpt || post.content;
  var text = toText(source).replace(/\s+/g, ' ').trim();

  if (text.length <= limit) return text;

  var clipped = text.slice(0, limit);
  var lastSpace = clipped.lastIndexOf(' ');

  return (lastSpace > limit * 0.6 ? clipped.slice(0, lastSpace) : clipped) + '…';
});

hexo.extend.helper.register('article_toc', function (content) {
  var entries = [];
  var html = String(content || '');
  var match;

  rHeading.lastIndex = 0;
  while ((match = rHeading.exec(html)) !== null) {
    var text = toText(match[3]).replace(/\s+/g, ' ').trim();
    if (!text || !match[2]) continue;

    entries.push({
      level: Number(match[1]),
      id: match[2],
      text: text
    });
  }

  return entries;
});
