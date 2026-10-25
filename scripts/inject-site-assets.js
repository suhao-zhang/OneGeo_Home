/**
 * 把站点自定义的 css/js 注入到每个页面。
 *
 * 为什么不用改主题：主题没有 head_end / body_end 之类的插槽，改 themes/ 下的
 * head.ejs 会在升级主题时被覆盖。用 after_render:html 在最终 HTML 上补标签，
 * 主题文件一行都不用动。
 *
 * 与洹拓站那份的差异：洹拓开了 relative_link: true，所以要按页面深度算 ../ 前缀；
 * OneGeo 用绝对路径（relative_link: false + 配置了 url），这里直接拿 config.root 拼，
 * 层级深浅都不影响。文件不存在就不注入标签，免得留一个 404 请求。
 */
'use strict';

const fs = require('fs');
const path = require('path');

hexo.extend.filter.register('after_render:html', function (str, data) {
  if (typeof str !== 'string') return str;

  const root = hexo.config.root || '/';
  let out = str;

  // 站点自定义样式：source/css/site.css
  const cssExists = fs.existsSync(path.join(hexo.base_dir, 'source/css/site.css'));
  if (cssExists && out.indexOf('css/site.css') === -1 && out.indexOf('</head>') !== -1) {
    out = out.replace('</head>',
      '  <link rel="stylesheet" href="' + root + 'css/site.css">\n</head>');
  }

  // 站点自定义脚本：source/js/site.js（现在还没有这个文件，加了就自动生效）
  const jsExists = fs.existsSync(path.join(hexo.base_dir, 'source/js/site.js'));
  if (jsExists && out.indexOf('js/site.js') === -1 && /<\/body>/i.test(out)) {
    out = out.replace(/<\/body>/i,
      '  <script src="' + root + 'js/site.js" defer></script>\n</body>');
  }

  return out;
});
