const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())

const dbpath = path.join(__dirname, 'cricketTeam.db')
let db = null

let consvertToCamelCase = newObject => {
  return {
    playerId: newObject.player_id,
    playerName: newObject.player_name,
    jerseyNumber: newObject.jersey_number,
    role: newObject.role,
  }
}

const initilizeDBServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB error ${e.message}`)
    process.exit(1)
  }
}

initilizeDBServer()

//API-1

app.get('/players/', async (request, response) => {
  const dbQuerry = `
  SELECT *
  FROM cricket_team
  ORDER BY player_id;`

  const playerArray = await db.all(dbQuerry)
  const result = playerArray.map(eachObject => {
    return consvertToCamelCase(eachObject)
  })
  response.send(result)
  console.log(result)
})

//API-2

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayer = `
    INSERT INTO
    cricket_team (player_name,jersey_number,role)
    VALUES (
        '${playerName}',
        ${jerseyNumber},
        '${role}'
    );`
  await db.run(addPlayer)
  response.send('Player Added to Team')
})

//API-3

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayer = `
    SELECT *
    FROM cricket_team
    WHERE player_id = ${playerId};`
  const player = await db.get(getPlayer)
  const result = consvertToCamelCase(player)
  response.send(result)
})

//API-4

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const details = request.body
  const {playerName, jerseyNumber, role} = details
  const updateQuerry = `
  UPDATE
  cricket_team
  SET
  player_name = '${playerName}',
  jersey_number = ${jerseyNumber},
  role = '${role}'
  WHERE
  player_id = ${playerId};`

  await db.run(updateQuerry)
  response.send('Player Details Updated')
})

//API-5

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deleteQuerry = `
  DELETE
  FROM
  cricket_team
  WHERE
  player_id = ${playerId};`
  await db.run(deleteQuerry)
  response.send('Player Removed')
})

module.exports = app
