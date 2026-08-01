# ATTRIBUTIONS

Список компонентов, заимствованных и адаптированных из open-source репозитория ECC для TT3Dato.

## Источник и лицензия

- **Источник:** https://github.com/affaan-m/ECC
- **Лицензия:** MIT
- **Политика адаптации:** заимствуются только файлы методологии (Markdown); библиотеки, npm-пакеты и харнесс-код ECC НЕ устанавливаются (Конституция, разделы 2, 4, 10).

## Правила (Skills/rules/) — 6 файлов

Адаптированы из `rules/common/` репозитория ECC:

| Файл в TT3Dato | Исходник ECC |
|---|---|
| `Skills/rules/agents.md` | `rules/common/agents.md` |
| `Skills/rules/code-review.md` | `rules/common/code-review.md` |
| `Skills/rules/coding-style.md` | `rules/common/coding-style.md` |
| `Skills/rules/development-workflow.md` | `rules/common/development-workflow.md` |
| `Skills/rules/git-workflow.md` | `rules/common/git-workflow.md` |
| `Skills/rules/hooks.md` | `rules/common/hooks.md` |

## Memory Vault — 2 файла

Адаптированы из skill `unified-memory` (формат `ecc.memory.v1`):

| Файл в TT3Dato | Источник |
|---|---|
| `Memory/README.md` | ECC unified-memory (стандарт памяти `ecc.memory.v1`) |
| `Memory/templates/memory-entry.md` | ECC unified-memory (шаблон записи) |

## Evidence Trail — 2 файла

Адаптированы из цикла ECC `plan -> test -> implement -> review -> verify -> remember -> improve` и концепции hooks:

| Файл в TT3Dato | Источник |
|---|---|
| `Logs/README.md` | ECC evidence trail (процессные следы) |
| `Tests/README.md` | ECC hooks-концепция (детерминированные проверки вне контекста модели) |

## Security Checklist — 1 файл

Адаптирован из методологии AgentShield (5 категорий: secrets detection, permission auditing, hook injection analysis, MCP server risk profiling, agent config review):

| Файл в TT3Dato | Источник |
|---|---|
| `Docs/Audits/Agent_Config_Security_Checklist.md` | ECC AgentShield (методология, локальная defensive-версия) |

## Skills (Skills/<name>/SKILL.md) — 12 файлов

Адаптированы из `skills/<name>/SKILL.md` репозитория ECC:

| Файл в TT3Dato | Исходник ECC |
|---|---|
| `Skills/tdd-workflow/SKILL.md` | `skills/tdd-workflow/SKILL.md` |
| `Skills/deep-research/SKILL.md` | `skills/deep-research/SKILL.md` |
| `Skills/security-review/SKILL.md` | `skills/security-review/SKILL.md` |
| `Skills/context-budget/SKILL.md` | `skills/context-budget/SKILL.md` |
| `Skills/unified-memory/SKILL.md` | `skills/unified-memory/SKILL.md` |
| `Skills/search-first/SKILL.md` | `skills/search-first/SKILL.md` |
| `Skills/cost-aware-llm-pipeline/SKILL.md` | `skills/cost-aware-llm-pipeline/SKILL.md` |
| `Skills/documentation-lookup/SKILL.md` | `skills/documentation-lookup/SKILL.md` |
| `Skills/agent-eval/SKILL.md` | `skills/agent-eval/SKILL.md` |
| `Skills/market-research/SKILL.md` | `skills/market-research/SKILL.md` |
| `Skills/parallel-execution-optimizer/SKILL.md` | `skills/parallel-execution-optimizer/SKILL.md` |
| `Skills/agent-harness-construction/SKILL.md` | `skills/agent-harness-construction/SKILL.md` |

## Agents (Agents/<Name>/) — 7 агентов

Адаптированы из `agents/<name>.md` репозитория ECC:

| Агент TT3Dato | Исходник ECC | Роль в TT3Dato |
|---|---|---|
| `Agents/CodeReviewer/` | `agents/code-reviewer.md` | Critic / критический анализ |
| `Agents/Planner/` | `agents/planner.md` | Планирование задач и решений |
| `Agents/CodeExplorer/` | `agents/code-explorer.md` | Repository Analyst |
| `Agents/DocUpdater/` | `agents/doc-updater.md` | Documentation Manager |
| `Agents/ChiefOfStaff/` | `agents/chief-of-staff.md` | Координация агентов |
| `Agents/AgentEvaluator/` | `agents/agent-evaluator.md` | Оценка качества агентов |
| `Agents/DatabaseReviewer/` | `agents/database-reviewer.md` | Аудит баз данных (досье компаний) |

## Blueprint — 5 файлов

| Файл в TT3Dato | Источник |
|---|---|
| `Blueprint/PLAN-PRD-PATTERN.md` | ECC `docs/PLAN-PRD-PATTERN.md` |
| `Blueprint/0001-четыре-домена-доверия.md` | Aegis `docs/adr/0001-four-trust-domains.md` |
| `Blueprint/0002-верифицируемая-память.md` | Aegis `docs/adr/0002-verifiable-memory.md` |
| `Blueprint/0003-цикл-ECC.md` | ECC (цикл plan->test->implement->review->verify->remember->improve) |
| `Blueprint/0004-интеграция-OmniRoute.md` | OmniRoute (diegosouzapw/OmniRoute, MIT) |

## Workflows — 4 файла

| Файл в TT3Dato | Источник |
|---|---|
| `Workflows/README.md` | Концепция workflow (ECC/Ruflo) |
| `Workflows/development.md` | Ruflo `.claude/commands/workflows/development.md` + цикл ECC |
| `Workflows/research.md` | Ruflo `.claude/commands/workflows/research.md` |
| `Workflows/review.md` | ECC `workflows/orch-review.workflow.js` + агент code-reviewer |

## Repositories — 2 файла

| Файл в TT3Dato | Источник |
|---|---|
| `Repositories/stack-mappings.json` | ECC `config/project-stack-mappings.json` |
| `Repositories/inventory.json` | Ruflo `verification/inventory.json` |

## External — 1 файл

| Файл в TT3Dato | Источник |
|---|---|
| `External/README.md` | Формат коннектора из Aegis `connectors/` + ECC `integrations/aura` |

## Итого

Создано 56 файлов (включая 21 файл семи агентов: `system.md` + `config.yaml` + `state.json`):

- 6 правил в `Skills/rules/`;
- 12 навыков в `Skills/<name>/SKILL.md`;
- 7 агентов (21 файл: `Agents/<Name>/system.md`, `config.yaml`, `state.json`);
- 2 файла Memory Vault (`Memory/README.md`, `Memory/templates/memory-entry.md`);
- 2 файла Evidence Trail (`Logs/README.md`, `Tests/README.md`);
- 1 security checklist (`Docs/Audits/Agent_Config_Security_Checklist.md`);
- 5 файлов Blueprint (`PLAN-PRD-PATTERN.md` + 4 ADR);
- 4 файла Workflows (`README.md` + development/research/review);
- 2 файла Repositories (`stack-mappings.json`, `inventory.json`);
- 1 файл External (`README.md`).

Проверка: 6 + 12 + 21 + 2 + 2 + 1 + 5 + 4 + 2 + 1 = 56.
