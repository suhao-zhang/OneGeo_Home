/**
 * 生成 llms.txt —— 面向大模型的站点说明文件（https://llms.txt 提案，llmstxt.org）。
 *
 * OneGeo 卖的就是 GEO，这个文件本身就是自家方法的落地：给 AI 抓取器一份结构化的
 * 站点说明与要点摘要，比让它从 HTML 模板噪声里猜要准得多。robots.txt 里已明确放行
 * GPTBot / OAI-SearchBot / ClaudeBot / Claude-SearchBot / PerplexityBot / Bytespider 等。
 *
 * 从洹拓站同名脚本搬来，业务清单与关键页面全部改写为 OneGeo 口径；
 * 地址、电话等取自主题配置 contact 节点，不在这里重复维护。
 */
'use strict';

hexo.extend.generator.register('llms', function (locals) {
  const origin = (this.config.url || '').replace(/\/+$/, '');
  const contact = (this.theme && this.theme.config && this.theme.config.contact) || {};
  const posts = locals.posts.sort('-date').toArray().slice(0, 40);

  const line = [];
  line.push('# ' + (this.config.title || '') + ' · GEO 生成式引擎优化');
  line.push('');
  line.push('> ' + (this.config.description || ''));
  line.push('');
  line.push('主体：新乡洹拓科技有限公司（OneGeo 为旗下项目）');
  if (contact.address) line.push('地址：' + contact.address);
  if (contact.phone) line.push('电话：' + contact.phone);
  if (contact.hours) line.push('服务时间：' + contact.hours);
  line.push('');
  line.push('## OneGeo 做什么');
  line.push('');
  line.push('- 实体一致性：公司名、产品名、术语在站内站外保持同一写法，避免模型把你识别成多个主体');
  line.push('- 内容结构化：把「是什么、解决什么问题、与替代方案的区别、价格模式、常见问题」写成可抽取段落，配合 Schema.org 标记');
  line.push('- 抓取可达性：robots.txt 明确放行 AI 抓取器、提供 sitemap 与 llms.txt、正文不依赖 JS 才出现');
  line.push('- 信源布局：在被模型高频引用的位置留下口径一致的真实内容');
  line.push('- 持续监测：用一组固定问题定期询问主流模型，记录是否被提到、描述是否准确');
  line.push('');
  line.push('## 衡量口径');
  line.push('');
  line.push('- 被引用次数：固定问题集下，本站作为来源被引用的次数');
  line.push('- 被描述准确率：模型对品牌与产品的描述是否与事实一致');
  line.push('- 来源分布：引用来自站内页面还是第三方信源');
  line.push('- 明确不承诺：搜索排名、被某个模型引用、具体提升百分比');
  line.push('');
  line.push('## 关键页面');
  line.push('');
  [
    ['关于 OneGeo', '/about/', '项目定位、与新乡洹拓科技有限公司的关系、能做什么与不承诺什么'],
    ['GEO 服务', '/services/', '五步方法、交付物清单、验收口径与四个常见坑'],
    ['研究动态', '/news/', 'GEO 方法与 AI 抓取的实操记录'],
    ['联系我们', '/contact/', '地址、电话、合作方式与沟通前建议准备的信息']
  ].forEach(function (p) {
    line.push('- [' + p[0] + '](' + origin + p[1] + '): ' + p[2]);
  });
  line.push('');
  line.push('## 近期文章');
  line.push('');
  posts.forEach(function (post) {
    const desc = String(post.excerpt || post.description || '')
      .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);
    line.push('- [' + post.title + '](' + origin + '/' + post.path + ')' + (desc ? ': ' + desc : ''));
  });
  line.push('');

  return { path: 'llms.txt', data: line.join('\n') };
});
