const spaces = document.querySelectorAll(".space")
const announcement = document.querySelector(".announcement")

const pieces = 9

let redCount = pieces
let blueCount = pieces
let redsTurn = true
let timeToKill = false
let redSuperPower = false
let blueSuperPower = false

const normalize = (s) => `.${s[0] == "b" ? "big" : s[0] == "m" ? "medium" : "small"}-square>.space:nth-child(${s[1]})`
const nthChild = (p, n) => `.${p.parentElement.classList[1]} > .space:nth-child(${n})`
const childElement = (p, i) => document.querySelector(typeof i === "number" ? nthChild(p, i) : i)

const bigMoves = [
 [2, 4],
 [1, normalize("m2"), 3],
 [2, 5],
 [1, normalize("m4"), 6],
 [3, normalize("m5"), 8],
 [4, 7],
 [6, normalize("m7"), 8],
 [7, 5],
]
const mediumMoves = [
 [2, 4],
 [1, normalize("b2"), normalize("s2"), 3],
 [2, 5],
 [1, normalize("b4"), normalize("s4"), 6],
 [3, normalize("b5"), normalize("s5"), 8],
 [4, 7],
 [6, normalize("b7"), normalize("s7"), 8],
 [7, 5],
]
const smallMoves = [
 [2, 4],
 [1, normalize("m2"), 3],
 [2, 5],
 [1, normalize("m4"), 6],
 [3, normalize("m5"), 8],
 [4, 7],
 [6, normalize("m7"), 8],
 [7, 5],
]
const trains = [
 [1, 2, 3],
 [6, 7, 8],
 [1, 4, 6],
 [3, 5, 8],
 [normalize("b4"), normalize("m4"), normalize("s4")],
 [normalize("b5"), normalize("m5"), normalize("s5")],
 [normalize("b2"), normalize("m2"), normalize("s2")],
 [normalize("b7"), normalize("m7"), normalize("s7")],
]

document.addEventListener("click", () =>
 document.fullscreenElement ? null : document.documentElement.requestFullscreen()
)

setTimeout(() => {
 announcement.innerHTML = redsTurn ? `RED ${redCount}` : `BLUE ${blueCount}`
 spaces.forEach((space) => space.addEventListener("click", handleSpaceClick))
}, 8000)

function handleSpaceClick(e) {
 showPossibleMoves(e.target)

 moveToPossibleMove(e.target)

 placePieces(e.target)

 killPossibleVictims(e.target)
}

function placePieces(player) {
 if ((redCount === 0 && blueCount === 0) || player.classList.length > 1 || timeToKill) return

 if (redCount > 0 && redsTurn) {
  player.classList.add("red")
  redCount--
 } else if (blueCount > 0 && !redsTurn) {
  player.classList.add("blue")
  blueCount--
 }

 changeTurns(player)
}

function showPossibleMoves(player) {
 if (redCount > 0 || blueCount > 0 || player.classList.length === 1 || timeToKill) return

 if (!player.classList.contains("red") && !player.classList.contains("blue")) return
 if (player.classList.contains("red") && !redsTurn) return
 else if (player.classList.contains("blue") && redsTurn) return

 removePossibleMoves()

 const playersName = player.classList[1]
 const parentName = player.parentElement.classList[1][0]
 const playerIndex = [...player.parentElement.children].indexOf(player)
 const redIsEligibleForPower = player.classList.contains("red") && redSuperPower && redsTurn
 const blueIsEligibleForPower = player.classList.contains("blue") && blueSuperPower && !redsTurn

 if (redIsEligibleForPower || blueIsEligibleForPower) {
  player.classList.add("selected")
  spaces.forEach((s) => (s.classList.length === 1 ? s.classList.add(`${playersName}s-move`) : null))
  return
 }

 const rightMoves = (p) => (p === "b" ? bigMoves : p === "m" ? mediumMoves : smallMoves)

 rightMoves(parentName).map((i, n) => (playerIndex === n ? showMoves(i) : null))

 function showMoves(possibilities) {
  possibilities.forEach((possibility) => {
   const element = childElement(player, possibility)

   if (element.classList.length === 1) {
    element.classList.add(`${playersName}s-move`)
    player.classList.add("selected")
   }
  })
 }
}

function removePossibleMoves() {
 spaces.forEach((space) => {
  if (space.classList.contains("reds-move")) space.classList.remove("reds-move")
  if (space.classList.contains("blues-move")) space.classList.remove("blues-move")
  if (space.classList.contains("selected")) space.classList.remove("selected")
 })
}

function moveToPossibleMove(move) {
 if (move.classList[1] && move.classList[1].includes("move")) {
  const player = document.querySelector(".selected")
  const playersName = player.classList[1]

  move.classList.replace(`${playersName}s-move`, playersName)
  player.classList.remove(playersName)
  removePossibleMoves()
  changeTurns(move)
 }
}

function checkForTrains(player) {
 const victimsInTrain = []
 const playersName = player.classList[1]

 for (let i = 0; i < trains.length; i++) {
  const isTrain = trains[i].every((i) => childElement(player, i).classList.contains(playersName))
  const trainContainsPlayer = isTrain ? trains[i].some((i) => childElement(player, i) === player) : false
  console.log(trains[i], trainContainsPlayer)

  if (!isTrain || !trainContainsPlayer) continue

  timeToKill = true
  const victims = player.classList[1] === "red" ? ".blue" : ".red"
  document.querySelectorAll(victims).forEach((victim) => victim.classList.add("victim"))
  document.querySelectorAll(victims).forEach((victim) => {
   for (let j = 0; j < trains.length; j++) {
    const isTrain = trains[j].every((i) => childElement(victim, i).classList.contains("victim"))
    if (!isTrain) continue

    trains[j].forEach((i) => {
     if (!victimsInTrain.includes(childElement(victim, i))) victimsInTrain.push(childElement(victim, i))
    })
   }
  })
 }

 const allVictimsCount = [...document.querySelectorAll(".victim")].length

 if (victimsInTrain.length === 0 || allVictimsCount === victimsInTrain.length) return
 victimsInTrain.forEach((victim) => victim.classList.remove("victim"))
}

function killPossibleVictims(victim) {
 if (!victim.classList.contains("victim")) return

 document.querySelectorAll(".victim").forEach((victim) => victim.classList.remove("victim"))
 victim.classList.remove(victim.classList[1])
 timeToKill = false

 const remainingRed = [...document.querySelectorAll(".red")].length
 const remainingBlue = [...document.querySelectorAll(".blue")].length

 if (remainingRed === 3) redSuperPower = true
 if (remainingBlue === 3) blueSuperPower = true

 if (remainingRed === 0) {
  announcement.innerHTML = "BLUE <br> WINS!"
  announcement.style.color = "var(--blue)"
  spaces.forEach((space) => space.removeEventListener("click", handleSpaceClick))
 } else if (remainingBlue === 0) {
  announcement.innerHTML = "RED <br> WINS!"
  announcement.style.color = "var(--red)"
  spaces.forEach((space) => space.removeEventListener("click", handleSpaceClick))
 }
}

function changeTurns(player) {
 const r = (n) => (n === 0 ? "" : n)
 redsTurn = !redsTurn
 checkForTrains(player)
 announcement.innerHTML = redsTurn ? `RED ${r(redCount)}` : `BLUE ${r(blueCount)}`
 announcement.style.color = redsTurn ? "var(--red)" : "var(--blue)"
}
