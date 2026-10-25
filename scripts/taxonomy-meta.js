/**
 * 标签页 / 分类页 / 归档页的 title 与 description 生成。
 *
 * 问题：主题的 head.ejs 用 `page.title ? page.title + ' | ' + config.title : config.title`，
 * 而 Hexo 给 tag/category/archive 这类由 generator 出的虚拟页并不设置 title，
 * 于是 /tags/llms-txt/ 的 <title> 只剩站点名，description 也全部回退到站点级那一句。
 * 全站十几页共用同一句描述，是 SEO 检测里比长度更严重的问题。
 *
 * 做法：在 after_render:html 阶段按路由识别这三类页面，用它们自己的主题名与篇数
 * 生成标题与描述（描述里带上该主题下真实的文章标题，不编数字、不加套话）。
 * 与 scripts/robots-meta.js 一样走 after_render，不改主题文件。
 */
'use strict';

function postsOf(hexo) {
  try { return hexo.locals.get('posts').toArray(); } catch (e) { return []; }
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function clip(s, n) {
  s = String(s || '');
  return s.length > n ? s.slice(0, n) + '…' : s;
}

// 从 route path 解析出类型与名称；返回 null 表示不是这三类页面
function parseRoute(routePath) {
  const p = routePath.replace(/index\.html$/, '');
  let m;
  if ((m = p.match(/^tags\/(.+)\/$/))) return { kind: 'tag', name: decodeURIComponent(m[1]) };
  if ((m = p.match(/^categories\/(.+)\/$/))) return { kind: 'category', name: decodeURIComponent(m[1]) };
  if (p === 'archives/') return { kind: 'archive', year: null, month: null };
  if ((m = p.match(/^archives\/(\d{4})(?:\/(\d{2}))?\/$/))) {
    return { kind: 'archive', year: m[1], month: m[2] || null };
  }
  return null;
}

function matchTerm(hexo, kind, fromRoute) {
  const col = kind === 'tag' ? 'tags' : 'categories';
  const list = (function () {
    try { return hexo.locals.get(col).toArray(); } catch (e) { return []; }
  })();
  // 路由里是 slug（"AI 爬虫" -> "AI-爬虫"、"llms.txt" -> "llms-txt"），
  // 所以 slug、name、path 三种写法都要比，否则带空格和点号的名字会漏掉。
  const norm = function (s) {
    return String(s || '').replace(/^\//, '').replace(/\/$/, '').toLowerCase();
  };
  const hit = list.find(function (t) {
    return norm(t.slug) === norm(fromRoute)
      || norm(t.name) === norm(fromRoute)
      || norm(t.path) === norm('' + fromRoute);
  });
  return hit || null;
}

function matchPosts(hexo, info) {
  const all = postsOf(hexo);
  if (info.kind === 'tag' || info.kind === 'category') {
    const term = matchTerm(hexo, info.kind, info.name);
    if (!term) return { posts: [], display: info.name };
    const col = info.kind === 'tag' ? 'tags' : 'categories';
    const posts = all.filter(function (post) {
      return post[col] && post[col].some(function (t) { return t._id === term._id; });
    });
    return { posts: posts, display: term.name };
  }
  const posts = all.filter(function (post) {
    if (info.year && Number(info.year) !== post.date.year()) return false;
    if (info.month && Number(info.month) !== post.date.month() + 1) return false;
    return true;
  });
  return { posts: posts, display: null };
}

hexo.extend.filter.register('after_render:html', function (str, data) {
  if (typeof str !== 'string') return str;
  const hexo = this;
  const routePath = String((data && data.path) || '');
  const info = parseRoute(routePath);
  if (!info) return str;

  const site = hexo.config.title || '';
  const matched = matchPosts(hexo, info);
  const posts = matched.posts.sort(function (a, b) { return b.date - a.date; });
  const n = posts.length;
  if (!n) return str;
  const display = matched.display || info.name;

  const titles = posts.slice(0, 3).map(function (p) { return clip(p.title, 24); });
  let title, desc;

  if (info.kind === 'tag') {
    title = '标签「' + display + '」· ' + n + ' 篇文章';
    desc = 'OneGeo 站内标记为「' + display + '」的文章共 ' + n + ' 篇'
      + '：' + titles.join('；') + (n > titles.length ? ' 等。' : '。');
  } else if (info.kind === 'category') {
    title = '分类「' + display + '」· ' + n + ' 篇文章';
    desc = '分类「' + display + '」下共 ' + n + ' 篇文章，按发布时间倒序排列'
      + '：' + titles.join('；') + (n > titles.length ? ' 等。' : '。');
  } else {
    const span = info.year
      ? (info.month ? info.year + ' 年 ' + Number(info.month) + ' 月' : info.year + ' 年')
      : null;
    title = span ? '文章归档 · ' + span + ' · 共 ' + n + ' 篇' : '全部文章归档 · 共 ' + n + ' 篇';
    desc = (span ? span + '的' : '站内') + '文章归档，共 ' + n + ' 篇'
      + '：' + titles.join('；') + (n > titles.length ? ' 等。' : '。');
  }

  // 只有 parseRoute 命中的三类页面才动，首页、自定义页与文章页的 title 保持原样
  const fullTitle = esc(title) + (site ? ' | ' + esc(site) : '');
  str = str.replace(/<title>[\s\S]*?<\/title>/, '<title>' + fullTitle + '</title>');
  const ogTitle = '<meta property="og:title" content="' + fullTitle + '">';
  if (/<meta property="og:title" content="[^"]*">/.test(str)) {
    str = str.replace(/<meta property="og:title" content="[^"]*">/, ogTitle);
  }
  const descEsc = esc(desc);
  if (/<meta name="description" content="[^"]*">/.test(str)) {
    str = str.replace(/<meta name="description" content="[^"]*">/,
      '<meta name="description" content="' + descEsc + '">');
  }
  if (/<meta property="og:description" content="[^"]*">/.test(str)) {
    str = str.replace(/<meta property="og:description" content="[^"]*">/,
      '<meta property="og:description" content="' + descEsc + '">');
  }
  return str;
});
