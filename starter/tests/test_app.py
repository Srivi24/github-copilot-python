import app as sudoku_app
import sudoku_logic


def setup_game():
    puzzle, solution = sudoku_logic.generate_puzzle("easy", seed=123)
    sudoku_app.CURRENT["puzzle"] = [row[:] for row in puzzle]
    sudoku_app.CURRENT["initial_puzzle"] = [row[:] for row in puzzle]
    sudoku_app.CURRENT["solution"] = solution
    sudoku_app.CURRENT["difficulty"] = "easy"
    return puzzle, solution


def test_hint_targets_requested_empty_cell_without_filling_first_empty():
    puzzle, solution = setup_game()
    empty_cells = [
        (row, col)
        for row in range(sudoku_logic.SIZE)
        for col in range(sudoku_logic.SIZE)
        if puzzle[row][col] == 0
    ]
    first_empty = empty_cells[0]
    target_row, target_col = empty_cells[-1]

    response = sudoku_app.app.test_client().post(
        "/hint",
        json={"row": target_row, "col": target_col},
    )

    assert response.status_code == 200
    assert response.json["row"] == target_row
    assert response.json["col"] == target_col
    assert response.json["value"] == solution[target_row][target_col]
    assert response.json["remaining_hints"] == sum(
        value == 0 for row in sudoku_app.CURRENT["puzzle"] for value in row
    )
    assert sudoku_app.CURRENT["puzzle"][target_row][target_col] == solution[target_row][target_col]
    assert sudoku_app.CURRENT["puzzle"][first_empty[0]][first_empty[1]] == 0


def test_hint_without_target_uses_first_empty_cell():
    puzzle, solution = setup_game()
    first_empty = next(
        (row, col)
        for row in range(sudoku_logic.SIZE)
        for col in range(sudoku_logic.SIZE)
        if puzzle[row][col] == 0
    )

    response = sudoku_app.app.test_client().post("/hint", json={})

    assert response.status_code == 200
    assert (response.json["row"], response.json["col"]) == first_empty
    assert response.json["value"] == solution[first_empty[0]][first_empty[1]]


def test_hint_reports_zero_remaining_when_board_is_full():
    _, solution = setup_game()
    sudoku_app.CURRENT["puzzle"] = [row[:] for row in solution]

    response = sudoku_app.app.test_client().post("/hint", json={})

    assert response.status_code == 400
    assert response.json["remaining_hints"] == 0


def test_hint_rejects_fixed_or_invalid_target_without_filling_another_cell():
    puzzle, _ = setup_game()
    first_empty = next(
        (row, col)
        for row in range(sudoku_logic.SIZE)
        for col in range(sudoku_logic.SIZE)
        if puzzle[row][col] == 0
    )
    client = sudoku_app.app.test_client()

    fixed_response = client.post("/hint", json={"row": 0, "col": 0})
    invalid_response = client.post("/hint", json={"row": 9, "col": 0})

    assert fixed_response.status_code == 400
    assert invalid_response.status_code == 400
    assert sudoku_app.CURRENT["puzzle"][first_empty[0]][first_empty[1]] == 0


def test_reset_restores_original_puzzle_and_hint_count():
    puzzle, solution = setup_game()
    client = sudoku_app.app.test_client()
    client.post("/hint", json={})

    response = client.post("/reset")

    assert response.status_code == 200
    assert response.json["puzzle"] == puzzle
    assert response.json["remaining_hints"] == sum(
        value == 0 for row in puzzle for value in row
    )
    assert sudoku_app.CURRENT["puzzle"] == puzzle
    assert sudoku_app.CURRENT["solution"] == solution


def test_reset_requires_a_game_in_progress():
    sudoku_app.CURRENT["puzzle"] = None
    sudoku_app.CURRENT["initial_puzzle"] = None
    sudoku_app.CURRENT["solution"] = None

    response = sudoku_app.app.test_client().post("/reset")

    assert response.status_code == 400
    assert response.json["error"] == "No game in progress."