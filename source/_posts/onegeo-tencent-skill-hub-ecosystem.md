---
title: OneGeo 看 Agent Skill 生态：8 万技能上架，哪些能被 AI 引用
date: 2026-10-27 15:50:00
categories: [行业动态, GEO 方法]
tags: [结构化, WebMCP, 抓取可达性, AI Agent]
cover: /images/posts/agent-skill-ecosystem.svg
description: 腾讯云 SkillHub 半年聚合近 8 万 Agent 技能，TeamAI 开源支持跨 Agent 共享 Skill。从 GEO 视角看，Skill 生态的繁荣意味着 AI 可调用的能力在爆发——但前提是这些 Skill 的描述文档能被模型抓取和理解。
excerpt: 腾讯云 Agent Skill 开放平台 SkillHub 在半年内聚合了近 8 万条技能，同时腾讯云开源了内部自用的 TeamAI 工具支持跨 Agent 共享 Skill。Skill 生态在爆发。但从 GEO 视角看，一个 Skill 能不能被 AI 调用，取决于它的描述文档能不能被模型抓取和理解。
---

## 两条消息

腾讯云开发者社区近期发了两条关于 Agent Skill 生态的消息：

1. [《Agent Skill 开放平台生态现状：腾讯云 SkillHub 半年聚合近 8 万技能》](https://cloud.tencent.com/developer/article/2767100)（2026-10-26）——国内 Agent Skill 生态正从开发者社区转向大厂商业入口竞争

2. [《腾讯云开源内部自用 TeamAI 工具：支持跨 Agent 共享 Skill》](https://cloud.tencent.com/developer/article/2766800)（2026-10-11）——团队级 Agent 工作台开源，Skill 沉淀与复用成为团队基础设施

8 万条技能，这个数字很惊人。但更值得追问的是：**这 8 万条技能里，有多少能被 AI 引擎直接发现和调用？**

## Skill 的 GEO 问题

一个 Agent Skill 要被 AI 使用，需要满足几个条件：

| 层级 | 要求 | GEO 对应 |
| --- | --- | --- |
| 描述层 | Skill 的功能描述清晰、结构化 | 类似官网内容的结构化 |
| 接口层 | 有标准的 API 描述（OpenAPI/MCP） | 类似 llms.txt 的机器可读性 |
| 可达层 | 描述文档能被 AI 爬虫抓取 | 类似 robots.txt 放行 |
| 信任层 | 有来源认证和质量评级 | 类似信源可信度评估 |

我们在[WebMCP](/onegeo-webmcp-page-callable/)那篇里讨论过"页面要能被 AI 直接调用"——MCP（Model Context Protocol）正在成为 AI Agent 调用外部工具的标准协议。SkillHub 里的 8 万条技能，如果都提供了 MCP 兼容的接口描述，理论上就能被任何支持 MCP 的 AI Agent 发现和调用。

但现实是：大多数 Skill 的描述还停留在"人类可读的文档"阶段——Markdown README、博客文章、甚至 PPT。这些对人类够用，但对 AI 来说信息密度太低、结构不够清晰。

## 从 SEO 到 GEO 的类比

Skill 生态的这个问题，跟传统 SEO 面临的问题高度相似：

- **SEO 时代**：网页要能被搜索引擎抓取和索引 → 需要 sitemap、结构化数据、语义化 HTML
- **GEO 时代**：Skill 要能被 AI Agent 发现和调用 → 需要 MCP 描述、标准化接口、机器可读文档

区别在于：SEO 的标准化花了 20 多年（从 robots.txt 到 schema.org 到 Core Web Vitals），而 GEO / Agent Skill 的标准化正在以月为单位推进。MCP 协议从提出到被各大厂商采纳，只用了不到一年。

## TeamAI 的启示

腾讯云开源的 TeamAI 工具提出了一个有意思的概念：**跨 Agent 共享 Skill**。

这意味着一个 Skill 不需要绑定在某个特定的 Agent 平台上——它可以被不同的 Agent 框架调用，只要接口描述是标准化的。这跟 GEO 的理念一致：**内容不应该绑定在某个特定的搜索引擎上，而应该让所有 AI 引擎都能抓取和引用。**

对 Skill 开发者来说，这提出了一个实操要求：**你的 Skill 描述文档，应该同时面向人类和 AI 来写。**

- 人类需要：使用场景说明、示例代码、效果截图
- AI 需要：功能描述（一句话）、输入参数（类型 + 约束）、输出格式（类型 + 示例）、调用方式（API endpoint / MCP tool name）

两者不矛盾——一个好的 Skill 文档应该同时满足两种读者。

## OneGeo 怎么做

我们在做内容结构化时，对"能力描述类"内容有一套检查清单。这套清单同样适用于 Agent Skill 的描述文档：

1. **一句话功能描述**——能不能让模型在 5 秒内判断"这个 Skill 能做什么"？
2. **输入输出示例**——有没有 Given/When/Then 格式的调用示例？
3. **版本号和质量评级**——模型怎么判断这个 Skill 是最新的、可靠的？
4. **可抓取性**——描述文档是在公开网页上，还是在需要登录的平台里？

## 来源

- 腾讯云开发者社区 · [Agent Skill 开放平台生态现状：SkillHub 半年聚合近 8 万技能](https://cloud.tencent.com/developer/article/2767100)（2026-10-26）
- 腾讯云开发者社区 · [腾讯云开源内部自用 TeamAI 工具：支持跨 Agent 共享 Skill](https://cloud.tencent.com/developer/article/2766800)（2026-10-11）
- OneGeo 研究 · [看 WebMCP：页面要能被 AI 直接调用](/onegeo-webmcp-page-callable/)（2026-10-25）
