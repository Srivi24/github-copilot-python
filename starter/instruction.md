Advanced Local Sudoku Application — Coding Agent Instructions
1. Project Mission
Upgrade the existing Python Flask classic Sudoku project into a polished, advanced personal local-use Sudoku application.

This is a single-user project that runs only on the developer’s own computer through localhost. It is not a hosted web service, social product, multiplayer game, or commercial platform. Preserve the existing playable classic Sudoku functionality while adding advanced gameplay, puzzle intelligence, local persistence, accessibility, and maintainable code.

The completed project should be strong enough for a portfolio demonstration: technically correct, visually polished, responsive, well documented, fully offline after installation, and covered by automated tests.

2. Existing Repository and Structure Decision
2.1 Current repository structure
The existing repository structure is authoritative:

text
project-root/
├── starter/
│   ├── static/
│   │   ├── main.js
│   │   └── styles.css
│   ├── templates/
│   │   └── index.html
│   ├── app.py
│   ├── requirements.txt
│   └── sudoku_logic.py
├── .gitignore
├── LICENSE.txt
└── README.md
The instruction.md file is a project-planning document and is not part of the runtime application structure.

2.2 Required placement rule
All runnable application source code, templates, static files, test configuration, and local dependency files must remain inside the existing starter/ directory.

Do not move app.py, sudoku_logic.py, templates/, static/, or requirements.txt out of starter/.

Do not create a second root-level app/ package or a competing root-level application structure.

Do not alter the root-level .gitignore, LICENSE.txt, or README.md except where this document explicitly asks for documentation updates.

Keep the existing local run entry point compatible: running from starter/ must remain supported.

The original simple structure is acceptable. Refactor only when it clearly improves correctness, organization, or testability.

2.3 Permitted incremental structure
The coding agent must inspect starter/app.py and starter/sudoku_logic.py first. Based on that inspection, choose the smallest maintainable structure that preserves compatibility.

The preferred target, if modularization is useful, is:

text
project-root/
├── starter/
│   ├── app.py                         # Existing Flask entry point; retain as the runnable entry point
│   ├── sudoku_logic.py                # Preserve public legacy helpers; delegate/refactor internally as needed
│   ├── config.py                      # Optional local configuration
│   ├── db.py                          # SQLite connection/init helpers, if needed
│   ├── models.py                      # sqlite3 persistence/repository functions, if needed
│   ├── services/                      # Add only when needed
│   │   ├── __init__.py
│   │   ├── generator.py
│   │   ├── difficulty.py
│   │   ├── hint_engine.py
│   │   ├── scoring.py
│   │   └── game_state.py
│   ├── static/
│   │   ├── main.js
│   │   ├── styles.css
│   │   └── js/                        # Optional focused JS modules
│   ├── templates/
│   │   └── index.html
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── test_sudoku_logic.py
│   │   ├── test_api.py
│   │   └── test_persistence.py
│   ├── instance/
│   │   └── sudoku_local.db            # Runtime file; must be Git-ignored
│   ├── requirements.txt
│   └── pyproject.toml                 # Optional tool configuration
├── .gitignore
├── LICENSE.txt
├── README.md
└── instruction.md
Rules:

Do not create empty modules merely to mimic this diagram.

app.py remains the primary Flask application entry point.

sudoku_logic.py remains available for existing imports and should contain, or delegate to, canonical Sudoku board/solver behavior.

New modules may be introduced under starter/ only where responsibilities are sufficiently complex to justify separation.

Tests belong in starter/tests/.

The SQLite runtime database belongs in starter/instance/ and must be ignored by Git.

README.md remains at repository root and must document commands relative to the repository root and/or starter/ clearly.

3. Scope, Priorities, and Completion Rules
3.1 Version 1 mandatory scope
The coding agent must implement and test every item below before considering Version 1 complete:

Preserve and improve standard 9×9 Classic Sudoku.

Build a valid local Sudoku engine: validation, solver, solution counting, candidate calculation, seeded puzzle generation, and difficulty classification.

Support Easy, Medium, Hard, and Expert puzzles.

Build responsive board interaction: keyboard input, touch input, on-screen keypad, notes, conflict display, undo/redo, reset, timer, pause, and highlighting.

Add browser autosave/recovery and local SQLite persistence for active and completed games.

Add progressive hints, board checking, configurable mistake checking, Flask-side completion validation, and deterministic scoring.

Add Classic, Practice, Timed Challenge, Custom Game, and Daily Challenge modes according to the rules in this document.

Add one single machine-local profile, personal statistics, personal records, local streaks, and local achievements.

Add light/dark themes, practical accessibility support, and responsive mobile layout.

Add required unit and integration tests; add browser/UI tests only when the prerequisites in Section 19 are available.

Update setup, run, test, reset, and architecture documentation.

3.2 Required implementation order
Do not attempt all functionality in one uncontrolled rewrite. Implement and verify features in the order in Section 20. A phase is complete only when its relevant tests pass and the application remains runnable.

3.3 Future ideas are excluded
Items in Section 21 are future possibilities only. Do not implement their routes, schemas, UI pages, integrations, placeholders, or infrastructure now.

4. Scope Boundaries
In scope
Local Flask application bound to 127.0.0.1 / localhost.

One single-player, machine-local profile.

Offline puzzle generation, solving, difficulty analysis, and hints.

Browser-based interactive UI.

SQLite local persistence and browser local storage.

Personal records, achievements, daily streaks, and local statistics.

Deterministic local daily challenges.

Responsive design, accessibility, testing, and documentation.

Explicitly out of scope
Do not implement, configure, or prepare infrastructure for:

Cloud hosting, public deployment, public network binding, domains, Docker deployment, or production infrastructure.

Remote backend services, hosted databases, public REST APIs, webhooks, or third-party cloud APIs.

Public registration, login, passwords, email verification, password reset, social login, or administration panels.

Multiple local profiles, user switching, role management, or user isolation.

Multiplayer, real-time collaboration, matchmaking, friends, chat, messaging, social feeds, or shared sessions.

Public/global leaderboards, online tournaments, shared rankings, or cross-user competition.

Payments, subscriptions, advertisements, analytics trackers, telemetry services, or e-commerce.

Native Android/iOS applications.

External AI APIs, paid AI services, or internet-dependent game features.

Do not add remote network dependencies to provide a feature. The application must remain fully functional with no internet connection after local installation.

5. Single Local Profile Rule
The application supports exactly one machine-local player profile in Version 1.

There is no login, account creation, password, email address, authentication token, user role, user switcher, or multi-user data model.

All local games, preferences, records, achievements, and streaks belong to this one profile.

Use a fixed internal identifier such as local-profile-v1 only if a profile identifier is useful in the schema; do not expose profile management in the UI.

Do not create a users table. Prefer a one-row local_profile record or a local settings record.

Future multi-profile support must not be pre-built. Keep code readable enough to expand later, but do not add user-management complexity now.

6. Working Principles
Inspect the repository before making changes. Identify the Flask entry point, routes, templates, static files, Sudoku logic, persistence, configuration, and tests.

Preserve existing working classic-Sudoku behavior unless replacing it with equivalent or better behavior.

Improve incrementally and keep the app runnable after each meaningful milestone.

Prefer simple, dependable local-first design over enterprise architecture.

Keep Flask routes thin. Put Sudoku rules, solving, generation, hinting, scoring, and state transitions in dedicated functions/modules when complexity warrants it.

Keep all gameplay and persistence self-contained. Do not add queues, caches, background workers, remote services, or hosted infrastructure.

Prioritize correctness: every generated playable puzzle must be valid and have exactly one solution.

Use type hints and docstrings for non-trivial Python functions/classes.

Add dependencies only if they materially improve correctness, maintainability, or testing.

Treat browser-provided state as untrusted for final validation, even though the application is local.

7. Baseline Audit
Before implementation, inspect the actual contents of:

starter/app.py

starter/sudoku_logic.py

starter/templates/index.html

starter/static/main.js

starter/static/styles.css

starter/requirements.txt

Then update the root README.md with:

Current Python and Flask versions and dependency list.

Existing local installation and run commands.

Existing routes, templates, JavaScript, CSS, data storage, and game flow.

Existing board representation and validation/generation behavior.

Identified limitations and the safe upgrade plan.

The final actual project layout after implementation.

Do not make structural decisions based only on this instruction file. Inspect the code first, preserve working behavior, then make the smallest justified refactor.

8. Local Configuration, Timezone, and Dependencies
8.1 Local timezone decision
Use the operating system / Python process local timezone as the application timezone.

Do not add a timezone picker or a configurable timezone setting in Version 1.

Use timezone-aware Python datetimes for persisted timestamps.

Store database timestamps in UTC using ISO-8601 format where possible.

Convert/display Daily Challenge dates and human-readable completion times in the process local timezone.

The daily date is the local date returned by datetime.now().astimezone().date() when the Flask process handles the request.

The Daily Challenge screen and root README.md must state: “Daily Challenges use this computer’s current local date and timezone.”

If the operating system timezone changes, future challenges use the new process-local date. Existing stored daily challenge records remain associated with their stored local_date value.

8.2 Dependency decision
Use the smallest reasonable dependency set.

Preserve existing dependencies unless they are obsolete or duplicated.

Use Python’s built-in sqlite3 module for SQLite persistence in Version 1.

Do not add SQLAlchemy, Flask-SQLAlchemy, Alembic, or Flask-Migrate unless the existing project already uses one of them. The known starter structure does not require an ORM.

Use Flask’s built-in test client and pytest for backend testing.

Add only pytest, pytest-cov, ruff, black, and mypy as development/testing dependencies if they are not already present and the environment allows installation.

Browser tests with Playwright are conditional, as defined in Section 19.

8.3 Requirements files
Keep runtime requirements in starter/requirements.txt.

If development dependencies are separated, create starter/requirements-dev.txt that references or includes runtime requirements and adds testing/linting tools.

Do not add hosted-service SDKs, cloud libraries, external API clients, or analytics packages.

9. Core Domain Model
Use a canonical 81-cell flat board representation for 9×9 Sudoku. Board values are integers 0–9, where 0 means empty. Use row-major order: index 0 is row 0/column 0, index 80 is row 8/column 8.

Keep these states distinct:

Initial puzzle: immutable starting clue values.

Solution board: full verified solution; stored locally by Flask/SQLite and never included in ordinary client game-state responses.

Current board: player-entered values.

Notes: for each cell, a list of candidate digits 1–9; notes are valid only for empty non-clue cells.

Game metadata: game ID, puzzle ID, mode, difficulty, seed, settings snapshot, elapsed active seconds, pause state, hint counters, mistake counters, score, status, timestamps, and completion marker.

UI-only state: selected cell, visual highlights, keypad state, and temporary animation state. This may be stored in browser storage but is not authoritative in SQLite.

Create or retain a canonical Sudoku board/engine implementation within starter/sudoku_logic.py or helper modules it imports. Do not duplicate row/column/box validation independently across Flask routes and JavaScript.

Required engine capabilities
Implement and test:

Board shape/value validation.

Candidate-placement validation.

Row, column, and 3×3 box conflict detection.

Candidate calculation for each empty cell.

Completed-board validation.

Deterministic solver using constraint propagation plus backtracking, or a documented equivalent.

Solution counting with early stop after two solutions.

Valid complete-grid generation.

Puzzle clue removal while preserving exactly one solution.

Seeded random generation for reproducible tests and Daily Challenges.

10. Exact Difficulty Rules
Difficulty must not be based only on clue count. Classify every generated puzzle using a deterministic difficulty_metrics result produced by the local solver.

10.1 Required metrics
At minimum, calculate:

empty_cells: number of empty cells in the initial puzzle.

naked_single_placements: placements solved by a cell having one candidate.

hidden_single_placements: placements solved by a digit having one valid position in a row, column, or box.

backtrack_nodes: recursive candidate branches explored after logical strategies are exhausted.

max_backtrack_depth: maximum recursion depth reached.

10.2 Classification algorithm
Run the deterministic solver using this sequence:

Repeatedly apply naked singles.

Repeatedly apply hidden singles.

If unsolved, choose the empty cell with the fewest candidates; break ties by lowest row-major index.

Try candidate values in ascending numeric order.

Count branch explorations and maximum recursion depth.

Assign difficulty using these exact conditions, evaluated in order:

Difficulty	Required classification condition
Easy	backtrack_nodes == 0, hidden_single_placements == 0, and 36 <= empty_cells <= 45
Medium	backtrack_nodes == 0, hidden_single_placements >= 1, and 41 <= empty_cells <= 52
Hard	1 <= backtrack_nodes <= 250, max_backtrack_depth <= 5, and 45 <= empty_cells <= 58
Expert	backtrack_nodes >= 251 or max_backtrack_depth >= 6, and 50 <= empty_cells <= 64
If a generated puzzle does not meet the target difficulty exactly, discard it and generate another. Do not relabel a puzzle merely to satisfy a requested target.

10.3 Generation retry and fallback rule
For a requested difficulty:

Attempt up to 60 candidate generations using deterministic derived seeds.

Each attempt must create a valid, uniquely solvable puzzle and calculate the exact metrics above.

Return the first puzzle that matches the requested difficulty rule exactly.

If no match exists after 60 attempts, make one local fallback pass of up to 240 additional attempts using different derived seeds and the same exact classification rules.

If no matching puzzle is found after a total of 300 attempts, return HTTP 503 with GENERATION_FAILED and a clear message such as: “A valid Expert puzzle could not be generated locally right now. Please retry.”

Do not silently relabel a puzzle and do not weaken the thresholds. The agent must report observed generation-failure rates in the implementation handoff and add deterministic tests for every difficulty.

Store metrics with each generated puzzle for debugging, testing, and an optional advanced details view. Normal gameplay may show only the difficulty label.

11. Exact Game Modes and Rules
11.1 Classic Game
Player selects Easy, Medium, Hard, or Expert.

Timer counts active play time.

Hints are available.

Completion is scored and stored in local history.

Classic games contribute to statistics, personal bests, and eligible achievements.

Classic games do not contribute to Daily Challenge streaks.

11.2 Practice Mode
Player selects difficulty and optional timer visibility.

Default behavior: timer is visible but does not affect a competitive personal-best ranking.

Hints, conflict checking, and mistake checking can be enabled or disabled by the player.

Practice completion is stored in history and contributes to broad statistics such as games started/completed and hint/mistake averages.

Practice games do not create score records, timed personal bests, Daily Challenge official results, daily streaks, or score-based achievements.

Practice games may unlock only non-competitive achievements: First Completion and general completion milestones. They may not unlock No Hints, No Mistakes, speed, or difficulty-performance achievements.

11.3 Timed Challenge
Player selects difficulty and one time limit from: 5, 10, 15, 20, 30, or 45 minutes.

Timer counts down only while the game is active; pausing freezes the timer.

If time reaches zero before valid completion, mark the game failed_timeout; do not allow a score record from that game.

Hints are available unless disabled in a Custom Game; hints apply score penalties.

Timed Challenge completion contributes to statistics, timed personal bests, and eligible achievements.

Personal records are compared only against games with the same mode, difficulty, and time limit.

11.4 Custom Game
The player may choose:

Difficulty: Easy, Medium, Hard, or Expert.

Timer: off, count-up, or countdown.

Countdown limit when selected: 5, 10, 15, 20, 30, or 45 minutes.

Real-time conflict checking: on/off.

Mistake checking: off/on.

Mistake limit: none, 3, or 5; only available when mistake checking is on.

Hints: off, explanation-only, or full progressive hints.

Custom games are stored in local history and contribute to broad statistics. They do not set Classic or Timed Challenge personal records, do not count as official Daily Challenges, and do not count toward Daily Challenge streaks. They may unlock only non-competitive achievements unless the exact achievement rule states otherwise.

11.5 Daily Challenge
Daily Challenge rules are fully defined in Section 14. Daily Challenge is the only mode that affects the daily streak.

12. Interactive Board Experience
Create a modern responsive board that works on desktop, laptop, tablet, and phone.

Required behavior:

Select a cell through click/tap, then enter a value using keys 1–9 or the on-screen keypad.

Support Backspace/Delete, arrow keys, and optionally WASD navigation.

Prevent editing initial clue cells.

Highlight selected cell, row, column, 3×3 box, and matching placed digits.

Show direct Sudoku-rule conflicts without deleting the entered value.

Provide real-time conflict-check toggle; default is on for Classic, Timed, and Daily modes, and user-configurable in Practice/Custom.

Provide pencil/note mode with candidate digits 1–9 for non-clue empty cells only.

When a final digit is placed, automatically remove that digit from notes in its row, column, and box.

Provide undo/redo for values, notes, clears, and reveal-level hint placements. Undo/redo does not reverse elapsed time, total hint count, or mistakes already recorded.

Provide reset-to-start with a confirmation dialog. Reset restores the starting puzzle and clears user values/notes/move history, but preserves elapsed time, hint count, and mistake count only if the user chooses “continue record”; otherwise it marks the game abandoned and starts a fresh game session. Default confirmation option is “start fresh,” not “continue record.”

Autosave active state locally.

Restore unfinished state after page reload or Flask restart, with explicit “Resume” or “Discard” choice.

Handle rapid input and repeated saves safely.

Use semantic HTML controls. Do not use color as the sole indication of conflict, selection, or completion.

13. Hints, Mistakes, Completion, and Score
13.1 Hint tiers
Implement three progressive hint tiers:

Guide hint: highlights a relevant cell/unit without giving a digit.

Explain hint: returns a short, accurate explanation based on a naked single or hidden single, without placing a value.

Reveal hint: after explicit confirmation, places one correct value in an eligible empty non-clue cell.

Hint rules:

Prefer a valid naked-single or hidden-single explanation.

If no logical strategy is available, Guide/Explain hints must state that a direct logical hint is unavailable. A Reveal hint may still use the verified solution but must be labelled as a reveal.

Never replace a non-empty player-entered value automatically. Reveal hints may only target an empty editable cell.

Track guide_hints_used, explain_hints_used, and reveal_hints_used separately.

Only reveal hints add a board value.

13.2 Mistake rules
Conflict checking identifies rule duplicates only; it does not compare entries to the solution.

Mistake checking, when enabled, compares a submitted final digit to the solution.

A wrong final digit increments mistakes_count only once for that placement attempt; re-checking the same unchanged wrong board does not increment it again.

Notes never count as mistakes.

If a game has a 3- or 5-mistake limit and the limit is reached, set status to failed_mistake_limit; the game cannot create a score/personal-record result.

In modes with mistake checking off, the application may still show rule conflicts but must not claim an entry is wrong until completion validation.

13.3 Completion rules
Only Flask-side code may finalize a game.

A game may become completed only when:

It is currently active or paused.

The current board is full.

The board is a valid completed Sudoku.

The current board exactly matches the stored verified solution.

The game has not already been finalized.

On completion:

Freeze the timer and calculate active elapsed seconds.

Calculate score using Section 13.4.

Set completed_at once.

Create exactly one completion record associated with the game session.

Completion is transactional and idempotent. The finish endpoint must validate, persist, and record achievements/daily results in a single SQLite transaction. Repeated finish calls for the same completed game must return the existing completion summary and must not create a new record, new achievement event, or new daily result.

Game lifecycle immutability is strict: once a game is completed, abandoned, failed_timeout, or failed_mistake_limit, it becomes immutable and may not be edited through active-state save endpoints.

13.4 Exact scoring formula
Scores are integer values. Minimum final score is 0.

text
base_score = difficulty_base[difficulty]
time_penalty = floor(active_elapsed_seconds / 30) * time_penalty_per_30_seconds
hint_penalty = (guide_hints_used * 5) + (explain_hints_used * 15) + (reveal_hints_used * 75)
mistake_penalty = mistakes_count * 40
score = max(0, base_score + completion_bonus - time_penalty - hint_penalty - mistake_penalty)
Constants:

Difficulty	difficulty_base
Easy	500
Medium	900
Hard	1,500
Expert	2,300
Additional constants:

completion_bonus = 200

time_penalty_per_30_seconds = 4

A Practice game has score = null; do not calculate or rank it.

A Custom game has a calculated score only if timer mode is count-up or countdown. Store it in history, but do not use it for Classic or Timed Challenge personal records.

A failed timeout or failed mistake-limit game has score = null.

Score calculation must run on Flask side using stored state and timestamps, not a browser-submitted score.

14. Exact Daily Challenge and Streak Rules
14.1 Date and puzzle identity
Daily Challenge uses the process/system local calendar date in ISO form: YYYY-MM-DD, determined as specified in Section 8.1.

There is one official Daily Challenge for each pair: (local_date, difficulty).

The player can select Easy, Medium, Hard, or Expert.

Each date+difficulty puzzle uses a deterministic seed created from:

text
local-sudoku-daily-v1|YYYY-MM-DD|DIFFICULTY
The app stores the puzzle and solution locally the first time it is generated so reloads use the same puzzle even if generation code changes.

14.2 Official attempt and replay rules
An official daily attempt is the first Daily Challenge game session created for a specific (local_date, difficulty) pair.

A completed official attempt creates the official result for that date+difficulty.

An unfinished, abandoned, timeout-failed, or mistake-limit-failed official attempt may be resumed. It does not permit creating a second official attempt for the same date+difficulty.

The official attempt lifecycle is strict and unambiguous:
- Exactly one official daily game session may exist for a given (local_date, difficulty) pair.
- If an official attempt already exists, the app may offer a Practice Replay for the same puzzle, but Practice Replay is a separate practice game and never replaces the official result.
- A finalized official result is immutable and may not be overwritten.
- Repeated completion attempts for the same official daily session must return the original result summary and must not create duplicate records, achievement events, or daily streak updates.

A Daily Challenge completion endpoint must reject an attempt to overwrite an already finalized official result for the same (local_date, difficulty) pair.

14.3 Daily streak definition
A day counts toward the streak if the player has at least one completed official Daily Challenge on that local date, at any difficulty.

Multiple completed difficulties on the same date still count as one streak day.

The current streak is the number of consecutive local calendar days ending today if today has a completed official daily result; otherwise it is the consecutive sequence ending on the most recent completed daily date.

The streak is not broken permanently by missing a day; it resets to 1 when the next official daily completion occurs after a gap.

Practice replays, Classic, Timed, and Custom games never contribute to a Daily Challenge streak.

Longest streak is the maximum consecutive-day sequence of qualifying official daily completions.

14.4 Daily records
Daily results are shown only as the local player’s history and personal comparison.

There is no public leaderboard, shared ranking, online verification, or cross-machine comparison.

15. Local Persistence and Exact Data Rules
Use SQLite for durable local data and browser localStorage for resilient UI-side recovery.

15.1 SQLite source of truth
SQLite is the authoritative persistent store whenever Flask is available. Browser storage is a recovery cache only.

Use Python built-in sqlite3 with explicit schema initialization and repository/helper functions. Do not introduce an ORM in Version 1.

15.2 Minimum schema
Create the following SQLite tables or functionally equivalent tables with the stated fields and constraints.

local_profile
Exactly one row.

id: integer primary key, fixed as 1.

created_at: UTC timestamp.

theme: system, light, or dark.

preferences_json: JSON text for supported settings.

puzzles
id: UUID/string or integer primary key.

initial_board_json: 81 integer values.

solution_board_json: 81 integer values; never returned through ordinary game APIs.

difficulty: Easy/Medium/Hard/Expert.

seed: string/integer nullable for non-seeded puzzles.

difficulty_metrics_json: JSON object defined in Section 10.

created_at: UTC timestamp.

Unique constraint for Daily Challenge puzzle seed when applicable.

game_sessions
id: UUID/string primary key generated by Flask, not the browser.

puzzle_id: reference to puzzles.

mode: classic, practice, timed, custom, daily, or practice_daily_replay.

difficulty.

settings_json: immutable settings snapshot at game creation.

current_board_json: 81 integer values.

notes_json: 81 digit lists represented as JSON.

move_history_json: serialized undo/redo-compatible history; it may be compacted but must preserve required behavior.

elapsed_active_seconds: integer.

last_resumed_at: UTC timestamp nullable.

status: active, paused, completed, abandoned, failed_timeout, or failed_mistake_limit.

guide_hints_used, explain_hints_used, reveal_hints_used: non-negative integers.

mistakes_count: non-negative integer.

score: nullable integer.

state_version: non-negative integer, default 1.

created_at, updated_at, completed_at: UTC timestamps; completed_at null until complete.

completion_recorded: integer/boolean default false; set true atomically with completion persistence.

daily_date: nullable local ISO date string.

official_daily_attempt: integer/boolean default false.

Required indexes:

status

(mode, difficulty, completed_at)

(daily_date, difficulty, official_daily_attempt)

Required uniqueness rule:

At most one official Daily Challenge session may exist for (daily_date, difficulty) where official_daily_attempt = true.

daily_challenges
local_date: ISO date string.

difficulty.

puzzle_id.

seed.

created_at.

Unique constraint on (local_date, difficulty).

achievements
key: primary key string.

name.

description.

category: non_competitive or competitive.

unlocked_achievements
achievement_key.

unlocked_at UTC timestamp.

game_session_id nullable.

Unique constraint on achievement_key.

The runtime database file must be ignored by Git. Provide documented commands/instructions to back it up, reset it, and reinitialize it.

15.3 Browser storage keys
Use namespaced local-storage keys:

text
local-sudoku-v1:active-game:<game_id>
local-sudoku-v1:ui-preferences
An active-game browser record must include:

game_id

saved_at_client_ms

current_board

notes

selected_cell optional

elapsed_active_seconds client snapshot

paused client snapshot

undo_stack and redo_stack if they cannot be fully recovered from Flask state

Do not store a solution board in browser storage.

15.4 Save and restore conflict resolution
On normal play, debounce saves to Flask by 750 milliseconds after the last state-changing action, with a maximum save interval of 10 seconds during active play.

Write browser local storage immediately after every state-changing action.

Each saved game state includes state_version, incremented atomically on each accepted server save.

Browser saves include last known state_version.

Exact conflict-resolution rules:
- If browser state_version equals server state_version, Flask accepts the save, increments state_version, and returns the canonical saved state.
- If browser state_version differs from server state_version, Flask returns HTTP 409 with STATE_CONFLICT, the canonical server state, and the current state_version.
- Browser code must not silently overwrite server state after a 409 response; it must prompt the user with a dialog explaining that a newer saved version exists.
- If browser saved_at_client_ms and server updated_at differ, the newer state is considered authoritative only after the user explicitly confirms a replace action.
- Finalized games cannot be modified by active-state saves.

Browser localStorage is a recovery cache only. SQLite is the source of truth whenever Flask is available.

16. Local API Contract
These JSON endpoints exist only for the local browser-to-Flask interaction. They are not public APIs. All responses use JSON.

16.1 Response envelopes
Success:

json
{
  "ok": true,
  "data": {}
}
Error:

json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable explanation",
    "details": {}
  }
}
Use these codes when applicable:

VALIDATION_ERROR — invalid input/state shape; HTTP 400.

NOT_FOUND — unknown local resource; HTTP 404.

GAME_FINALIZED — mutation of a completed/failed/abandoned game; HTTP 409.

STATE_CONFLICT — stale state_version; HTTP 409.

ILLEGAL_MOVE — clue edit/invalid move/action; HTTP 422.

DAILY_ATTEMPT_EXISTS — official daily session exists; HTTP 409.

DAILY_RESULT_FINALIZED — attempt to replace final daily result; HTTP 409.

GENERATION_FAILED — all permitted generation attempts exhausted; HTTP 503.

INTERNAL_ERROR — unexpected local error; HTTP 500 without stack trace in browser response.

16.2 Safe GameState response schema
Normal game responses may contain only:

json
{
  "id": "game-id",
  "state_version": 4,
  "puzzle": {
    "id": "puzzle-id",
    "initial_board": [0, 0, 0],
    "difficulty": "Medium"
  },
  "mode": "classic",
  "settings": {
    "timer_mode": "count_up",
    "time_limit_seconds": null,
    "conflict_checking": true,
    "mistake_checking": false,
    "mistake_limit": null,
    "hint_policy": "progressive"
  },
  "current_board": [0, 0, 0],
  "notes": [[1, 2], [], []],
  "elapsed_active_seconds": 123,
  "paused": false,
  "status": "active",
  "hints": {
    "guide": 0,
    "explain": 1,
    "reveal": 0
  },
  "mistakes_count": 0,
  "score": null,
  "daily": {
    "local_date": null,
    "official_attempt": false
  },
  "updated_at": "ISO-8601 UTC"
}
Boards always have 81 values; notes always have 81 arrays.

The following must never appear in normal game, list, stats, records, or save responses:

solution_board

raw solution values

internal solver path that exposes future values

unneeded secret/internal generation data

A solution may be returned only after valid final completion and only in response to a separate explicit “View solution” user action. The default finish response is summary-only.

Exact solution-access rule: the only legal solution-return route is POST /api/games/<game_id>/solution after status = completed. Any solution request before completion must fail with a safe error, not a raw board. The implementation must not leak future values through the normal game state, check response, save response, or any other endpoint.

16.3 Endpoints
POST /api/games
Creates a local game.

Request:

json
{
  "mode": "classic",
  "difficulty": "Medium",
  "settings": {
    "timer_mode": "count_up",
    "time_limit_seconds": null,
    "conflict_checking": true,
    "mistake_checking": false,
    "mistake_limit": null,
    "hint_policy": "progressive"
  }
}
Rules:

For classic, ignore unsupported custom settings and use Classic defaults.

For practice, timed, and custom, validate settings against Section 11.

For daily, require local_date and difficulty; create or return existing official attempt per Section 14.

Return HTTP 201 and safe GameState.

GET /api/games/<game_id>
Returns safe GameState; return 404 if absent.

PATCH /api/games/<game_id>
Saves allowed active-game fields.

Request:

json
{
  "state_version": 4,
  "current_board": [0, 0, 0],
  "notes": [[1, 2], [], []],
  "elapsed_active_seconds": 123,
  "paused": false,
  "move_history": [],
  "client_saved_at_ms": 0
}
Rules:

Validate board/note structure and reject changed clue values.

Do not accept score, solution, difficulty, mode, completion status, hints, mistakes, or timestamps from this endpoint.

Return HTTP 200 with canonical safe GameState when successful.

Return HTTP 409 STATE_CONFLICT with canonical safe state for stale versions.

POST /api/games/<game_id>/hint
Request:

json
{
  "tier": "guide"
}
Accepted tiers: guide, explain, reveal.

Reveal requires confirmed: true.

Update counters and state atomically.

Return hint object plus safe GameState, never a complete solution.

POST /api/games/<game_id>/check
Request may be empty.

Response includes:

conflict_cells: row-major indexes with rule conflicts.

incorrect_cells: only if mistake checking is enabled.

empty_cell_count.

mistakes_count when applicable.

The endpoint must not increment mistakes simply because the same wrong state is checked again.

POST /api/games/<game_id>/finish
Request may be empty.

Apply completion rules in Section 13.3.

If incomplete/invalid, return HTTP 422 with non-solution-revealing explanation.

If previously completed, return HTTP 200 with original summary and no duplicate records.

On first valid completion, atomically persist final state and return mode, difficulty, elapsed time, score if applicable, hints, mistakes, personal-record indicators, achievement unlocks, and daily/streak result if applicable.

The finish endpoint is idempotent by contract. Any second or repeated request for the same finalized session must return the original completion summary without creating additional records or achievements. The implementation must perform validation, final-state update, completion record insertion, achievement unlock, and daily result persistence inside one SQLite transaction.

POST /api/games/<game_id>/solution
Available only after status = completed.

Requires explicit client request after user clicks “View solution.”

Returns the completed solution board for post-game review.

If requested before completion, return a safe error such as GAME_FINALIZED or ILLEGAL_MOVE with a message stating that the solution is only available after the puzzle is completed. This endpoint must never be used to reveal a solution in normal play responses.

GET /api/daily/<local_date>?difficulty=<difficulty>
Returns local Daily Challenge puzzle metadata and official attempt state. May create/persist deterministic puzzle if absent. Never returns solution.

GET /api/stats
Returns aggregate local statistics only. No solution data.

GET /api/achievements
Returns achievement definitions and local unlock state.

GET /api/records
Returns personal records grouped by mode/difficulty and, for Timed Challenge, time limit.

17. Local Security and Privacy
This is a localhost-only application. Apply sensible local protections without adding production infrastructure.

Required:

Bind Flask to 127.0.0.1 by default; do not use 0.0.0.0.

Validate all form, route, query, and JSON input.

Use parameterized sqlite3 queries; never concatenate values into SQL.

Escape templates by default.

Avoid unsafe dynamic innerHTML; render dynamic text safely.

Never return solution boards in normal state responses.

Do not collect/store sensitive personal data.

Do not include secrets, API keys, external credentials, analytics tokens, tracking SDKs, or telemetry.

Keep runtime database file local and Git-ignored.

Do not expose Flask debugger/stack traces to browser responses.

Not required:

Login/password features.

Email verification/reset.

Multi-user authorization.

TLS, public CORS policy, hosted-database hardening, WAF, or internet-abuse controls.

18. Front-End, Themes, and Accessibility
Use the existing front-end approach unless inspection shows a justified need to improve organization. Vanilla JavaScript is appropriate.

Front-end standards
Keep starter/static/main.js as the main compatible entry script. Optional helper modules may be placed under starter/static/js/.

Separate state management, board rendering, API access, and event handlers into focused functions/modules when complexity requires it.

Avoid uncontrolled global mutable state.

Use CSS variables/design tokens for colors/themes.

Use CSS grid for the Sudoku board.

Keep animations short/optional; never delay input.

Clearly display loading, save status, restore choices, errors, and completion state.

Work without external fonts, CDNs, remote images, or remote JavaScript dependencies where practical.

Themes and preferences
Support system, light, and dark themes.

Default theme is system.

Persist theme and supported gameplay preferences in SQLite local_profile.preferences_json and browser local storage.

Provide a local reset-preferences control.

High contrast and larger text are optional improvements, not mandatory Version 1 requirements.

Accessibility requirements
Full keyboard playability for core actions.

Visible focus indicators.

ARIA labels for cells, notes, keypad buttons, dialogs, and live status messages.

Screen-reader announcements for moves, conflicts, hints, timer state, save/restoration outcome, and completion.

Good color contrast in both themes.

Respect prefers-reduced-motion.

Never use color as the only indicator of state.

Use touch-friendly targets and ensure board usability at narrow widths without page-level horizontal scrolling.

Keep strings organized enough for future localization, but do not implement multilingual UI in Version 1.

19. Testing Tool Availability and Fallbacks
19.1 Baseline backend quality tools
Use these tools unless an equivalent already exists:

pytest for unit and integration tests.

pytest-cov for coverage.

ruff for linting.

black for formatting.

mypy for type checking of application-owned Python code.

The coding agent must first inspect the active Python environment and current starter/requirements.txt.

If these tools are absent but package installation is available, add them to starter/requirements-dev.txt and install/use them.

If package installation is unavailable, still create tests/configuration where feasible and clearly document which commands could not run and why.

Never claim a tool ran if it was unavailable.

19.2 Playwright conditional rule
Playwright browser tests are conditional, not a blocker for Version 1.

Detect whether Node.js and Playwright are already available or can be installed in the local development environment.

If available, add browser/UI tests for the flows in Section 19.6 and document the run command.

If unavailable, do not add Node.js, browser downloads, containers, or cloud dependencies solely to satisfy this instruction.

Instead, create starter/tests/manual_ui_checklist.md and include a documented manual verification checklist covering every UI flow in Section 19.6.

Execute the manual checklist as far as the environment permits and report results in the final handoff.

19.3 Required commands
Document and run these commands or repository-equivalent commands when the corresponding tools are available:

bash
cd starter
python -m pytest
python -m pytest --cov=. --cov-report=term-missing
ruff check .
black --check .
mypy .
If Playwright is available, document the exact local browser-test command. Do not assume a particular JavaScript package manager or test runner without detecting it first.

19.4 Minimum pass criteria
All available automated tests must pass.

ruff, black, and mypy must pass when installed/configured; narrowly scoped third-party typing limitations may be documented.

Target at least 80% coverage for Sudoku/service/persistence modules and 70% total Python coverage under starter/. Do not inflate coverage with meaningless tests.

If Playwright is available, browser tests must pass.

If Playwright is unavailable, starter/tests/manual_ui_checklist.md must be complete and the final handoff must record manual verification results.

19.5 Minimum unit and integration coverage
Test at least:

Board validation and candidate calculation.

Row, column, box conflict detection.

Solver correctness.

Unique-solution counting.

Valid/unique puzzle generation across fixed seeds.

Difficulty classification boundary behavior.

Hint selection, explanation accuracy, and reveal safety.

Exact scoring constants/formula.

Daily date/seed identity and streak behavior.

Achievement eligibility/idempotency.

Serialization/deserialization.

SQLite persistence and state_version changes.

Create, save, restore, hint, check, and finish APIs.

Changed clue rejection and malformed payloads.

Idempotent finish behavior.

State conflict responses.

Daily official-attempt uniqueness/practice-replay separation.

Normal responses never containing solution data.

19.6 Required browser/manual UI flows
Test manually or with Playwright:

Start a game and enter a value.

Keyboard navigation and deletion.

Note mode.

Undo/redo.

Complete a known near-complete puzzle.

Reload and select Resume or Discard for an active game.

Theme toggle.

Basic ARIA labels and visible keyboard focus.

Use deterministic fixtures/seeds. Never depend on internet access or timing-sensitive randomness.

20. Delivery Plan and Quality Gates
Implement in this order. Complete relevant tests before advancing.

Audit and stabilization

Inspect actual starter code and document it.

Preserve existing classic play and entry point.

Establish local configuration, database initialization approach, tests, and baseline quality tools.

Sudoku engine

Centralize constraints, candidates, solver, solution counting, seeded generation, metrics, and exact difficulty classification.

Interactive board

Add responsive rendering, keyboard/touch input, highlights, conflicts, notes, undo/redo, timer, pause, reset, browser autosave, and restore flow.

Hints, completion, and scoring

Add hints, mistakes, Flask-side completion validation, exact scoring, and completion summary.

SQLite persistence and local profile

Add schema, active-game persistence, state-version conflicts, statistics, personal records, achievements, and backup/reset documentation.

Mode rules

Add Practice, Timed, Custom, and deterministic Daily Challenge modes exactly as defined.

Polish and hardening

Complete accessibility, themes, responsive behavior, error handling, test coverage, README, and either Playwright tests or the manual UI checklist.

At the end of each phase, report:

Files changed and why.

Features completed.

Tests/quality commands run and results.

Known limitations/deferred work.

Required local setup, database initialization, reset, or dependency action.

Final quality gates
Before marking complete, verify:

The app starts from documented local steps inside starter/ and binds to localhost.

The app works without internet access.

Existing classic gameplay works end to end.

Generated puzzles are valid, unique-solution, reproducible from seed, and meet exact difficulty rules.

Solution data is absent from normal browser/API responses.

Browser autosave and SQLite restore work, including state-version conflict handling.

Completion is Flask-validated and idempotent.

Daily official-attempt, replay, and streak rules work exactly as documented.

Personal records/achievements are local-only and persisted.

Keyboard-only core gameplay works.

Board works on narrow/mobile-sized viewports.

All available test/lint/format/type/coverage requirements pass or unavailable tools are transparently documented with the required manual fallback.

Root README.md accurately documents setup, run commands, tests, local database behavior, timezone behavior, backup/reset, and troubleshooting.

21. Future Ideas — Do Not Implement Now
These are excluded from Version 1. Do not create routes, models, database tables, UI pages, APIs, placeholder controls, or external integrations for them.

Diagonal, killer, jigsaw, 4×4, and 16×16 Sudoku variants.

Advanced strategy visualizer and comprehensive step-by-step tutorial.

Rich local AI-style coaching beyond required hints.

Puzzle import/export, printable sheets, or PDF export.

Multiple local profiles on one computer.

Cloud sync or hosted deployment.

Public accounts, social features, multiplayer, global leaderboards, tournaments, friends, chat, and messaging.

Native mobile packaging.

Monetization, payments, subscriptions, advertisements, analytics, or telemetry.

Keep code understandable/modular, but do not over-engineer for these ideas.

22. Final Handoff
At completion, provide a concise engineering handoff containing:

Actual final project layout, with confirmation that application code remains under starter/.

Architecture overview and main module responsibilities.

Exact installation and run commands, including the working-directory requirement.

Python version and dependencies used.

SQLite location, initialization, backup, reset, and recovery instructions.

Local timezone/Daily Challenge behavior.

Test, coverage, formatting, linting, and type-check commands, including which ran and results.

Playwright availability result or manual UI-checklist results.

Implemented feature list and local API summary.

Explanation of generation, difficulty classification, autosave/restore, hints, scoring, mode rules, Daily Challenge, streaks, statistics, and achievements.

Privacy/security measures appropriate to localhost-only use.

Generation-failure observations for each difficulty and known limitations.

Explicitly deferred future ideas.

Do not mark a feature complete merely because a visible UI control exists. Verify the underlying game logic, Flask-side validation, persistence where required, error handling, offline operation, and applicable automated/manual tests.