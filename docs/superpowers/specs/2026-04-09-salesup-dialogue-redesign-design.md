# SalesUp Game Dialogue Redesign

Date: 2026-04-09
Status: approved design for scenario redraft
Primary workspace: `/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school`

## 1. Context

The current game is no longer a 5-day scenario. The active product direction is:

- 3 days instead of 5
- longer and denser play session: 12-15 minutes total
- Russian script first, Uzbek localization second
- realistic live speech from an Uzbek working environment
- the game is a lead funnel into the school, but it should feel like a believable work story first
- the school brand is now `SalesUp`, not `Sales School`

This means older docs that still describe 5 days are partially outdated and should not be treated as the source of truth over the active scenario code.

## 2. Product Goal

The game must do two jobs at once:

1. Give the player an emotionally believable short experience of real sales work.
2. Lead the player to a natural conclusion: "I have potential, but without a system, practice, and a mentor I will not become stable and strong at this."

The funnel logic should feel earned, not inserted. The player should first feel tension, ambiguity, status differences, and pressure. Only after that should the game open the path toward `SalesUp`.

## 3. Audience

Primary audience:

- young people in Uzbekistan
- with work and without work
- many are still unsure about career direction
- many have no formal sales background

Implications:

- dialogue must stay easy to parse on first read
- no unexplained sales terminology
- if a sales concept is necessary, it must be phrased in ordinary words
- the player must not feel talked down to or lectured

## 4. Core Editorial Decisions

### 4.1 Tone

Target tone:

- realistic
- grounded
- human
- locally believable
- emotionally restrained, not theatrical

Avoid:

- lecture tone
- "training module" tone
- motivational speaker language
- landing-page language inside live scenes
- over-polished AI phrasing

### 4.2 Dialogue Rules

Every line should do one clear thing:

- pressure
- test
- soften
- probe
- refuse
- respect
- summarize

Do not combine three different intentions into one line unless the scene truly needs it.

### 4.3 Sales Language Rule

Inside scenes, characters should not speak in raw training terminology unless it is translated into plain speech.

Bad direction:

- "show value"
- "professional approach"
- "handle objection"
- "use the technique"

Preferred direction:

- "say clearly what the difference is"
- "do not rush him"
- "answer straight"
- "she already knows the basics, do not explain obvious things"

### 4.4 Funnel Rule

`SalesUp` should be strongest in the final conversion layer, not in the middle of normal scenes.

Scene logic:

- first: believable people
- then: believable work difficulty
- then: earned respect for system and practice
- finally: `SalesUp` as the answer

## 5. Character Voice Guide

### Rustam

- short, exact, authoritative
- praises without syrup
- criticizes without speeches
- sounds like a strong floor manager, not a webinar host

### Dilnoza

- fast, sharp, confident
- can tease lightly
- status comes through precision and attitude, not through direct bragging
- should feel like someone who already climbed the ladder and now reads people quickly

### Anvar

- useful, young, slightly tense
- can sound a little rushed or practical
- should not feel like a plot device that only dumps information

### Javlon

- proud, quick, status-sensitive
- wants to feel himself in the car, not only understand specs
- when ignored, should sound personally slighted

### Nilufar

- practical, emotionally grounded, not melodramatic
- speaks from real family logistics and accumulated irritation
- should not exist only as "the safety voice"

### Kamola

- prepared, direct, efficient
- does not respect empty words
- should warm up only when she hears clarity and substance
- skeptical does not mean rude by default

### Abdullaev

- sparse language
- strong sense of time and standard
- should feel expensive without caricature

### Sardor

- before reveal: quiet, restrained, easy to underestimate
- after reveal: calm, controlled, not theatrical
- his authority should come from composure, not volume

## 6. Day-by-Day Redesign

### Day 1: First Real Human Test

Purpose:

- the player feels the pressure of a real first client interaction
- the lesson is not "technique for couples" but "can you hold two different people in one conversation without losing either one"

Required rewrite direction:

- Rustam opens the day dry and practical
- Dilnoza becomes more lived-in and less banner-like
- Anvar gives a believable floor-level heads-up
- Javlon and Nilufar must sound like a real pair with different priorities and small accumulated friction
- the best player lines should sound calm and adult, not textbook-correct
- the anniversary branch stays, but the final line becomes less postcard-like and more believable

Target player takeaway:

- "I did not just sell a car. I managed two people in one emotional space."

### Day 2: Competence Under Scrutiny

Purpose:

- the player learns that some clients do not need warmth first; they need clarity, respect, and precision

Required rewrite direction:

- Kamola stops sounding like a scripted "difficult client"
- she should sound like a person who already did her homework and is testing whether the salesperson wastes her time
- multiple current lines that sound like training copy must become plain business speech
- the best route is: respect her prep -> answer specifically -> let experience do part of the work -> do not over-close
- her positive ending should stay restrained and realistic

Target player takeaway:

- "Strong clients do not want pressure. They want confidence, respect, and clear thinking."

### Day 3: Stakes, Scale, and Final Proof

Purpose:

- first half shows higher-value sales and the cost of weak preparation
- second half tests who the player really is when status signals disappear

Required rewrite direction:

- Abdullaev becomes drier, sharper, and more time-aware
- this section should feel like a step up in money, tempo, and expectation
- Sardor must be understated before the reveal
- the reveal should feel controlled, almost cold, not melodramatic
- the ending sequences keep the idea of "potential vs system" but reduce landing-page phrasing inside character speech
- `SalesUp` appears clearly in the final conversion layer

Target player takeaway:

- "Talent and instinct help, but they do not replace training, repetition, and structure."

## 7. Emotion and Visual Alignment

The current emotional system is useful, but some scenes need tighter alignment between sprite and text.

### Priority mismatches to resolve

- Javlon: needs a middle state between hard resistance and open emotional shift
- Kamola: needs a more restrained approval state, less bright than full impressed
- Abdullaev: needs a cold evaluation state
- Sardor: needs a subtler reveal or approval state for softer end branches

### Media Direction

Do not regenerate everything.

Create one new prompt file for only the missing assets needed by the rewritten scenes, for example:

- `game/docs/prompts/13-dialogue-revision-assets.md`

Expected contents:

- missing character emotions
- optional transition scene prompts if a rewritten scene clearly needs a new visual beat

## 8. Conversion Layer Update

User-facing school references must switch from `Sales School` to `SalesUp`.

Rules:

- inside live scenes, use mostly generic framing such as "system", "practice", "mentor", "stable result"
- in the final CTA layer, use the actual brand `SalesUp`
- internal component names may remain unchanged during the first rewrite pass if that reduces implementation risk, but all player-facing strings should be updated

Target final message:

- not "buy the course"
- but "you now understand why people with practice and structure grow faster; SalesUp is the next step if you want that path"

## 9. Files Expected to Change in Implementation

Primary script rewrite:

- `game/data/scenarios/car-dealership/day1.ts`
- `game/data/scenarios/car-dealership/day2.ts`
- `game/data/scenarios/car-dealership/day3.ts`

Character emotion registry:

- `game/data/characters/index.ts`

Final conversion layer:

- `components/game/screens/SchoolCTA.tsx`

New prompt file if needed:

- `game/docs/prompts/13-dialogue-revision-assets.md`

Optional doc refresh if implementation exposes major divergence:

- `game/docs/scenarios/car-dealership.md`

## 10. Non-Goals

This redesign does not automatically require:

- changing score math
- changing engine architecture
- changing node ids
- full scenario rebuild from scratch
- full Uzbek localization in the same step as the Russian rewrite

The preferred approach is a deep rewrite inside the current gameplay skeleton.

## 11. Validation Standard

The rewrite is successful when:

- scenes read naturally even outside the game UI
- character emotions match the lines on screen
- choices sound like things a real salesperson might actually say
- the funnel to `SalesUp` feels earned
- a young player with no sales background can understand the entire story without training jargon

## 12. Implementation Direction

Recommended execution model:

1. Rewrite the full Russian text for all 3 days.
2. Adjust emotion assignments where the rewritten text no longer matches current sprites.
3. Add only the missing asset prompts needed for new emotional beats.
4. Update final CTA branding from `Sales School` to `SalesUp`.
5. Only after Russian quality is locked, localize to Uzbek.
