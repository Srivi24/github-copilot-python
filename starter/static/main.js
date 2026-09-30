const SIZE = 9;
const ALT_BLOCKS = new Set([2, 4, 6, 8]);
let puzzle = [];
let timer = 0;
let timerId = null;
let hintCount = 0;
let hintsRemaining = 0;
let scoreSaved = false;
let hintRequestInProgress = false;
let boardHistory = [];
let historyIndex = -1;
let pointerDownSelection = null;
let incorrectTimeoutId = null;
let messageTimeoutId = null;
let messageExitTimeoutId = null;
let messageReturnFocus = null;
let horizontalDirection = 'left';
let verticalDirection = 'top';
let hintFlow = 'horizontal';
let puzzleEmptyCount = 0;
const HISTORY_LIMIT = 100;

function isAltBlock(row, col) {
  const blockNumber = (Math.floor(row / 3) * 3) + Math.floor(col / 3) + 1;
  return ALT_BLOCKS.has(blockNumber);
}

function selectCell(selectedInput) {
  if (!selectedInput) return;
  const selectedRow = Number(selectedInput.dataset.row);
  const selectedCol = Number(selectedInput.dataset.col);

  document.querySelectorAll('.sudoku-cell').forEach((input) => {
    const row = Number(input.dataset.row);
    const col = Number(input.dataset.col);
    const sharesBox = Math.floor(row / 3) === Math.floor(selectedRow / 3)
      && Math.floor(col / 3) === Math.floor(selectedCol / 3);
    const isSelected = input === selectedInput;

    input.classList.toggle('is-focused', isSelected);
    input.classList.toggle('is-related', !isSelected && (
      row === selectedRow || col === selectedCol || sharesBox
    ));
  });
}

function clearCellSelection() {
  if (
    document.activeElement instanceof HTMLElement
    && document.activeElement.classList.contains('sudoku-cell')
  ) {
    document.activeElement.blur();
  }

  document.querySelectorAll('.sudoku-cell').forEach((input) => {
    input.classList.remove('is-focused', 'is-related');
  });
}

function setMessage(text, isSuccess = false) {
  const el = document.getElementById('message');
  clearTimeout(messageTimeoutId);
  clearTimeout(messageExitTimeoutId);
  if (!text) {
    dismissMessage();
    return;
  }

  const activeElement = document.activeElement;
  messageReturnFocus = activeElement instanceof HTMLElement && !el.contains(activeElement)
    ? activeElement
    : null;
  document.getElementById('message-text').textContent = text;
  el.classList.toggle('success', isSuccess);
  el.classList.toggle('error', !isSuccess);
  el.classList.remove('message-enter', 'message-exit');
  el.hidden = false;
  void el.offsetWidth;
  el.classList.add('message-enter');
  messageTimeoutId = setTimeout(dismissMessage, 5000);
}

function dismissMessage() {
  clearTimeout(messageTimeoutId);
  const el = document.getElementById('message');
  if (el.hidden || el.classList.contains('message-exit')) return;

  const activeElement = document.activeElement;
  if (activeElement instanceof HTMLElement && el.contains(activeElement)) {
    if (messageReturnFocus instanceof HTMLElement && messageReturnFocus.isConnected) {
      messageReturnFocus.focus();
    } else {
      activeElement.blur();
    }
  }
  messageTimeoutId = null;
  el.classList.remove('message-enter');
  el.classList.add('message-exit');
  const exitDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220;
  messageExitTimeoutId = setTimeout(() => {
    el.hidden = true;
    el.classList.remove('success', 'error', 'message-exit');
    messageExitTimeoutId = null;
    messageReturnFocus = null;
  }, exitDuration);
}

function renderTimer() {
  const minutes = String(Math.floor(timer / 60)).padStart(2, '0');
  const seconds = String(timer % 60).padStart(2, '0');
  document.getElementById('timer').textContent = `${minutes}:${seconds}`;
}

function startTimer() {
  clearInterval(timerId);
  timer = 0;
  renderTimer();
  timerId = setInterval(() => {
    timer += 1;
    renderTimer();
  }, 1000);
}

/**
 * Removes the `is-conflict` highlight from every cell on the board.
 * Called before each recompute, on clear-board, and on new-puzzle load.
 */
function clearAllConflicts() {
  document.querySelectorAll('.sudoku-cell').forEach((input) => {
    input.classList.remove('is-conflict');
    input.removeAttribute('aria-invalid');
  });
}

/**
 * Performs a real-time Sudoku-rule conflict check across the entire board.
 *
 * After each edit this function:
 *   1. Clears all existing `is-conflict` marks.
 *   2. Iterates every filled cell; for each cell it checks every other filled
 *      cell in the same row, column, or 3×3 box.
 *   3. When two peers share the same digit, both are marked `is-conflict` and
 *      `aria-invalid="true"`.
 *
 * The result is a fully consistent conflict map – not just the cell that was
 * just edited – so removing a value that was hiding a pre-existing conflict
 * in another pair is handled correctly.
 *
 * @param {HTMLInputElement} _changedInput - The cell that triggered the check
 *   (unused directly; kept for potential future per-cell optimisation).
 */
function checkLiveConflicts(_changedInput) {
  // Recompute from scratch for correctness.
  clearAllConflicts();

  const allInputs = Array.from(document.querySelectorAll('.sudoku-cell'));

  for (let i = 0; i < allInputs.length; i++) {
    const source = allInputs[i];
    const sourceVal = source.value.trim();
    if (!sourceVal) continue; // empty cell – nothing to conflict

    const sourceRow = Number(source.dataset.row);
    const sourceCol = Number(source.dataset.col);

    for (let j = i + 1; j < allInputs.length; j++) {
      const peer = allInputs[j];
      const peerVal = peer.value.trim();
      if (peerVal !== sourceVal) continue; // different digit

      const peerRow = Number(peer.dataset.row);
      const peerCol = Number(peer.dataset.col);

      const sharesRow = peerRow === sourceRow;
      const sharesCol = peerCol === sourceCol;
      const sharesBox =
        Math.floor(peerRow / 3) === Math.floor(sourceRow / 3) &&
        Math.floor(peerCol / 3) === Math.floor(sourceCol / 3);

      if (sharesRow || sharesCol || sharesBox) {
        source.classList.add('is-conflict');
        source.setAttribute('aria-invalid', 'true');
        peer.classList.add('is-conflict');
        peer.setAttribute('aria-invalid', 'true');
      }
    }
  }

  const conflictCount = document.querySelectorAll('.sudoku-cell.is-conflict').length;
  const feedback = document.getElementById('board-feedback');
  feedback.dataset.state = conflictCount ? 'conflict' : 'clear';
  document.getElementById('board-feedback-text').textContent = conflictCount
    ? `${conflictCount} cells in conflict`
    : 'No conflicts';

  const filledCount = allInputs.filter((input) => (
    input.classList.contains('hinted') || (!input.readOnly && input.value.trim())
  )).length;
  const progress = document.getElementById('entry-progress');
  progress.max = Math.max(puzzleEmptyCount, 1);
  progress.value = filledCount;
  document.getElementById('entry-progress-text').textContent = `${filledCount} / ${puzzleEmptyCount}`;
}

function captureBoardState() {
  const state = {};
  document.querySelectorAll('.sudoku-cell').forEach((input) => {
    if (input.readOnly) return;
    const cellKey = `${input.dataset.row}-${input.dataset.col}`;
    state[cellKey] = input.value;
  });
  return state;
}

function removeCellFromBoardHistory(input) {
  const cellKey = `${input.dataset.row}-${input.dataset.col}`;
  boardHistory.forEach((state) => {
    delete state[cellKey];
  });

  const currentIndex = historyIndex;
  const compactedHistory = [];
  let compactedIndex = 0;
  boardHistory.forEach((state, index) => {
    const previousState = compactedHistory[compactedHistory.length - 1];
    const cellKeys = Object.keys(state);
    const isDuplicate = previousState
      && cellKeys.length === Object.keys(previousState).length
      && cellKeys.every((key) => state[key] === previousState[key]);

    if (isDuplicate) {
      if (index === currentIndex) compactedIndex = compactedHistory.length - 1;
      return;
    }

    compactedHistory.push(state);
    if (index === currentIndex) compactedIndex = compactedHistory.length - 1;
  });
  boardHistory = compactedHistory;
  historyIndex = compactedIndex;
  updateActionAvailability();
}

function updateActionAvailability() {
  const hintsExhausted = hintsRemaining <= 0;
  const hintUnavailable = hintsExhausted || hintRequestInProgress;
  document.getElementById('hint-solution').disabled = hintUnavailable;
  document.getElementById('hint-options-toggle').disabled = hintUnavailable;
  document.getElementById('undo-action').disabled = hintsExhausted || historyIndex <= 0;
  document.getElementById('redo-action').disabled = hintsExhausted || historyIndex >= boardHistory.length - 1;
  document.getElementById('clear-board').disabled = hintsExhausted;
}

function updateResetVisibility() {
  document.getElementById('reset-game').disabled = hintCount === 0 && !scoreSaved;
}

function resetBoardHistory() {
  boardHistory = [captureBoardState()];
  historyIndex = 0;
  updateActionAvailability();
}

function recordBoardState() {
  const state = captureBoardState();
  const previousState = boardHistory[historyIndex];
  const cellKeys = Object.keys(state);
  if (
    previousState
    && cellKeys.length === Object.keys(previousState).length
    && cellKeys.every((cellKey) => state[cellKey] === previousState[cellKey])
  ) return;

  boardHistory = boardHistory.slice(0, historyIndex + 1);
  boardHistory.push(state);
  if (boardHistory.length > HISTORY_LIMIT) boardHistory.shift();
  historyIndex = boardHistory.length - 1;
  updateActionAvailability();
}

function restoreBoardState(state) {
  document.querySelectorAll('.sudoku-cell').forEach((input) => {
    const cellKey = `${input.dataset.row}-${input.dataset.col}`;
    if (!input.readOnly) input.value = state[cellKey] || '';
  });
  checkLiveConflicts();
}

function undoMove() {
  if (historyIndex <= 0) return;
  historyIndex -= 1;
  restoreBoardState(boardHistory[historyIndex]);
  updateActionAvailability();
}

function redoMove() {
  if (historyIndex >= boardHistory.length - 1) return;
  historyIndex += 1;
  restoreBoardState(boardHistory[historyIndex]);
  updateActionAvailability();
}

function findNextHintInput() {
  const inputs = Array.from(document.querySelectorAll('.sudoku-cell:not([readonly])'))
    .filter((input) => !input.value.trim());
  inputs.sort((first, second) => {
    const firstRow = Number(first.dataset.row);
    const firstCol = Number(first.dataset.col);
    const secondRow = Number(second.dataset.row);
    const secondCol = Number(second.dataset.col);

    const rowOrder = verticalDirection === 'top' ? firstRow - secondRow : secondRow - firstRow;
    const columnOrder = horizontalDirection === 'left' ? firstCol - secondCol : secondCol - firstCol;
    return hintFlow === 'horizontal'
      ? rowOrder || columnOrder
      : columnOrder || rowOrder;
  });
  return inputs[0] || null;
}

function setHintMenuOpen(isOpen) {
  const toggle = document.getElementById('hint-options-toggle');
  document.getElementById('hint-options-menu').hidden = !isOpen;
  toggle.setAttribute('aria-expanded', String(isOpen));
}

function buildBoard() {
  const board = document.getElementById('sudoku-board');
  board.innerHTML = '';
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'sudoku-cell';
      input.dataset.row = String(row);
      input.dataset.col = String(col);
      if (isAltBlock(row, col)) {
        input.classList.add('box-alt');
      }
      input.setAttribute('aria-label', `Row ${row + 1}, column ${col + 1}`);
      input.addEventListener('focus', () => {
        if (!input.readOnly) selectCell(input);
      });
      input.addEventListener('pointerdown', (event) => {
        if (input.readOnly) event.preventDefault();
      });
      input.addEventListener('input', (event) => {
        const value = event.target.value.replace(/[^1-9]/g, '');
        event.target.value = value;
        // Live Input Feedback: immediately highlight conflicting peer cells.
        checkLiveConflicts(event.target);
        recordBoardState();
      });
      input.addEventListener('keydown', (event) => {
        const directions = {
          ArrowLeft: [0, -1],
          ArrowRight: [0, 1],
          ArrowUp: [-1, 0],
          ArrowDown: [1, 0],
        };
        const direction = directions[event.key];
        if (direction && !input.readOnly) {
          event.preventDefault();
          let row = Number(input.dataset.row) + direction[0];
          let col = Number(input.dataset.col) + direction[1];
          while (row >= 0 && row < SIZE && col >= 0 && col < SIZE) {
            const nextInput = document.querySelector(
              `.sudoku-cell[data-row="${row}"][data-col="${col}"]`,
            );
            if (!nextInput.readOnly) {
              nextInput.focus();
              return;
            }
            row += direction[0];
            col += direction[1];
          }
          return;
        }

        if ((event.key === 'Backspace' || event.key === 'Delete') && !input.readOnly) {
          event.preventDefault();
          input.value = '';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
      board.appendChild(input);
    }
  }
}

function renderPuzzle(puz) {
  puzzle = puz;
  puzzleEmptyCount = puz.flat().filter((value) => value === 0).length;
  buildBoard();
  const inputs = document.querySelectorAll('.sudoku-cell');
  inputs.forEach((input) => {
    const row = Number(input.dataset.row);
    const col = Number(input.dataset.col);
    const value = puzzle[row][col];
    input.value = value === 0 ? '' : String(value);
    input.readOnly = value !== 0;
    input.classList.toggle('prefilled', value !== 0);
    input.classList.toggle('non-fixed', value == '');
    input.classList.remove('incorrect', 'is-conflict');
  });
  resetBoardHistory();
  checkLiveConflicts();
}

function readBoardFromUI() {
  const board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  const inputs = document.querySelectorAll('.sudoku-cell');
  inputs.forEach((input) => {
    const row = Number(input.dataset.row);
    const col = Number(input.dataset.col);
    const value = input.value.trim();
    board[row][col] = value === '' ? 0 : Number(value);
  });
  return board;
}

function updateTopScores() {
  const scores = JSON.parse(localStorage.getItem('sudoku-top-10') || '[]');
  const tbody = document.getElementById('top-scores');
  tbody.innerHTML = '';
  if (!scores.length) {
    const row = document.createElement('tr');
    row.className = 'empty-row';
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.textContent = 'No scores yet';
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }
  scores.forEach((entry, index) => {
    const row = document.createElement('tr');
    const rankCell = document.createElement('td');
    rankCell.textContent = String(index + 1);
    const nameCell = document.createElement('td');
    nameCell.textContent = entry.name;
    const difficultyCell = document.createElement('td');
    difficultyCell.textContent = entry.difficulty;
    const timeCell = document.createElement('td');
    timeCell.textContent = `${entry.time}s`;
    const hintsCell = document.createElement('td');
    hintsCell.textContent = String(entry.hints);

    row.append(rankCell, nameCell, difficultyCell, timeCell, hintsCell);
    tbody.appendChild(row);
  });
}

function saveScore(name) {
  const scores = JSON.parse(localStorage.getItem('sudoku-top-10') || '[]');
  scores.push({
    name: name.trim() || 'Player',
    difficulty: document.getElementById('difficulty-select').value,
    time: timer,
    hints: hintCount,
  });
  scores.sort((a, b) => a.time - b.time || a.hints - b.hints);
  localStorage.setItem('sudoku-top-10', JSON.stringify(scores.slice(0, 10)));
  updateTopScores();
}

function openScoreEntry() {
  const difficulty = document.getElementById('difficulty-select').value;
  const minutes = String(Math.floor(timer / 60)).padStart(2, '0');
  const seconds = String(timer % 60).padStart(2, '0');
  document.getElementById('score-entry-difficulty').textContent = `${difficulty[0].toUpperCase()}${difficulty.slice(1)}`;
  document.getElementById('score-entry-summary').textContent = `${minutes}:${seconds} | ${hintCount} ${hintCount === 1 ? 'hint' : 'hints'}`;
  document.getElementById('score-entry-name').value = '';
  document.getElementById('score-entry-dialog').showModal();
}

async function newGame() {
  const difficulty = document.getElementById('difficulty-select').value;
  const response = await fetch(`/new?difficulty=${encodeURIComponent(difficulty)}`);
  const data = await response.json();
  if (data.error) {
    setMessage(data.error, false);
    return;
  }
  hintsRemaining = Number.isInteger(data.remaining_hints)
    ? data.remaining_hints
    : data.puzzle.flat().filter((value) => value === 0).length;
  renderPuzzle(data.puzzle);
  startTimer();
  hintCount = 0;
  scoreSaved = false;
  document.getElementById('hint-count').textContent = String(hintCount);
  document.getElementById('check-solution').disabled = false;
  updateResetVisibility();
  setMessage('New puzzle ready.', true);
}

async function checkSolution() {
  const board = readBoardFromUI();
  const response = await fetch('/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ board }),
  });
  const data = await response.json();
  const inputs = document.querySelectorAll('.sudoku-cell');
  clearTimeout(incorrectTimeoutId);
  inputs.forEach((input) => {
    if (input.readOnly) return;
    input.classList.remove('incorrect');
  });

  if (data.error) {
    setMessage(data.error, false);
    return;
  }

  const incorrectSet = new Set(data.incorrect.map(([row, col]) => row * SIZE + col));
  inputs.forEach((input) => {
    if (input.readOnly) return;
    const idx = Number(input.dataset.row) * SIZE + Number(input.dataset.col);
    if (incorrectSet.has(idx)) {
      input.classList.add('incorrect');
    }
  });

  incorrectTimeoutId = setTimeout(() => {
    document.querySelectorAll('.sudoku-cell.incorrect').forEach((input) => {
      input.classList.remove('incorrect');
    });
    incorrectTimeoutId = null;
  }, 5000);

  if (data.solved) {
    clearInterval(timerId);
    setMessage(`Congratulations! You solved it in ${timer} seconds.`, true);
    openScoreEntry();
  } else {
    setMessage(data.message || 'Some cells are incorrect.', false);
  }
}

async function requestHint() {
  if (hintRequestInProgress) return;

  let focusedInput = document.querySelector('.sudoku-cell.is-focused');
  if (focusedInput?.readOnly) {
    clearCellSelection();
    focusedInput = null;
  }
  const targetInput = focusedInput && !focusedInput.value.trim()
    ? focusedInput
    : findNextHintInput();
  if (!targetInput) {
    hintsRemaining = 0;
    updateActionAvailability();
    setMessage('No cells are available for a hint.', false);
    return;
  }

  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      row: Number(targetInput.dataset.row),
      col: Number(targetInput.dataset.col),
      board: readBoardFromUI(),
    }),
  };
  hintRequestInProgress = true;
  targetInput.readOnly = true;
  let hintApplied = false;
  updateActionAvailability();
  try {
    const response = await fetch('/hint', requestOptions);
    const data = await response.json();
    if (data.error) {
      if (Number.isInteger(data.remaining_hints)) {
        hintsRemaining = data.remaining_hints;
        updateActionAvailability();
      }
      setMessage(data.error, false);
      return;
    }
    hintCount += 1;
    hintsRemaining = data.remaining_hints;
    document.getElementById('hint-count').textContent = String(hintCount);
    updateResetVisibility();
    updateActionAvailability();
    const input = document.querySelector(`.sudoku-cell[data-row="${data.row}"][data-col="${data.col}"]`);
    if (input) {
      input.value = String(data.value);
      input.readOnly = true;
      removeCellFromBoardHistory(input);
      input.classList.remove('incorrect');
      input.classList.add('prefilled');
      input.classList.add('hinted');
      input.classList.remove('non-fixed');
      checkLiveConflicts(input);
      hintApplied = true;
      if (input.classList.contains('is-focused')) clearCellSelection();
    }
    setMessage(data.message, true);
  } catch {
    setMessage('Could not retrieve a hint. Please try again.', false);
  } finally {
    if (!hintApplied) targetInput.readOnly = false;
    hintRequestInProgress = false;
    updateActionAvailability();
  }
}

function clearBoard() {
  const inputs = document.querySelectorAll('.sudoku-cell');
  inputs.forEach((input) => {
    if (!input.readOnly) {
      input.value = '';
      input.classList.remove('incorrect', 'is-conflict');
      input.removeAttribute('aria-invalid');
    }
  });
  checkLiveConflicts();
  recordBoardState();
}

async function resetGame() {
  const resetButton = document.getElementById('reset-game');
  resetButton.disabled = true;
  try {
    const response = await fetch('/reset', { method: 'POST' });
    const data = await response.json();
    if (data.error) {
      setMessage(data.error, false);
      return;
    }

    clearTimeout(incorrectTimeoutId);
    incorrectTimeoutId = null;
    clearCellSelection();
    setHintMenuOpen(false);
    hintsRemaining = data.remaining_hints;
    renderPuzzle(data.puzzle);
    hintCount = 0;
    document.getElementById('hint-count').textContent = String(hintCount);
    document.getElementById('check-solution').disabled = false;
    startTimer();
    updateResetVisibility();
    setMessage('Puzzle restarted.', true);
  } catch {
    setMessage('Could not restart the puzzle. Please try again.', false);
  } finally {
    resetButton.disabled = false;
  }
}

function toggleTheme() {
  const body = document.body;
  const isDark = body.dataset.theme === 'dark';
  body.dataset.theme = isDark ? 'light' : 'dark';
  document.getElementById('theme-toggle').setAttribute('aria-checked', String(!isDark));
  localStorage.setItem('sudoku-theme', body.dataset.theme);
}

window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('sudoku-theme') || 'light';
  document.body.dataset.theme = savedTheme;
  document.getElementById('theme-toggle').setAttribute('aria-checked', String(savedTheme === 'dark'));

  buildBoard();
  const board = document.getElementById('sudoku-board');
  const hintControl = document.getElementById('hint-control');
  const hintMenu = document.getElementById('hint-options-menu');
  const hintToggle = document.getElementById('hint-options-toggle');
  document.addEventListener('pointerdown', (event) => {
    const pressedCell = event.target instanceof Element
      ? event.target.closest('.sudoku-cell')
      : null;
    pointerDownSelection = pressedCell
      ? { cell: pressedCell, wasSelected: pressedCell.classList.contains('is-focused') }
      : null;
  });
  document.addEventListener('click', (event) => {
    const clickedCell = event.target instanceof Element
      ? event.target.closest('.sudoku-cell')
      : null;
    if (!(event.target instanceof Node)) {
      clearCellSelection();
    } else if (!board.contains(event.target) && !hintControl.contains(event.target)) {
      clearCellSelection();
    } else if (!clickedCell) {
      pointerDownSelection = null;
    } else if (clickedCell.readOnly) {
      pointerDownSelection = null;
    } else if (
      pointerDownSelection?.cell === clickedCell
      && pointerDownSelection.wasSelected
    ) {
      clearCellSelection();
    } else {
      selectCell(clickedCell);
    }
    pointerDownSelection = null;
  });
  ['pointerdown', 'mousedown', 'click', 'contextmenu'].forEach((eventName) => {
    board.addEventListener(eventName, (event) => {
    const clickedCell = event.target instanceof Element
      ? event.target.closest('.sudoku-cell')
      : null;
    if (clickedCell?.readOnly) {
      if (event.cancelable) event.preventDefault();
      event.stopPropagation();
    }
    }, true);
  });
  ['copy', 'cut', 'contextmenu'].forEach((eventName) => {
    board.addEventListener(eventName, (event) => event.preventDefault());
  });
  updateTopScores();
  startTimer();
  const leaderboardDialog = document.getElementById('leaderboard-dialog');
  document.getElementById('leaderboard-open').addEventListener('click', () => {
    leaderboardDialog.showModal();
  });
  document.getElementById('leaderboard-close').addEventListener('click', () => {
    leaderboardDialog.close();
  });
  leaderboardDialog.addEventListener('click', (event) => {
    if (event.target === leaderboardDialog) leaderboardDialog.close();
  });
  const scoreEntryDialog = document.getElementById('score-entry-dialog');
  document.getElementById('score-entry-form').addEventListener('submit', (event) => {
    event.preventDefault();
    saveScore(document.getElementById('score-entry-name').value);
    scoreSaved = true;
    updateResetVisibility();
    scoreEntryDialog.close();
    document.getElementById('undo-action').disabled = true;
    document.getElementById('redo-action').disabled = true;
    document.getElementById('hint-solution').disabled = true;
    document.getElementById('hint-options-toggle').disabled = true;
    document.getElementById('clear-board').disabled = true;
    document.getElementById('check-solution').disabled = true;
  });
  document.getElementById('score-entry-cancel').addEventListener('click', () => {
    scoreEntryDialog.close();
  });
  scoreEntryDialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      scoreEntryDialog.close();
    }
  });
  scoreEntryDialog.addEventListener('click', (event) => {
    if (event.target === scoreEntryDialog) scoreEntryDialog.close();
  });
  document.getElementById('undo-action').addEventListener('click', undoMove);
  document.getElementById('redo-action').addEventListener('click', redoMove);
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  document.getElementById('hint-solution').addEventListener('click', requestHint);
  hintToggle.addEventListener('click', () => setHintMenuOpen(hintMenu.hidden));
  hintMenu.addEventListener('change', (event) => {
    if (event.target instanceof HTMLInputElement) {
      if (event.target.name === 'horizontal-direction') {
        horizontalDirection = event.target.value;
      } else if (event.target.name === 'vertical-direction') {
        verticalDirection = event.target.value;
      } else if (event.target.name === 'hint-flow') {
        hintFlow = event.target.value;
      }
    }
  });
  document.addEventListener('click', (event) => {
    if (
      event.target instanceof Node
      && !hintMenu.contains(event.target)
      && !hintToggle.contains(event.target)
    ) {
      setHintMenuOpen(false);
    }
  });
  document.getElementById('clear-board').addEventListener('click', clearBoard);
  document.getElementById('reset-game').addEventListener('click', resetGame);
  document.getElementById('message-dismiss').addEventListener('click', dismissMessage);
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (!(event.ctrlKey || event.metaKey) || event.altKey || (key !== 'z' && key !== 'y')) return;
    event.preventDefault();
    if (key === 'y' || (event.shiftKey && key === 'z')) redoMove();
    else undoMove();
  });
  newGame();
});