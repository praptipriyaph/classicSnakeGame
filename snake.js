(() => {
  const GRID_SIZE = 20;
  const TICK_MS = 120;

  const DIRS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };

  const gridEl = document.getElementById("grid");
  const scoreEl = document.getElementById("score");
  const overlayEl = document.getElementById("overlay");
  const overlayTextEl = document.getElementById("overlay-text");
  const restartOverlayBtn = document.getElementById("restart-overlay");
  const pauseBtn = document.getElementById("pause");
  const restartBtn = document.getElementById("restart");
  const dpadButtons = document.querySelectorAll(".dpad-btn");

  const cells = [];

  function createCell() {
    const cell = document.createElement("div");
    cell.className = "cell";
    return cell;
  }

  function buildGrid() {
    gridEl.innerHTML = "";
    cells.length = 0;

    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i += 1) {
      const cell = createCell();
      cells.push(cell);
      gridEl.appendChild(cell);
    }
  }

  function randomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function isOpposite(a, b) {
    return a.x + b.x === 0 && a.y + b.y === 0;
  }

  function cellIndex(pos) {
    return pos.y * GRID_SIZE + pos.x;
  }

  function placeFood(snake) {
    const occupied = new Set(snake.map(cellIndex));
    const empty = [];

    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        const idx = y * GRID_SIZE + x;
        if (!occupied.has(idx)) {
          empty.push({ x, y });
        }
      }
    }

    if (empty.length === 0) {
      return null;
    }

    return empty[randomInt(empty.length)];
  }

  function createInitialState() {
    const mid = Math.floor(GRID_SIZE / 2);
    const snake = [
      { x: mid + 1, y: mid },
      { x: mid, y: mid },
      { x: mid - 1, y: mid },
    ];

    return {
      snake,
      direction: DIRS.right,
      nextDirection: DIRS.right,
      food: placeFood(snake),
      score: 0,
      gameOver: false,
      paused: false,
    };
  }

  function step(state) {
    if (state.gameOver || state.paused) {
      return state;
    }

    const direction = isOpposite(state.direction, state.nextDirection)
      ? state.direction
      : state.nextDirection;

    const head = state.snake[0];
    const nextHead = { x: head.x + direction.x, y: head.y + direction.y };

    if (
      nextHead.x < 0 ||
      nextHead.x >= GRID_SIZE ||
      nextHead.y < 0 ||
      nextHead.y >= GRID_SIZE
    ) {
      return { ...state, gameOver: true };
    }

    const hitsSelf = state.snake.some(
      (segment) => segment.x === nextHead.x && segment.y === nextHead.y
    );

    if (hitsSelf) {
      return { ...state, gameOver: true };
    }

    let newSnake = [nextHead, ...state.snake];
    let newFood = state.food;
    let newScore = state.score;

    if (state.food && nextHead.x === state.food.x && nextHead.y === state.food.y) {
      newScore += 1;
      newFood = placeFood(newSnake);
    } else {
      newSnake = newSnake.slice(0, -1);
    }

    return {
      ...state,
      snake: newSnake,
      direction,
      nextDirection: direction,
      food: newFood,
      score: newScore,
    };
  }

  function render(state) {
    for (const cell of cells) {
      cell.classList.remove("snake", "head", "food");
    }

    state.snake.forEach((segment, index) => {
      const idx = cellIndex(segment);
      const cell = cells[idx];
      if (!cell) return;
      cell.classList.add("snake");
      if (index === 0) {
        cell.classList.add("head");
      }
    });

    if (state.food) {
      const idx = cellIndex(state.food);
      const cell = cells[idx];
      if (cell) {
        cell.classList.add("food");
      }
    }

    scoreEl.textContent = String(state.score);

    if (state.gameOver) {
      overlayTextEl.textContent = "Game Over";
      overlayEl.classList.add("show");
      overlayEl.setAttribute("aria-hidden", "false");
    } else if (state.paused) {
      overlayTextEl.textContent = "Paused";
      overlayEl.classList.add("show");
      overlayEl.setAttribute("aria-hidden", "false");
    } else {
      overlayEl.classList.remove("show");
      overlayEl.setAttribute("aria-hidden", "true");
    }
  }

  function setDirection(state, dir) {
    return { ...state, nextDirection: dir };
  }

  let state = createInitialState();

  function resetGame() {
    state = createInitialState();
    render(state);
  }

  function togglePause() {
    if (state.gameOver) return;
    state = { ...state, paused: !state.paused };
    render(state);
  }

  function tick() {
    state = step(state);
    render(state);
  }

  function handleKey(event) {
    const key = event.key.toLowerCase();
    if (key === " ") {
      event.preventDefault();
      togglePause();
      return;
    }

    if (key === "arrowup" || key === "w") state = setDirection(state, DIRS.up);
    if (key === "arrowdown" || key === "s") state = setDirection(state, DIRS.down);
    if (key === "arrowleft" || key === "a") state = setDirection(state, DIRS.left);
    if (key === "arrowright" || key === "d") state = setDirection(state, DIRS.right);
  }

  function handleDpad(event) {
    const dir = event.currentTarget.dataset.dir;
    if (!dir || !DIRS[dir]) return;
    state = setDirection(state, DIRS[dir]);
  }

  buildGrid();
  render(state);

  document.addEventListener("keydown", handleKey);
  pauseBtn.addEventListener("click", togglePause);
  restartBtn.addEventListener("click", resetGame);
  restartOverlayBtn.addEventListener("click", resetGame);
  dpadButtons.forEach((btn) => btn.addEventListener("click", handleDpad));

  setInterval(tick, TICK_MS);
})();
