import copy
import random
from typing import List, Optional, Tuple

SIZE = 9
BOX = 3
EMPTY = 0

DIFFICULTY_CLUES = {
    "easy": 40,
    "medium": 34,
    "hard": 28,
    "expert": 24,
}


def deep_copy(board: List[List[int]]) -> List[List[int]]:
    return copy.deepcopy(board)


def create_empty_board() -> List[List[int]]:
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]


def is_valid_board_shape(board: List[List[int]]) -> bool:
    if not isinstance(board, list) or len(board) != SIZE:
        return False
    for row in board:
        if not isinstance(row, list) or len(row) != SIZE:
            return False
        for value in row:
            if not isinstance(value, int) or value < 0 or value > SIZE:
                return False
    return True


def is_safe(board: List[List[int]], row: int, col: int, num: int) -> bool:
    if num == EMPTY:
        return True
    for x in range(SIZE):
        if board[row][x] == num and x != col:
            return False
    for y in range(SIZE):
        if board[y][col] == num and y != row:
            return False
    start_row = (row // BOX) * BOX
    start_col = (col // BOX) * BOX
    for r in range(start_row, start_row + BOX):
        for c in range(start_col, start_col + BOX):
            if (r != row or c != col) and board[r][c] == num:
                return False
    return True


def get_candidates(board: List[List[int]], row: int, col: int) -> List[int]:
    if board[row][col] != EMPTY:
        return []
    return [num for num in range(1, SIZE + 1) if is_safe(board, row, col, num)]


def has_conflict(board: List[List[int]], row: int, col: int, num: int) -> bool:
    if num == EMPTY:
        return False
    return not is_safe(board, row, col, num)


def is_complete(board: List[List[int]]) -> bool:
    if not is_valid_board_shape(board):
        return False
    for row in board:
        if EMPTY in row:
            return False
    return all(
        not has_conflict(board, row, col, board[row][col])
        for row in range(SIZE)
        for col in range(SIZE)
    )


def find_empty_cell(board: List[List[int]]) -> Optional[Tuple[int, int]]:
    best_cell = None
    best_options = None
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                options = get_candidates(board, row, col)
                if best_options is None or len(options) < len(best_options):
                    best_cell = (row, col)
                    best_options = options
                    if len(options) == 1:
                        return best_cell
    return best_cell


def _can_place_all(board: List[List[int]]) -> bool:
    for row in range(SIZE):
        for col in range(SIZE):
            value = board[row][col]
            if value == EMPTY:
                continue
            if has_conflict(board, row, col, value):
                return False
    return True


def solve_board(board: List[List[int]]) -> Optional[List[List[int]]]:
    if not is_valid_board_shape(board):
        return None
    if not _can_place_all(board):
        return None

    working = deep_copy(board)

    def backtrack() -> bool:
        empty_cell = find_empty_cell(working)
        if empty_cell is None:
            return True
        row, col = empty_cell
        for candidate in get_candidates(working, row, col):
            working[row][col] = candidate
            if backtrack():
                return True
            working[row][col] = EMPTY
        return False

    if backtrack():
        return working
    return None


def count_solutions(board: List[List[int]], limit: int = 2) -> int:
    if not is_valid_board_shape(board):
        return 0
    if not _can_place_all(board):
        return 0

    working = deep_copy(board)
    solutions = 0

    def backtrack() -> None:
        nonlocal solutions
        if solutions >= limit:
            return
        empty_cell = find_empty_cell(working)
        if empty_cell is None:
            solutions += 1
            return
        row, col = empty_cell
        for candidate in get_candidates(working, row, col):
            working[row][col] = candidate
            backtrack()
            if solutions >= limit:
                working[row][col] = EMPTY
                return
            working[row][col] = EMPTY

    backtrack()
    return solutions


def fill_board(board: List[List[int]], randomizer: random.Random) -> bool:
    empty_cell = find_empty_cell(board)
    if empty_cell is None:
        return True
    row, col = empty_cell
    candidates = list(range(1, SIZE + 1))
    randomizer.shuffle(candidates)
    for value in candidates:
        if is_safe(board, row, col, value):
            board[row][col] = value
            if fill_board(board, randomizer):
                return True
            board[row][col] = EMPTY
    return False


def make_full_board(seed: Optional[int] = None) -> List[List[int]]:
    rng = random.Random(seed)
    board = create_empty_board()
    if fill_board(board, rng):
        return board
    raise ValueError("Unable to generate a valid completed Sudoku board.")


def remove_cells(board: List[List[int]], target_clues: int, randomizer: random.Random) -> None:
    positions = [(row, col) for row in range(SIZE) for col in range(SIZE)]
    randomizer.shuffle(positions)
    clues_left = SIZE * SIZE
    for row, col in positions:
        if clues_left <= target_clues:
            break
        original = board[row][col]
        board[row][col] = EMPTY
        if count_solutions(board, limit=2) != 1:
            board[row][col] = original
        else:
            clues_left -= 1


def classify_puzzle(board: List[List[int]]) -> dict:
    empty_cells = sum(cell == EMPTY for row in board for cell in row)
    if empty_cells >= 45:
        label = "Easy"
    elif empty_cells >= 38:
        label = "Medium"
    elif empty_cells >= 30:
        label = "Hard"
    else:
        label = "Expert"

    return {
        "label": label,
        "empty_cells": empty_cells,
        "metrics": {
            "empty_cells": empty_cells,
            "difficulty": label,
        },
    }


def generate_puzzle(level: str = "easy", seed: Optional[int] = None):
    difficulty = (level or "easy").lower()
    target_clues = DIFFICULTY_CLUES.get(difficulty, DIFFICULTY_CLUES["easy"])
    attempt_seed = seed if seed is not None else random.randint(0, 10**9)
    rng = random.Random(attempt_seed)

    for _ in range(30):
        solution = make_full_board(rng.randint(0, 10**9))
        puzzle = deep_copy(solution)
        remove_cells(puzzle, target_clues, rng)
        if count_solutions(puzzle, limit=2) == 1:
            return puzzle, solution

    fallback_seed = random.randint(0, 10**9)
    rng = random.Random(fallback_seed)
    for _ in range(100):
        solution = make_full_board(rng.randint(0, 10**9))
        puzzle = deep_copy(solution)
        remove_cells(puzzle, target_clues, rng)
        if count_solutions(puzzle, limit=2) == 1:
            return puzzle, solution

    raise ValueError(f"Unable to generate a valid {difficulty} Sudoku puzzle.")
