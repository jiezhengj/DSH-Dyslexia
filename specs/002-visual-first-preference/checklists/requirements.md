# Specification Quality Checklist: 视觉优先开关与「我有阅读障碍」命名

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-11-23
**Feature**: [spec.md](../spec.md)

## Content Quality

- [ ] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [ ] Feature meets measurable outcomes defined in Success Criteria
- [ ] No implementation details leak into specification

## Notes

- 三个已在 clarify 之前确定的选择（由读者当场回答）：默认档为"渲染 + 视觉优先"；力度为"只在图更省力时优先画"；8 语种标题全部改名、包名与入口 id 不变。
- FR-002（默认打开）与 Constitution 原则 I 的旧措辞（"能力与偏好分离"）冲突，已在 Assumptions 写明：原则 I 修订为"默认带偏好，但界面上可见可关"，Constitution 升 2.0.0。
- SC-001 的"至少 3/5"是模型行为指标，需要固定样板请求与离线判读口径，计划阶段须给出可重复的测法与"未取证"的登记方式。
- SC-005 的"1 秒"沿用 feature 001 对界面反馈的口径（无独立计时装置时以观察与夹具断言为准，缺口须登记）。
- SC-001（G7）、SC-008（G5）、SC-009（G3）尚无取证，因此 Feature Readiness 的"满足可度量结果"一项保持未勾。
- 关闭态提示词已与 feature 001 契约逐字比对（静态检查 `the capability briefing is what it was before the switch`），G9 关闭；探针已在 `0.2.5` 上重跑，G10 关闭。
- `spec.md:104-105`（FR-007/FR-008）刻意引用 `src/client/settings.js:86-87`、`injected.setValue`、`inject.readHostValue()` 与 `readPreference(face)`，把 pending/restore 规则写成可核对的条件；因此「No implementation details」两条不勾。
