from flask import Flask, jsonify, render_template, request

import sudoku_logic

app = Flask(__name__)

CURRENT = {
    "puzzle": None,
    "initial_puzzle": None,
    "solution": None,
    "difficulty": "easy",
}


def _board_to_flat(board):
    return [value for row in board for value in row]


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/new")
def new_game():
    difficulty = (request.args.get("difficulty") or "easy").lower()
    try:
        puzzle, solution = sudoku_logic.generate_puzzle(difficulty)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 503

    CURRENT["puzzle"] = [row[:] for row in puzzle]
    CURRENT["initial_puzzle"] = [row[:] for row in puzzle]
    CURRENT["solution"] = solution
    CURRENT["difficulty"] = difficulty
    return jsonify({
        "puzzle": puzzle,
        "difficulty": difficulty,
        "flat_board": _board_to_flat(puzzle),
        "remaining_hints": sum(value == 0 for row in puzzle for value in row),
    })


@app.route("/reset", methods=["POST"])
def reset_game():
    initial_puzzle = CURRENT.get("initial_puzzle")
    if initial_puzzle is None or CURRENT["solution"] is None:
        return jsonify({"error": "No game in progress."}), 400

    CURRENT["puzzle"] = [row[:] for row in initial_puzzle]
    return jsonify({
        "puzzle": CURRENT["puzzle"],
        "remaining_hints": sum(value == 0 for row in CURRENT["puzzle"] for value in row),
    })


@app.route("/check", methods=["POST"])
def check_solution():
    data = request.get_json(silent=True) or {}
    board = data.get("board")
    solution = CURRENT.get("solution")
    if not sudoku_logic.is_valid_board_shape(board):
        return jsonify({"error": "Invalid board shape."}), 400
    if solution is None:
        return jsonify({"error": "No game in progress."}), 400

    incorrect = []
    for row in range(sudoku_logic.SIZE):
        for col in range(sudoku_logic.SIZE):
            if board[row][col] != solution[row][col]:
                incorrect.append([row, col])

    solved = len(incorrect) == 0 and sudoku_logic.is_complete(board)
    return jsonify({
        "incorrect": incorrect,
        "solved": solved,
        "message": "Congratulations! You solved it!" if solved else "Some cells are incorrect.",
    })


@app.route("/hint", methods=["POST"])
def hint():
    if not CURRENT["solution"] or not CURRENT["puzzle"]:
        return jsonify({"error": "No game in progress."}), 400

    data = request.get_json(silent=True) or {}
    if not isinstance(data, dict):
        return jsonify({"error": "Invalid hint request."}), 400

    board = CURRENT["puzzle"]
    if "row" in data or "col" in data:
        row = data.get("row")
        col = data.get("col")
        if (
            type(row) is not int
            or type(col) is not int
            or not 0 <= row < sudoku_logic.SIZE
            or not 0 <= col < sudoku_logic.SIZE
        ):
            return jsonify({"error": "Invalid hint cell."}), 400
        if board[row][col] != 0:
            return jsonify({"error": "The selected cell is not available for a hint."}), 400
        cells = [(row, col)]
    else:
        cells = [
            (row, col)
            for row in range(sudoku_logic.SIZE)
            for col in range(sudoku_logic.SIZE)
            if board[row][col] == 0
        ]

    for row, col in cells:
        if board[row][col] == 0:
            value = CURRENT["solution"][row][col]
            board[row][col] = value
            return jsonify({
                "row": row,
                "col": col,
                "value": value,
                "message": "Hint used: a valid value was filled in.",
                "remaining_hints": sum(value == 0 for puzzle_row in board for value in puzzle_row),
            })

    return jsonify({"error": "No empty cells left.", "remaining_hints": 0}), 400


if __name__ == "__main__":
    app.run(host="127.0.0.1", debug=True)