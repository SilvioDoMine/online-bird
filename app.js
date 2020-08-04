const express = require('express')
const http = require("http")
const socketio = require("socket.io")
const Room = require('./src/Room')

const app = express()
const server = http.createServer(app)
const sockets = socketio(server)

// Database configs.
const SERVER_PORT = 3000

// Networking

const gameData = {
    startPlayers: 2,
    startTimer: 20,
    rooms: []
}

sockets.on('connection', socket => {
    console.log(`> The socket "${socket.id}" just connected.`)

    socket.on('findMatch', handleMM)
    socket.on('disconnect', handleDisconnect)
})

function createSlug(length) {
    var result = ''
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length

    for (var i = 0; i < length; i++) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }

    return result
}

function createRoom(socket) {
    let roomId = createSlug(10)

    gameData.rooms.push({
        id: roomId,
        status: 'waiting',
        players: [socket.id],
        timer: gameData.startTimer,
    })

    startRoom(gameData.rooms[gameData.rooms.length -1])

    socket.join(roomId)
}

function removeSocketFromRoom(socket) {
    // Varrendo a lista de salas
    gameData.rooms.forEach((item, key) => {
        // Removendo este socket de todas as salas
        gameData.rooms[key].players = item.players.filter(xItem => xItem !== socket.id)
    })
}

function handleMM() {
    console.log(`> User "${this.id}" just joined the matchmaking`)

    if (gameData.rooms.length == 0) {
        createRoom(this)
    } else {
        let lastRoomStatus = gameData.rooms[gameData.rooms.length - 1].status

        if (lastRoomStatus == 'waiting') {
            gameData.rooms[gameData.rooms.length - 1].players.push(this.id)
        } else {
            createRoom(this)
        }
    }

    this.emit(`matchStatus`, gameData)
}

function handleDisconnect() {
    removeSocketFromRoom(this)
    console.log(`> The socket "${this.id}" just disconneceted.`)
}

function startRoom(room) {
    if (room.status == 'waiting') {
        setInterval(() => {

            console.log(`> Looking up room ${room.id}: there is ${room.players.length} players. Starting in... ${room.timer}`)

            if (room.timer > 0) {
                room.timer--
            } else {
                if (room.players.length >= gameData.startPlayers) {
                    room.status = 'active'
                } else {
                    room.timer = gameData.startTimer
                }
            }
        }, 1000)
    }
}

// Serving HTTP
app.use(express.static('public'))

server.listen(SERVER_PORT, () => {
    console.log(`> Server is listening to port ${SERVER_PORT}.`)
})


// import express from 'express'
// import http from 'http'
// import NetworkClass from './src/Network.js'
// import DatabaseClass from './src/Database.js'
// import LoginClass from './src/Login.js'

// const SERVER_PORT = 3000
// const DB_HOST = '127.0.0.1'
// const DB_PORT = 3306
// const DB_DATABASE = 'flappy'
// const DB_USERNAME = 'root'
// const DB_PASSWORD = 'root'

// const app = express()
// const server = http.createServer(app)
// const sockets = socketio(server)



// /**
//  * Public server stuff DO NOT 
//  */
// app.use(express.static('public'))
        
// server.listen(SERVER_PORT, () => {
//     console.log(`> Server listening to port ${SERVER_PORT}`)
// })