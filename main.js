const MAIN = document.querySelector("div#mainContainer");
const TOWERCONTAINER = MAIN.querySelector("div#TowerContainer");
const MENU = MAIN.querySelector("div#menuContainer");
const MENUTOGGLE = MAIN.querySelector("button#menuEnable");
const CANVASCONTAINER = MAIN.querySelector("div#canvasContainer");

const WINDOWOBJ = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", function () {
  WINDOWOBJ.width = window.innerWidth;
  WINDOWOBJ.height = window.innerHeight;
});

class Tower {
  constructor(x, y) {
    this.x = x;
    this.yMax = y;
    this.discCount = 0;
    this.asBTN = this.init();
    this.discs = [];
  }
  init() {
    const towerDiv = document.createElement("button");
    towerDiv.setAttribute("class", "Tower");
    return towerDiv;
  }
  OnDiscAdd(discSize) {
    this.discs.push(discSize);
    this.discCount++;
    this.yMax -= 33;
  }
  OnDiscRemove() {
    if (this.discCount > 0) {
      this.discCount--;
      this.yMax += 33;
      this.discs.pop();
    }
  }
  setDiscCount(val) {
    this.discCount = val;
  }
  GetX(discSize) {
    return this.x - discSize * 10 + 60;
  }
  GetY() {
    return this.yMax;
  }
}

class Disc {
  constructor(size, x, y) {
    this.size = size;
    this.asDiv = this.init(x, y);
  }
  init(x, y) {
    const discDiv = document.createElement("div");
    discDiv.setAttribute("class", "disc");
    discDiv.style.width = (25 + this.size * 20).toString() + "px";
    discDiv.innerText = this.size;
    discDiv.style.top = y.toString() + "px";
    discDiv.style.left = x.toString() + "px";
    return discDiv;
  }
  MOVE(FromTower, ToTower, moveDelay = 50) {
    FromTower.OnDiscRemove();
    this.asDiv.style.top = "200px";
    setTimeout(() => {
      this.asDiv.style.left = ToTower.GetX(this.size).toString() + "px";
      setTimeout(() => {
        this.asDiv.style.top = ToTower.GetY().toString() + "px";
        ToTower.OnDiscAdd(this.size);
      }, moveDelay);
    }, moveDelay);
  }
}

const TOWERS = [];
const DISCS = [];

function calculateTowerPositions(towerCount, towerWidth = 300) {
  const totalWidth = towerCount * (towerWidth + 20);
  const spacing = (window.innerWidth - totalWidth) / 2;

  const xValues = [];
  for (let i = 0; i < towerCount; i++) {
    const x = i * (towerWidth + 30) + 80 + spacing;
    xValues.push(x);
  }

  return xValues;
}

function resetDiscCount() {
  while (DISCS.length > 0) {
    DISCS.pop();
  }
}

function resetTowerCount() {
  while (TOWERS.length > 0) {
    TOWERS.pop();
  }
}
function setTowerCount(val) {
  resetTowerCount();
  let towerXvalues = calculateTowerPositions(val);
  towerXvalues.forEach((tempVAL) => {
    TOWERS.push(new Tower(tempVAL, WINDOWOBJ.height - 140));
  });
}

let xVal = 0;
let yVal = 0;
function addTower() {
  TOWERS.push(new Tower(xVal, yVal));
}

function addDiscsToDOM() {
  DISCS.forEach((disc) => {
    TOWERCONTAINER.appendChild(disc.asDiv);
  });
}

let selected = false;
let selectedTower = null;

function onButtonClick(TowerObj) {
  if (selectedTower === null) {
    if (TowerObj.discs.length > 0) {
      selectedTower = TowerObj;
      selectedTower.asBTN.style.backgroundColor = "rgb(100, 100, 100)";
      selected = true;
    } //else do nothing
  } else if (selectedTower === TowerObj) {
    selectedTower.asBTN.style.backgroundColor = "";
    selectedTower = null;
    selected = false;
  } else {
    makeMove(
      selectedTower.discs[selectedTower.discs.length - 1],
      selectedTower,
      TowerObj,
      200
    );
    selectedTower.asBTN.style.backgroundColor = "";
    TowerObj.asBTN.style.backgroundColor = "rgb(70, 70, 70)";
    setTimeout(() => {
      TowerObj.asBTN.style.backgroundColor = "";
    }, 200);
    selectedTower = null;
    selected = false;
  }
}

function initializeGame(discCount, towerCount) {
  setTowerCount(towerCount);
  resetDiscCount();
  for (let i = discCount; i > 0; i--) {
    DISCS.push(new Disc(i, TOWERS[0].GetX(i), TOWERS[0].GetY()));
    TOWERS[0].OnDiscAdd(i);
  }
  initDOM();
  for (let i = 0; i < TOWERS.length; i++) {
    TOWERS[i].asBTN.addEventListener("click", function () {
      onButtonClick(TOWERS[i]);
    });
  }
  addDiscsToDOM();
}

function initDOM() {
  TOWERCONTAINER.innerHTML = "";
  TOWERS.forEach((twr) => {
    TOWERCONTAINER.appendChild(twr.asBTN);
  });
}

function makeMove(discSize, FromTower, ToTower, moveDelay = 50) {
  DISCS[DISCS.length - discSize].MOVE(FromTower, ToTower, moveDelay);
}

class makeCopy {
  constructor(value) {
    this.value = value;
  }
  getValue() {
    return this.value;
  }
}

let MOVES = [];

function recursiveSolve(DiscArray, initPos, destPos, auxPos) {
  if (DiscArray.length == 1) {
    MOVES.push([DiscArray[0].size, initPos, destPos]);
  } else {
    let slice = DiscArray.slice(1);
    recursiveSolve(slice, initPos, auxPos, destPos);
    MOVES.push([DiscArray[0].size, initPos, destPos, auxPos]);
    recursiveSolve(slice, auxPos, destPos, initPos);
  }
}

function SOLVE(msBetweenMoves = 1000) {
  let n = 0;
  const t = setInterval(() => {
    if (n < MOVES.length) {
      makeMove(MOVES[n][0], MOVES[n][1], MOVES[n][2], msBetweenMoves / 4);
      n++;
    } else {
      clearInterval(t);
      console.log("Interval cleared!");
    }
  }, msBetweenMoves);
}

// SOLVE(ms:number) is the method to call for a solution animation.

//initializeGame(7, 3);

function RESET() {
  resetTowerCount();
  resetDiscCount();
  MOVES = [];
  TOWERCONTAINER.innerHTML = "";
}

function loadingAnimation(repCount = 3, animationDelay = 500) {
  let AnimationIndex = 0;
  initializeGame(5, 3);
  recursiveSolve(DISCS, TOWERS[0], TOWERS[2], TOWERS[1]);
  SOLVE(animationDelay);
  let intervalQuit = setInterval(() => {
    RESET();
    initializeGame(5, 3);
    recursiveSolve(DISCS, TOWERS[0], TOWERS[2], TOWERS[1]);
    SOLVE(animationDelay);
    if (++AnimationIndex >= repCount) {
      clearInterval(intervalQuit);
    }
  }, animationDelay * 35);
}

loadingAnimation(500, 800);
