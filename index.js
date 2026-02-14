const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static(path.join(__dirname, 'public')));

const QUESTIONS = [
  { question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], answer: 2 },
  { question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answer: 1 },
  { question: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3 },
  { question: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Michelangelo"], answer: 2 },
  { question: "What year did World War II end?", options: ["1943", "1944", "1945", "1946"], answer: 2 },
  { question: "What is the chemical symbol for Gold?", options: ["Go", "Gd", "Au", "Ag"], answer: 2 },
  { question: "Which country invented pizza?", options: ["USA", "Italy", "France", "Greece"], answer: 1 },
  { question: "How many continents are there?", options: ["5", "6", "7", "8"], answer: 2 },
  { question: "What is the fastest land animal?", options: ["Lion", "Cheetah", "Horse", "Leopard"], answer: 1 },
  { question: "Who wrote 'Romeo and Juliet'?", options: ["Dickens", "Shakespeare", "Austen", "Hemingway"], answer: 1 }
];

let rooms = new Map();

function generateCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function shuffleQuestions() {
  const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}

function getRoomPlayers(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return [];
  return Array.from(io.sockets.adapter.rooms.get(roomCode) || [])
    .map(socketId => {
      const socket = io.sockets.sockets.get(socketId);
      return socket ? { id: socket.id, name: socket.data.name, score: socket.data.score } : null;
    })
    .filter(Boolean);
}

io.on('connection', (socket) => {
  socket.data.score = 0;
  socket.data.name = '';
  socket.data.currentRoom = null;

  socket.on('create-room', (name) => {
    const roomCode = generateCode();
    socket.data.name = name;
    socket.data.score = 0;
    
    const questions = shuffleQuestions();
    rooms.set(roomCode, {
      host: socket.id,
      players: [socket.id],
      questions: questions,
      currentQuestion: 0,
      gameStarted: false,
      answers: new Map()
    });
    
    socket.join(roomCode);
    socket.data.currentRoom = roomCode;
    
    socket.emit('room-created', { roomCode, isHost: true });
    io.to(roomCode).emit('players-update', getRoomPlayers(roomCode));
  });

  socket.on('join-room', ({ roomCode, name }) => {
    const room = rooms.get(roomCode);
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }
    
    if (room.gameStarted) {
      socket.emit('error', 'Game already started');
      return;
    }

    socket.data.name = name;
    socket.data.score = 0;
    socket.data.currentRoom = roomCode;
    
    room.players.push(socket.id);
    socket.join(roomCode);
    
    socket.emit('room-joined', { roomCode, isHost: false });
    io.to(roomCode).emit('players-update', getRoomPlayers(roomCode));
  });

  socket.on('start-game', () => {
    const roomCode = socket.data.currentRoom;
    const room = rooms.get(roomCode);
    
    if (!room || room.host !== socket.id) return;
    if (getRoomPlayers(roomCode).length < 3) {
      socket.emit('error', 'Need at least 3 players to start');
      return;
    }
    
    room.gameStarted = true;
    room.currentQuestion = 0;
    
    io.to(roomCode).emit('game-started');
    
    setTimeout(() => {
      sendQuestion(roomCode);
    }, 2000);
  });

  function sendQuestion(roomCode) {
    const room = rooms.get(roomCode);
    if (!room) return;
    
    room.answers.clear();
    const question = room.questions[room.currentQuestion];
    
    io.to(roomCode).emit('question', {
      question: question.question,
      options: question.options,
      questionNumber: room.currentQuestion + 1,
      totalQuestions: room.questions.length
    });
    
    setTimeout(() => {
      revealAnswer(roomCode);
    }, 10000);
  }

  function revealAnswer(roomCode) {
    const room = rooms.get(roomCode);
    if (!room) return;
    
    const question = room.questions[room.currentQuestion];
    const results = [];
    
    room.answers.forEach((answerIndex, socketId) => {
      const playerSocket = io.sockets.sockets.get(socketId);
      if (playerSocket) {
        const correct = answerIndex === question.answer;
        if (correct) {
          playerSocket.data.score += 100;
        }
        results.push({
          name: playerSocket.data.name,
          answer: answerIndex,
          correct
        });
      }
    });
    
    io.to(roomCode).emit('answer-reveal', {
      correctAnswer: question.answer,
      results,
      scores: getRoomPlayers(roomCode)
    });
    
    setTimeout(() => {
      room.currentQuestion++;
      if (room.currentQuestion < room.questions.length) {
        sendQuestion(roomCode);
      } else {
        endGame(roomCode);
      }
    }, 5000);
  }

  function endGame(roomCode) {
    const players = getRoomPlayers(roomCode);
    players.sort((a, b) => b.score - a.score);
    
    io.to(roomCode).emit('game-over', {
      rankings: players
    });
    
    rooms.delete(roomCode);
  }

  socket.on('submit-answer', (answerIndex) => {
    const roomCode = socket.data.currentRoom;
    const room = rooms.get(roomCode);
    
    if (!room || !room.gameStarted) return;
    
    room.answers.set(socket.id, answerIndex);
  });

  socket.on('disconnect', () => {
    const roomCode = socket.data.currentRoom;
    if (!roomCode) return;
    
    const room = rooms.get(roomCode);
    if (!room) return;
    
    room.players = room.players.filter(id => id !== socket.id);
    io.to(roomCode).emit('players-update', getRoomPlayers(roomCode));
    
    if (room.players.length === 0) {
      rooms.delete(roomCode);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});