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

const QUESTIONS_BY_THEME = {
  "Science": [
    { question: "What is the chemical symbol for Gold?", options: ["Go", "Gd", "Au", "Ag"], answer: 2 },
    { question: "Which element has the chemical symbol 'O'?", options: ["Gold", "Oxygen", "Osmium", "Oganesson"], answer: 1 },
    { question: "Which gas do plants absorb?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], answer: 2 },
    { question: "How many bones in the adult human body?", options: ["186", "206", "226", "246"], answer: 1 },
    { question: "What is the largest mammal?", options: ["Elephant", "Blue Whale", "Giraffe", "Polar Bear"], answer: 1 },
    { question: "Which vitamin do we get from sunlight?", options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"], answer: 3 },
    { question: "What is the hardest natural substance?", options: ["Gold", "Iron", "Diamond", "Platinum"], answer: 2 },
    { question: "What is the fastest land animal?", options: ["Lion", "Cheetah", "Horse", "Leopard"], answer: 1 }
  ],
  "Geography": [
    { question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], answer: 2 },
    { question: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3 },
    { question: "What is the capital of Japan?", options: ["Beijing", "Seoul", "Tokyo", "Bangkok"], answer: 2 },
    { question: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], answer: 2 },
    { question: "What is the smallest country in the world?", options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"], answer: 1 },
    { question: "What is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], answer: 1 },
    { question: "What is the capital of Brazil?", options: ["Rio de Janeiro", "Sao Paulo", "Brasilia", "Salvador"], answer: 2 },
    { question: "How many continents are there?", options: ["5", "6", "7", "8"], answer: 2 }
  ],
  "History": [
    { question: "What year did World War II end?", options: ["1943", "1944", "1945", "1946"], answer: 2 },
    { question: "What year did the Titanic sink?", options: ["1910", "1911", "1912", "1913"], answer: 2 },
    { question: "Which country invented pizza?", options: ["USA", "Italy", "France", "Greece"], answer: 1 },
    { question: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Michelangelo"], answer: 2 },
    { question: "Who wrote 'Romeo and Juliet'?", options: ["Dickens", "Shakespeare", "Austen", "Hemingway"], answer: 1 }
  ],
  "Space": [
    { question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answer: 1 },
    { question: "Which planet is closest to the Sun?", options: ["Venus", "Mercury", "Earth", "Mars"], answer: 1 },
    { question: "How many planets are in our solar system?", options: ["7", "8", "9", "10"], answer: 1 },
    { question: "What is the largest planet in our solar system?", options: ["Saturn", "Neptune", "Jupiter", "Uranus"], answer: 2 }
  ],
  "Entertainment": [
    { question: "How many strings does a guitar have?", options: ["4", "5", "6", "7"], answer: 2 },
    { question: "In what year was the first iPhone released?", options: ["2005", "2006", "2007", "2008"], answer: 2 },
    { question: "How many Harry Potter books are there?", options: ["6", "7", "8", "9"], answer: 1 },
    { question: "What is the highest-grossing film of all time?", options: ["Titanic", "Avatar", "Avengers: Endgame", "Star Wars"], answer: 1 }
  ]
};

const THEMES = Object.keys(QUESTIONS_BY_THEME);

const MASCOTS = ['🦊', '🐸', '🦁', '🐼', '🦄', '🐱', '🐶', '🐰', '🐻', '🦋'];

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;
const QUESTION_TIME = 10;
const MAX_POINTS = 100;
const SPEED_BONUS_MULTIPLIER = 10;

let rooms = new Map();
let questionTimers = new Map();
let leaderboardTimers = new Map();

function generateCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getRandomQuestions(theme, count = 7) {
  const questions = theme === 'Random' 
    ? Object.values(QUESTIONS_BY_THEME).flat()
    : QUESTIONS_BY_THEME[theme] || Object.values(QUESTIONS_BY_THEME).flat();
  return shuffleArray(questions).slice(0, count);
}

function getRoomPlayers(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return [];
  return Array.from(io.sockets.adapter.rooms.get(roomCode) || [])
    .map(socketId => {
      const socket = io.sockets.sockets.get(socketId);
      return socket ? { 
        id: socket.id, 
        name: socket.data.name, 
        score: socket.data.score,
        mascot: socket.data.mascot,
        answered: socket.data.answered
      } : null;
    })
    .filter(Boolean);
}

function clearAllTimers(roomCode) {
  if (questionTimers.has(roomCode)) {
    clearTimeout(questionTimers.get(roomCode));
    questionTimers.delete(roomCode);
  }
  if (leaderboardTimers.has(roomCode)) {
    clearTimeout(leaderboardTimers.get(roomCode));
    leaderboardTimers.delete(roomCode);
  }
}

io.on('connection', (socket) => {
  socket.data.score = 0;
  socket.data.name = '';
  socket.data.currentRoom = null;
  socket.data.mascot = MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
  socket.data.answered = false;

  socket.on('create-room', ({ name, theme }) => {
    const roomCode = generateCode();
    socket.data.name = name;
    socket.data.score = 0;
    socket.data.answered = false;
    
    const questions = getRandomQuestions(theme);
    rooms.set(roomCode, {
      host: socket.id,
      players: [socket.id],
      questions: questions,
      currentQuestion: 0,
      gameStarted: false,
      answers: new Map(),
      questionStartTime: null,
      theme: theme
    });
    
    socket.join(roomCode);
    socket.data.currentRoom = roomCode;
    
    socket.emit('room-created', { roomCode, isHost: true, minPlayers: MIN_PLAYERS, maxPlayers: MAX_PLAYERS, themes: THEMES });
    io.to(roomCode).emit('players-update', { players: getRoomPlayers(roomCode), minPlayers: MIN_PLAYERS, maxPlayers: MAX_PLAYERS });
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

    const currentPlayers = getRoomPlayers(roomCode).length;
    if (currentPlayers >= MAX_PLAYERS) {
      socket.emit('error', 'Room is full (max ' + MAX_PLAYERS + ' players)');
      return;
    }

    socket.data.name = name;
    socket.data.score = 0;
    socket.data.currentRoom = roomCode;
    socket.data.answered = false;
    
    room.players.push(socket.id);
    socket.join(roomCode);
    
    socket.emit('room-joined', { roomCode, isHost: false, minPlayers: MIN_PLAYERS, maxPlayers: MAX_PLAYERS });
    io.to(roomCode).emit('players-update', { players: getRoomPlayers(roomCode), minPlayers: MIN_PLAYERS, maxPlayers: MAX_PLAYERS });
  });

  socket.on('start-game', () => {
    const roomCode = socket.data.currentRoom;
    const room = rooms.get(roomCode);
    
    if (!room || room.host !== socket.id) return;
    
    const playerCount = getRoomPlayers(roomCode).length;
    if (playerCount < MIN_PLAYERS) {
      socket.emit('error', 'Need at least ' + MIN_PLAYERS + ' players to start');
      return;
    }
    
    room.gameStarted = true;
    room.currentQuestion = 0;
    
    io.to(roomCode).emit('game-started', { theme: room.theme });
    
    setTimeout(() => {
      sendQuestion(roomCode);
    }, 2000);
  });

  function sendQuestion(roomCode) {
    const room = rooms.get(roomCode);
    if (!room) return;
    
    clearAllTimers(roomCode);
    
    room.answers.clear();
    room.questionStartTime = Date.now();
    
    getRoomPlayers(roomCode).forEach(p => {
      const s = io.sockets.sockets.get(p.id);
      if (s) s.data.answered = false;
    });
    
    const question = room.questions[room.currentQuestion];
    
    io.to(roomCode).emit('question', {
      question: question.question,
      options: question.options,
      questionNumber: room.currentQuestion + 1,
      totalQuestions: room.questions.length,
      timeLimit: QUESTION_TIME
    });
    
    io.to(roomCode).emit('players-update', { players: getRoomPlayers(roomCode), minPlayers: MIN_PLAYERS, maxPlayers: MAX_PLAYERS });
    
    const timer = setTimeout(() => {
      revealAnswer(roomCode);
    }, QUESTION_TIME * 1000);
    questionTimers.set(roomCode, timer);
  }

  socket.on('submit-answer', (answerIndex) => {
    const roomCode = socket.data.currentRoom;
    const room = rooms.get(roomCode);
    
    if (!room || !room.gameStarted) return;
    if (socket.data.answered) return;
    
    socket.data.answered = true;
    
    const timeTaken = (Date.now() - room.questionStartTime) / 1000;
    const speedBonus = Math.max(0, Math.floor((QUESTION_TIME - timeTaken) * SPEED_BONUS_MULTIPLIER));
    
    room.answers.set(socket.id, { answerIndex, timeTaken, speedBonus });
    
    io.to(roomCode).emit('players-update', { players: getRoomPlayers(roomCode), minPlayers: MIN_PLAYERS, maxPlayers: MAX_PLAYERS });
    
    const totalPlayers = getRoomPlayers(roomCode).length;
    if (room.answers.size >= totalPlayers) {
      clearAllTimers(roomCode);
      setTimeout(() => revealAnswer(roomCode), 500);
    }
  });

  function revealAnswer(roomCode) {
    const room = rooms.get(roomCode);
    if (!room) return;
    
    clearAllTimers(roomCode);
    
    const question = room.questions[room.currentQuestion];
    const results = [];
    
    room.answers.forEach((data, socketId) => {
      const playerSocket = io.sockets.sockets.get(socketId);
      if (playerSocket) {
        const correct = data.answerIndex === question.answer;
        const points = correct ? MAX_POINTS + data.speedBonus : 0;
        if (correct) {
          playerSocket.data.score += points;
        }
        results.push({
          name: playerSocket.data.name,
          mascot: playerSocket.data.mascot,
          answer: data.answerIndex,
          correct,
          points: correct ? points : 0,
          time: data.timeTaken.toFixed(1)
        });
      }
    });
    
    results.sort((a, b) => {
      if (a.correct !== b.correct) return b.correct - a.correct;
      return a.time - b.time;
    });
    
    io.to(roomCode).emit('answer-reveal', {
      correctAnswer: question.answer,
      results,
      scores: getRoomPlayers(roomCode),
      isLastQuestion: room.currentQuestion >= room.questions.length - 1
    });
  }

  socket.on('next-question', () => {
    const roomCode = socket.data.currentRoom;
    const room = rooms.get(roomCode);
    
    if (!room || room.host !== socket.id) return;
    
    clearAllTimers(roomCode);
    proceedToNext(roomCode);
  });

  function proceedToNext(roomCode) {
    const room = rooms.get(roomCode);
    if (!room) return;
    
    room.currentQuestion++;
    if (room.currentQuestion < room.questions.length) {
      sendQuestion(roomCode);
    } else {
      endGame(roomCode);
    }
  }

  function endGame(roomCode) {
    clearAllTimers(roomCode);
    const players = getRoomPlayers(roomCode);
    players.sort((a, b) => b.score - a.score);
    
    io.to(roomCode).emit('game-over', {
      rankings: players
    });
    
    rooms.delete(roomCode);
  }

  socket.on('disconnect', () => {
    const roomCode = socket.data.currentRoom;
    if (!roomCode) return;
    
    const room = rooms.get(roomCode);
    if (!room) return;
    
    room.players = room.players.filter(id => id !== socket.id);
    
    if (room.players.length === 0) {
      clearAllTimers(roomCode);
      rooms.delete(roomCode);
    } else {
      io.to(roomCode).emit('players-update', { players: getRoomPlayers(roomCode), minPlayers: MIN_PLAYERS, maxPlayers: MAX_PLAYERS });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});