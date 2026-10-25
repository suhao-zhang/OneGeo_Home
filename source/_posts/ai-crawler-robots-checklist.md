---
title: AI 爬虫可达性自查：robots.txt 里该放行哪些 User-agent
date: 2026-10-26 00:30:00
categories: [GEO 方法]
tags: [robots.txt, AI 爬虫, 抓取可达性]
cover: /images/deliver-actions.svg
description: GPTBot、OAI-SearchBot、ChatGPT-User、ClaudeBot、PerplexityBot、Google-Extended、Bytespider 分别是什么用途、挡掉会失去什么，附四步自查方法与本站 robots.txt 写法。
excerpt: GEO 的第一步不是写内容，是确认模型根本抓得到你。本文按"训练 / 检索 / 用户取页"三类拆开主流 AI 爬虫的用途与放行策略，给出四步自查方法与一个常见误判：改 User-Agent 的 curl 测试通过，不代表真实爬虫能进来。
---

## 先分清三类爬虫

同一家公司往往不止一只爬虫，用途完全不同，挡错的代价也不一样。

| User-agent | 归属 | 类型 | 挡掉会失去什么 |
| --- | --- | --- | --- |
| `OAI-SearchBot` | OpenAI | 检索 | 不出现在 ChatGPT 的搜索答案里 |
| `GPTBot` | OpenAI | 训练 | 内容不进训练集；对当下的引用影响有限 |
| `ChatGPT-User` | OpenAI | 用户取页 | 用户在对话里点名你的页面时取不到内容 |
| `Claude-SearchBot` | Anthropic | 检索 | Claude 检索时的可见性下降 |
| `ClaudeBot` | Anthropic | 训练 | 内容不进 Claude 训练集 |
| `Claude-User` | Anthropic | 用户取页 | 用户点名访问时取不到内容 |
| `PerplexityBot` | Perplexity | 检索 | 答案卡片里不再出现你的链接 |
| `Perplexity-User` | Perplexity | 用户取页 | 用户实时读取时取不到内容 |
| `Bytespider` | 字节跳动 | 训练 + 检索 | 豆包侧的可见性与语料覆盖 |
| `CCBot` | Common Crawl | 训练语料 | 大量开源模型的共同语料来源 |
| `Google-Extended` | Google | 用途控制项 | 见下方说明，它不是独立爬虫 |

两个容易写错的地方：

- **`Google-Extended` 是用途控制项，不是独立爬虫**。它控制的是"被抓到的内容能否用于 Gemini 训练"，服务器日志里通常不会出现这个名字。想影响 Google 的 AI 概览，实际起作用的是 Googlebot 与 GoogleOther。
- **训练爬虫与检索爬虫要分开决策**。允许被引用而不允许被训练，是一种常见且合理的策略：放行 `OAI-SearchBot`、`Claude-SearchBot`，对 `GPTBot`、`ClaudeBot` 另做选择。

## 四步自查

**第一步：读自己的规则。** 打开 `https://你的域名/robots.txt`，确认没有一条 `Disallow: /` 命中上面这些名字。很多站是被上一版模板或 SEO 插件顺手挡掉的。

**第二步：用对应 UA 请求关键页面。**

```bash
curl -I -A "OAI-SearchBot" https://example.com/services/
curl -I -A "PerplexityBot" https://example.com/
```

看返回码：`200` 正常；`301/308` 要确认跳转后的地址同样可达；`403` 大概率是 WAF 或 CDN 规则；`429` 是限流，爬虫拿不到完整内容；`5xx` 服务端问题。

**第三步：看真实日志。** 统计谁真的来过，比猜更准：

```bash
grep -oE "GPTBot|OAI-SearchBot|ChatGPT-User|ClaudeBot|Claude-SearchBot|PerplexityBot|Bytespider|CCBot" \
  /var/log/nginx/access.log | sort | uniq -c | sort -rn
```

**第四步：核对 IP 与 CDN 设置。** 改 User-Agent 的 curl 测试**不能证明真实爬虫可以访问**——UA 是客户端自报的，而 CDN/WAF 按源 IP 过滤。各家会公布爬虫的 IP 范围（OpenAI 提供 `gptbot.json`、`searchbot.json`、`chatgpt-user.json` 三个清单），在 CDN 侧按这些网段放行，比改规则更可靠。

## 改完多久生效

各家节奏不同。OpenAI 的说明里提到调整 `OAI-SearchBot` 相关规则后，系统可能需要约 24 小时才反映出来。所以改完不要立刻用"有没有被引用"来判断成败，至少留一个观察周期，并用固定问题集回测。

## 本站的做法

OneGeo 自己的 [robots.txt](/robots.txt) 明确放行上面这些抓取器，并指向 `sitemap.xml`。理由很直接：GEO 的前提是模型能抓到并读懂内容，先把门打开，再谈内容质量。

一个补充：`ChatGPT-User` 这类用户触发取页是否严格遵循 robots.txt，公开资料的说法有过变化。**不要把它当成访问控制的兜底**——真正敏感的内容应该靠鉴权与不可猜测的 URL 保护，而不是靠一条 robots 规则。
