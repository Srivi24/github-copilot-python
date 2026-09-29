import sudoku_logic
import pytest


VALID_BOARD = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
]


def test_board_shape_and_value_validation():
    assert sudoku_logic.is_valid_board_shape(VALID_BOARD) is True
    assert sudoku_logic.is_valid_board_shape([[1, 2, 3]]) is False
    assert sudoku_logic.is_valid_board_shape([[0] * 9 for _ in range(9)]) is True


def test_candidates_and_conflicts():
    assert sudoku_logic.get_candidates(VALID_BOARD, 0, 2) == [1, 2, 4]
    assert sudoku_logic.has_conflict(VALID_BOARD, 0, 2, 5) is True
    assert sudoku_logic.has_conflict(VALID_BOARD, 0, 2, 1) is False


def test_complete_board_validation_and_solver():
    solved = sudoku_logic.solve_board(VALID_BOARD)
    assert solved is not None
    assert sudoku_logic.is_complete(solved) is True
    assert sudoku_logic.count_solutions(VALID_BOARD) == 1


def test_generate_seeded_puzzle_and_difficulty():
    puzzle, solution = sudoku_logic.generate_puzzle("easy", seed=123)
    assert len(puzzle) == 9 and all(len(row) == 9 for row in puzzle)
    assert sudoku_logic.count_solutions(puzzle) == 1
    assert sudoku_logic.is_complete(solution) is True
    difficulty = sudoku_logic.classify_puzzle(puzzle)
    assert difficulty["label"] in {"Easy", "Medium", "Hard", "Expert"}


def test_board_contains_at_least_one_empty_cell_after_generation():
    puzzle, _ = sudoku_logic.generate_puzzle("medium", seed=456)
    assert any(cell == 0 for row in puzzle for cell in row)


@pytest.mark.parametrize("difficulty", sudoku_logic.DIFFICULTY_CLUES)
def test_generated_puzzle_has_one_solution_at_every_difficulty(difficulty):
    puzzle, solution = sudoku_logic.generate_puzzle(difficulty, seed=789)

    assert sudoku_logic.count_solutions(puzzle, limit=2) == 1
    assert all(
        puzzle[row][col] == 0 or puzzle[row][col] == solution[row][col]
        for row in range(sudoku_logic.SIZE)
        for col in range(sudoku_logic.SIZE)
    )
