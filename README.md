# Sudoku

A single-player Sudoku game built with Python, Flask, HTML, CSS, and JavaScript. It runs locally in your browser and generates classic 9×9 puzzles with a unique solution.

## Features

- **Four difficulty levels:** Easy, Medium, Hard, and Expert.
- **Puzzle generation and solving:** Sudoku validation, candidate calculation, a backtracking solver, solution counting, seeded generation for tests, and difficulty classification are implemented in Python.
- **Unique-solution puzzles:** The generator checks puzzle solution counts and only returns puzzles with exactly one solution.
- **Interactive board:** Enter digits 1–9, select cells with a mouse or touch, and move between editable cells with the arrow keys. Selected cells and their row, column, and 3×3 box are highlighted.
- **Live conflict feedback:** Duplicate values in a row, column, or box are highlighted as you enter them.
- **Hints:** Get the solution value for the selected editable cell, or configure the traversal direction and flow used to choose a cell when none is selected. Hint-filled cells have a distinct style and become locked.
- **Answer checking:** Check the current board against the puzzle solution. Incorrect cells are highlighted; a solved puzzle stops the timer and opens the score-entry dialog.
- **Undo and redo:** Use the on-screen buttons or `Ctrl`/`Cmd`+`Z` to undo and `Ctrl`/`Cmd`+`Y` or `Shift`+`Ctrl`/`Cmd`+`Z` to redo player entries.
- **Clear and restart:** Clear removes editable player entries. Restart restores the original puzzle and resets the timer, hints, and move history.
- **Timer and progress:** Track elapsed time and the number of puzzle cells filled by player entries or hints.
- **Personal top-10 scoreboard:** Completed scores include player name, difficulty, time, and hints used. The best times are kept in browser storage, with fewer hints breaking ties.
- **Light and dark themes:** Toggle the theme; the preference is remembered in browser storage.
- **Responsive interface:** The layout adapts to desktop and mobile screens and includes status messages, accessible labels, and dialogs for score entry and the leaderboard.

## Requirements

- Python 3; the project was checked with Python 3.12.10.
- Flask 2.0 or newer, as specified in [`starter/requirements.txt`](starter/requirements.txt). The installed version used for verification was Flask 3.1.3.
- A modern browser with JavaScript enabled.

The application has no third-party frontend dependencies and does not need an internet connection after Flask is installed.

## Run Locally

From the repository root, create and activate a virtual environment, install the dependency, and start the app:

### Windows PowerShell

```powershell
cd starter
py -3 -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python app.py
```

### macOS or Linux

```bash
cd starter
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python app.py
```

Open [http://127.0.0.1:5000](http://127.0.0.1:5000) in your browser. The Flask app binds to `127.0.0.1` and is intended for local use.

## Playing

1. Choose a difficulty from the selector and select **New Game**.
2. Click or tap an editable cell and enter a digit from 1 to 9. Use an arrow key to move to another editable cell. Backspace or Delete clears the selected entry.
3. Use **Hint** to fill a selected cell. To control which cell is chosen when no editable cell is selected, open the Hint options and set horizontal direction, vertical direction, and flow. Defaults are left, top, and horizontal-first.
4. Select **Check** to check the board. A completed correct board opens the score form.
5. Use **Undo**, **Redo**, **Clear**, or **Restart** while playing. Restart returns to the original puzzle; **New Game** generates a different puzzle.

Hints, Clear, Undo, and Redo become unavailable when no hint cells remain. After saving a score, Clear, Undo, Redo, Hint, and Check are disabled for that completed game; Restart remains available.

## Project Structure

```text
.
├── .gitignore
├── CODEOWNERS
├── LICENSE.txt
├── README.md
└── starter/
    ├── app.py                 # Flask app, routes, and active game state
    ├── requirements.txt       # Python dependencies
    ├── sudoku_logic.py        # Sudoku validation, solver, and puzzle generator
    ├── static/
    │   ├── main.js            # Board interaction and browser-side features
    │   └── styles.css         # Themes, board styling, and responsive layout
    ├── templates/
    │   └── index.html         # Game interface
    └── tests/
        ├── test_app.py
        └── test_sudoku_logic.py
```

`starter/instruction.md` is a project-planning brief, not part of the runnable application; its roadmap may include ideas that are not implemented. The virtual environment, Python bytecode, and pytest caches are local generated files and are excluded from this tree.

## How It Works

- The board is represented in Python as a 9×9 list of integers; `0` represents an empty cell.
- `sudoku_logic.py` validates board shape and Sudoku constraints, calculates candidates, solves boards, counts solutions, and generates puzzles.
- Flask serves the page and exposes these routes:
  - `GET /` renders the game.
  - `GET /new?difficulty=<level>` generates a puzzle.
  - `POST /hint` fills a requested empty cell, or the first empty cell if no coordinates are supplied.
  - `POST /check` checks submitted values against the active solution.
  - `POST /reset` restores the original puzzle for the active game.
- The browser renders the board and handles input, selection, conflict styling, move history, timer, dialogs, and theme changes.

## Data and Current Limitations

- The active puzzle, original puzzle, solution, and selected difficulty are held in the Flask process's in-memory `CURRENT` state. They are not persisted across a server restart, and this simple global state is intended for one local player and one active game at a time.
- The theme and top-10 scores are stored in the browser's `localStorage`. Clearing browser data removes them. Scores are local to that browser profile and are not shared or backed up.
- There is no database, account system, multiplayer, cloud service, pause control, or automatic recovery of an active game.
- Run only as a local development app. `app.py` enables Flask debug mode; do not expose it to a public network or use it as a production deployment.

## Tests

Run the test suite from the `starter` directory so the application modules are on Python's import path:

```bash
cd starter
python -m pytest -q
```

The tests cover Sudoku validation and solving, unique puzzle generation across difficulty levels, hint behavior, and puzzle reset behavior. Pytest is a test-only dependency and is not currently listed in `requirements.txt`; install it separately if needed:

```bash
python -m pip install pytest
```

For future changes, keep runnable application files under `starter/`, preserve `python app.py` as the local entry point, and add focused tests for each behavior change. Persistence and other planned capabilities should be documented as implemented only after they exist in the app.
