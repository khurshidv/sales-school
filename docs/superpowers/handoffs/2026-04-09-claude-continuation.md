# Claude Continuation Handoff

Workspace:
- `/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school`

Source of truth:
- Spec: `/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school/docs/superpowers/specs/2026-04-09-salesup-dialogue-redesign-design.md`
- Plan: `/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school/docs/superpowers/plans/2026-04-09-salesup-dialogue-redesign-plan.md`

## Goal

Rewrite the 3-day car-dealership scenario dialogue so it feels like realistic Uzbek work-environment speech, Russian-first with aligned Uzbek strings, no unexplained sales jargon, and `SalesUp` only in the final conversion layer.

## Current status

Completed:
- Task 0: preflight
- Task 1: CTA copy extracted + guardrails added
- Task 2: Day 1 fully rewritten and committed

In progress:
- Task 3: Day 2 rewrite

Not started:
- Task 4: Day 3 VIP rewrite
- Task 5: Sardor + final funnel rewrite
- Task 6: missing emotions + prompt definitions
- Task 7: final validation + editorial smoke check

## Relevant commits already on `main`

- `1e42a10` `docs: add SalesUp dialogue redesign spec`
- `52f0f27` `refactor(copy): extract SalesUp CTA copy and add guardrails`
- `f32572a` `fix(copy): scope old brand guardrail to CTA copy`
- `82eeabb` `test(copy): tighten SalesUp CTA guardrails`
- `f1d421b` `test(copy): enforce exhaustive CTA ending coverage`
- `9a5554f` `rewrite(script): humanize Day 1 dealership dialogue`

## What is already true

- `day1.ts` is rewritten and tests pass.
- CTA copy is extracted into:
  - `/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school/components/game/screens/schoolCtaCopy.ts`
- CTA renderer uses the extracted copy:
  - `/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school/components/game/screens/SchoolCTA.tsx`
- Guardrail tests exist here:
  - `/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school/game/data/scenarios/car-dealership/__tests__/copyRules.test.ts`

Latest verified command result before handoff:

```bash
npx vitest run game/data/scenarios/car-dealership/__tests__/days.test.ts game/data/scenarios/car-dealership/__tests__/copyRules.test.ts
```

Result:
- `2 passed` test files
- `14 passed` tests

## Important worktree notes

There are unrelated dirty files. Do not revert them:
- modified: `/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school/components/game/engine/CharacterSprite.tsx`
- modified: `/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school/components/game/engine/DialogueBox.tsx`
- modified: `/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school/components/game/engine/SceneRenderer.tsx`
- modified: `/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school/game/docs/prompts/01-backgrounds.md`
- untracked: `/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school/docs/superpowers/plans/2026-04-09-salesup-dialogue-redesign-plan.md`
- untracked: `/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school/game/docs/scenarios/day1-flowchart.md`

`day2.ts` is currently clean and not modified yet.

## Exact next step

Continue from Task 3 in the plan:
- rewrite `/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school/game/data/scenarios/car-dealership/day2.ts`

Focus:
- Kamola must sound prepared, direct, efficient
- not a cartoonishly difficult client
- no raw training jargon like `ценность`, `техника`, `возражение`
- best route should respect her prep, answer specifically, let the drive do part of the work, and avoid pressure-closing
- positive ending must stay restrained and believable

Task 3 target nodes:
- `d2_intro`
- `d2_anvar_files`
- `d2_callback`
- `d2_kamola_enters`
- `d2_presentation`
- `d2_kamola_obj_features`
- `d2_kamola_obj_value`
- `d2_kamola_obj_priorities`
- `d2_objection`
- `d2_objection_expired`
- `d2_kamola_reacts_service`
- `d2_kamola_reacts_resale`
- `d2_kamola_reacts_discount`
- `d2_kamola_reacts_timeout`
- `d2_test_drive_offer`
- `d2_test_drive`
- `d2_kamola_drives`
- `d2_test_drive_choice`
- `d2_kamola_test_cruise`
- `d2_kamola_test_general`
- `d2_closing`
- `d2_end_hidden`
- `d2_end_success`
- `d2_end_partial`
- `d2_end_fail`

## Constraints for Claude

- Keep node graph, ids, scores, flags, timing, backgrounds, `nextNodeId`, and endings structure intact.
- Modify only `day2.ts` for Task 3.
- Keep Russian and Uzbek strings aligned in meaning.
- Do not insert `SalesUp` into live Day 2 scene copy.
- Preserve the current 3-day structure.

## Commands Claude should run

Read:

```bash
sed -n '546,746p' docs/superpowers/plans/2026-04-09-salesup-dialogue-redesign-plan.md
sed -n '1,320p' game/data/scenarios/car-dealership/day2.ts
sed -n '320,680p' game/data/scenarios/car-dealership/day2.ts
```

After rewrite:

```bash
npx vitest run game/data/scenarios/car-dealership/__tests__/days.test.ts game/data/scenarios/car-dealership/__tests__/copyRules.test.ts
git add game/data/scenarios/car-dealership/day2.ts
git commit -m "feat(copy): rewrite day 2 dialogue for realistic business tone"
```

Then continue with:
- Task 4 in the same plan
- Task 5
- Task 6
- Task 7

## Short paste-ready prompt for Claude

```text
Continue work in /Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school.

Read these first:
1. /Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school/docs/superpowers/specs/2026-04-09-salesup-dialogue-redesign-design.md
2. /Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school/docs/superpowers/plans/2026-04-09-salesup-dialogue-redesign-plan.md
3. /Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school/docs/superpowers/handoffs/2026-04-09-claude-continuation.md

Status:
- Task 0 done
- Task 1 done
- Task 2 done and committed as 9a5554f
- Task 3 is next

Do not revert unrelated dirty files.
Start from Task 3 and rewrite /Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school/game/data/scenarios/car-dealership/day2.ts only.

Requirements:
- Kamola must sound prepared and competent, not scripted.
- No unexplained sales jargon.
- Keep node graph, ids, scores, flags, timing, backgrounds, and nextNodeId intact.
- Keep Russian and Uzbek strings aligned.
- After Task 3, run:
  npx vitest run game/data/scenarios/car-dealership/__tests__/days.test.ts game/data/scenarios/car-dealership/__tests__/copyRules.test.ts
- Commit Task 3.
- Then continue with Tasks 4-7 from the plan.
```
