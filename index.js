const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { User, Friends, Questions, GameHistory, db } = require('./database');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const QUESTIONS_BY_THEME = {
  "Science": [
    { question: "What is the chemical symbol for Gold?", options: ["Go", "Gd", "Au", "Ag"], answer: 2, difficulty: "medium" },
    { question: "Which element has the chemical symbol 'O'?", options: ["Gold", "Oxygen", "Osmium", "Oganesson"], answer: 1, difficulty: "easy" },
    { question: "Which gas do plants absorb?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], answer: 2, difficulty: "easy" },
    { question: "How many bones in the adult human body?", options: ["186", "206", "226", "246"], answer: 1, difficulty: "medium" },
    { question: "What is the largest mammal?", options: ["Elephant", "Blue Whale", "Giraffe", "Polar Bear"], answer: 1, difficulty: "easy" },
    { question: "Which vitamin do we get from sunlight?", options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"], answer: 3, difficulty: "easy" },
    { question: "What is the hardest natural substance?", options: ["Gold", "Iron", "Diamond", "Platinum"], answer: 2, difficulty: "easy" },
    { question: "What is the fastest land animal?", options: ["Lion", "Cheetah", "Horse", "Leopard"], answer: 1, difficulty: "easy" },
    { question: "What is the smallest unit of matter?", options: ["Molecule", "Atom", "Electron", "Quark"], answer: 3, difficulty: "hard" },
    { question: "What planet has the most moons?", options: ["Jupiter", "Saturn", "Uranus", "Neptune"], answer: 1, difficulty: "hard" },
    { question: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], answer: 2, difficulty: "easy" },
    { question: "What is the most abundant gas in Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], answer: 2, difficulty: "medium" },
    { question: "How many chromosomes do humans have?", options: ["23", "46", "48", "44"], answer: 1, difficulty: "medium" },
    { question: "The Sun is primarily composed of:", options: ["Solid rock", "Liquid magma", "Plasma", "Gas and dust"], answer: 2, difficulty: "medium" },
    { question: "What type of energy does the sun produce?", options: ["Chemical", "Nuclear", "Mechanical", "Electrical"], answer: 1, difficulty: "medium" },
    { question: "True or False: Water boils at 100°C at sea level.", options: ["True", "False", "", ""], answer: 0, type: "truefalse", difficulty: "easy" },
    { question: "True or False: Humans share about 50% of their DNA with bananas.", options: ["True", "False", "", ""], answer: 0, type: "truefalse", difficulty: "hard" },
    { question: "The chemical symbol 'Fe' stands for:", options: ["Fine", "Ferro", "Iron", "Fluorine"], answer: 2, type: "fillblank", difficulty: "medium" },
    { question: "_____ is the study of fossils.", options: ["Paleontology", "Archaeology", "Geology", "Biology"], answer: 0, type: "fillblank", difficulty: "medium" }
  ],
  "Geography": [
    { question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], answer: 2, difficulty: "easy" },
    { question: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3, difficulty: "easy" },
    { question: "What is the capital of Japan?", options: ["Beijing", "Seoul", "Tokyo", "Bangkok"], answer: 2, difficulty: "easy" },
    { question: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], answer: 2, difficulty: "medium" },
    { question: "What is the smallest country in the world?", options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"], answer: 1, difficulty: "easy" },
    { question: "What is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], answer: 1, difficulty: "medium" },
    { question: "What is the capital of Brazil?", options: ["Rio de Janeiro", "Sao Paulo", "Brasilia", "Salvador"], answer: 2, difficulty: "medium" },
    { question: "How many continents are there?", options: ["5", "6", "7", "8"], answer: 2, difficulty: "easy" },
    { question: "What is the largest desert in the world?", options: ["Sahara", "Arabian", "Gobi", "Antarctic"], answer: 3, difficulty: "hard" },
    { question: "Which country has the most population?", options: ["India", "USA", "China", "Indonesia"], answer: 2, difficulty: "medium" },
    { question: "What is the capital of Canada?", options: ["Toronto", "Vancouver", "Ottawa", "Montreal"], answer: 2, difficulty: "medium" },
    { question: "What is the tallest mountain in the world?", options: ["K2", "Kangchenjunga", "Mount Everest", "Lhotse"], answer: 2, difficulty: "easy" },
    { question: "True or False: Africa is the largest continent.", options: ["True", "False", "", ""], answer: 1, type: "truefalse", difficulty: "easy" },
    { question: "True or False: The Amazon River is the longest river.", options: ["True", "False", "", ""], answer: 1, type: "truefalse", difficulty: "medium" },
    { question: "_____ is the capital of Egypt.", options: ["Alexandria", "Cairo", "Luxor", "Giza"], answer: 1, type: "fillblank", difficulty: "easy" }
  ],
  "History": [
    { question: "What year did World War II end?", options: ["1943", "1944", "1945", "1946"], answer: 2, difficulty: "easy" },
    { question: "What year did the Titanic sink?", options: ["1910", "1911", "1912", "1913"], answer: 2, difficulty: "medium" },
    { question: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Michelangelo"], answer: 2, difficulty: "easy" },
    { question: "Who wrote 'Romeo and Juliet'?", options: ["Dickens", "Shakespeare", "Austen", "Hemingway"], answer: 1, difficulty: "easy" },
    { question: "What year did the Berlin Wall fall?", options: ["1987", "1988", "1989", "1990"], answer: 2, difficulty: "medium" },
    { question: "Who was the first President of the United States?", options: ["Lincoln", "Jefferson", "Washington", "Adams"], answer: 2, difficulty: "easy" },
    { question: "What ancient wonder was located in Egypt?", options: ["Colossus", "Hanging Gardens", "Great Pyramid", "Lighthouse"], answer: 2, difficulty: "easy" },
    { question: "Who discovered America in 1492?", options: ["Magellan", "Columbus", "Vespucci", "Cook"], answer: 1, difficulty: "easy" },
    { question: "What year did World War I start?", options: ["1912", "1913", "1914", "1915"], answer: 2, difficulty: "medium" },
    { question: "Who was the first man on the moon?", options: ["Buzz Aldrin", "Neil Armstrong", "Michael Collins", "Yuri Gagarin"], answer: 1, difficulty: "easy" },
    { question: "What empire was ruled by Julius Caesar?", options: ["Greek", "Persian", "Roman", "Ottoman"], answer: 2, difficulty: "easy" },
    { question: "True or False: The Cold War ended in 1989.", options: ["True", "False", "", ""], answer: 1, type: "truefalse", difficulty: "hard" },
    { question: "_____ built the Taj Mahal.", options: ["Akbar", "Shah Jahan", "Humayun", "Aurangzeb"], answer: 1, type: "fillblank", difficulty: "medium" }
  ],
  "Space": [
    { question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answer: 1, difficulty: "easy" },
    { question: "Which planet is closest to the Sun?", options: ["Venus", "Mercury", "Earth", "Mars"], answer: 1, difficulty: "easy" },
    { question: "How many planets are in our solar system?", options: ["7", "8", "9", "10"], answer: 1, difficulty: "easy" },
    { question: "What is the largest planet in our solar system?", options: ["Saturn", "Neptune", "Jupiter", "Uranus"], answer: 2, difficulty: "easy" },
    { question: "What galaxy is Earth located in?", options: ["Andromeda", "Milky Way", "Triangulum", "Sombrero"], answer: 1, difficulty: "easy" },
    { question: "What is a light-year a measure of?", options: ["Time", "Distance", "Speed", "Brightness"], answer: 1, difficulty: "medium" },
    { question: "Which planet has the most rings?", options: ["Jupiter", "Saturn", "Uranus", "Neptune"], answer: 1, difficulty: "easy" },
    { question: "What causes a solar eclipse?", options: ["Earth's shadow", "Moon blocking Sun", "Venus passing Sun", "Sun's rotation"], answer: 1, difficulty: "easy" },
    { question: "What is the largest moon in our solar system?", options: ["Titan", "Ganymede", "Callisto", "Europa"], answer: 1, difficulty: "hard" },
    { question: "What is the Great Red Spot on Jupiter?", options: ["Volcano", "Storm", "Crater", "Mountain"], answer: 1, difficulty: "medium" },
    { question: "True or False: Venus is the hottest planet.", options: ["True", "False", "", ""], answer: 0, type: "truefalse", difficulty: "medium" },
    { question: "_____ is Earth's natural satellite.", options: ["The Moon", "Mars", "Venus", "The Sun"], answer: 0, type: "fillblank", difficulty: "easy" }
  ],
  "Entertainment": [
    { question: "How many strings does a guitar have?", options: ["4", "5", "6", "7"], answer: 2, difficulty: "easy" },
    { question: "In what year was the first iPhone released?", options: ["2005", "2006", "2007", "2008"], answer: 2, difficulty: "medium" },
    { question: "How many Harry Potter books are there?", options: ["6", "7", "8", "9"], answer: 1, difficulty: "easy" },
    { question: "Who played Jack in Titanic?", options: ["Brad Pitt", "Leonardo DiCaprio", "Johnny Depp", "Tom Cruise"], answer: 1, difficulty: "easy" },
    { question: "What is the name of Batman's butler?", options: ["James", "Alfred", "Bruce", "Thomas"], answer: 1, difficulty: "easy" },
    { question: "How many Marvel Infinity Stones are there?", options: ["4", "5", "6", "7"], answer: 2, difficulty: "easy" },
    { question: "What animated film features Simba?", options: ["Bambi", "The Lion King", "Jungle Book", "Tarzan"], answer: 1, difficulty: "easy" },
    { question: "Who sang 'Thriller'?", options: ["Prince", "Michael Jackson", "Whitney Houston", "Stevie Wonder"], answer: 1, difficulty: "easy" },
    { question: "What is the best-selling video game of all time?", options: ["Tetris", "Minecraft", "GTA V", "Wii Sports"], answer: 1, difficulty: "medium" },
    { question: "What band was Freddie Mercury in?", options: ["The Beatles", "Led Zeppelin", "Queen", "Pink Floyd"], answer: 2, difficulty: "easy" },
    { question: "True or False: There are 8 Harry Potter movies.", options: ["True", "False", "", ""], answer: 0, type: "truefalse", difficulty: "easy" },
    { question: "_____ produced Stranger Things.", options: ["Netflix", "Amazon", "Hulu", "Disney"], answer: 0, type: "fillblank", difficulty: "easy" }
  ],
  "Sports": [
    { question: "How many players are on a soccer team?", options: ["9", "10", "11", "12"], answer: 2, difficulty: "easy" },
    { question: "What sport is America's pastime?", options: ["Football", "Basketball", "Baseball", "Hockey"], answer: 2, difficulty: "easy" },
    { question: "How many rings are on the Olympic flag?", options: ["4", "5", "6", "7"], answer: 1, difficulty: "easy" },
    { question: "How long is a marathon?", options: ["26.2 miles", "25 miles", "30 miles", "28 miles"], answer: 0, difficulty: "medium" },
    { question: "What sport does Tiger Woods play?", options: ["Tennis", "Golf", "Cricket", "Polo"], answer: 1, difficulty: "easy" },
    { question: "How many points is a touchdown worth?", options: ["5", "6", "7", "8"], answer: 1, difficulty: "easy" },
    { question: "What sport uses a shuttlecock?", options: ["Tennis", "Squash", "Badminton", "Table Tennis"], answer: 2, difficulty: "easy" },
    { question: "What country is famous for sumo wrestling?", options: ["China", "Korea", "Japan", "Thailand"], answer: 2, difficulty: "easy" },
    { question: "True or False: Basketball has 5 players per team on court.", options: ["True", "False", "", ""], answer: 0, type: "truefalse", difficulty: "easy" },
    { question: "_____ hosts Wimbledon.", options: ["London", "Paris", "New York", "Melbourne"], answer: 0, type: "fillblank", difficulty: "medium" }
  ],
  "Food": [
    { question: "Which country invented pizza?", options: ["USA", "Italy", "France", "Greece"], answer: 1, difficulty: "easy" },
    { question: "What is the main ingredient in guacamole?", options: ["Tomato", "Avocado", "Pepper", "Onion"], answer: 1, difficulty: "easy" },
    { question: "What type of food is sushi?", options: ["Chinese", "Korean", "Japanese", "Thai"], answer: 2, difficulty: "easy" },
    { question: "What fruit is used to make wine?", options: ["Apple", "Grape", "Pear", "Peach"], answer: 1, difficulty: "easy" },
    { question: "What is the main ingredient in chocolate?", options: ["Coffee beans", "Cocoa beans", "Vanilla beans", "Carob beans"], answer: 1, difficulty: "easy" },
    { question: "True or False: French fries originated in France.", options: ["True", "False", "", ""], answer: 1, type: "truefalse", difficulty: "medium" },
    { question: "_____ is the main ingredient in tofu.", options: ["Rice", "Soybeans", "Wheat", "Corn"], answer: 1, type: "fillblank", difficulty: "medium" }
  ],
  "Technology": [
    { question: "Who founded Apple?", options: ["Bill Gates", "Steve Jobs", "Mark Zuckerberg", "Jeff Bezos"], answer: 1, difficulty: "easy" },
    { question: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Power Unit", "Central Power Unit", "Computer Processing Unit"], answer: 0, difficulty: "medium" },
    { question: "What year was Google founded?", options: ["1996", "1997", "1998", "1999"], answer: 2, difficulty: "medium" },
    { question: "Who is the CEO of Tesla?", options: ["Jeff Bezos", "Elon Musk", "Tim Cook", "Sundar Pichai"], answer: 1, difficulty: "easy" },
    { question: "What does AI stand for?", options: ["Automated Intelligence", "Artificial Intelligence", "Advanced Intelligence", "Automated Interface"], answer: 1, difficulty: "easy" },
    { question: "What company created the Xbox?", options: ["Sony", "Nintendo", "Microsoft", "Sega"], answer: 2, difficulty: "easy" },
    { question: "True or False: Python was named after a snake.", options: ["True", "False", "", ""], answer: 1, type: "truefalse", difficulty: "hard" },
    { question: "_____ owns Instagram.", options: ["Google", "Twitter", "Meta", "Microsoft"], answer: 2, type: "fillblank", difficulty: "easy" }
  ]
};

const THEMES = Object.keys(QUESTIONS_BY_THEME);

const GAME_MODES = {
  "Classic": { name: "Classic Trivia", description: "Answer questions, earn points!", questions: 15, timeLimit: 10, icon: "🎯" },
  "Speed": { name: "Speed Round", description: "Faster questions, higher stakes!", questions: 15, timeLimit: 5, icon: "⚡" },
  "Survival": { name: "Survival Mode", description: "3 lives - one wrong = lose a life!", questions: 20, timeLimit: 10, icon: "❤️" },
  "Betting": { name: "Betting Mode", description: "Bet your points before each question!", questions: 10, timeLimit: 12, icon: "🎰" },
  "Lightning": { name: "Lightning Round", description: "Rapid-fire 3 second questions!", questions: 20, timeLimit: 3, icon: "🌩️" },
  "Team": { name: "Team Battle", description: "2v2 or 3v3 team competition!", questions: 15, timeLimit: 10, icon: "👥" },
  "BattleRoyale": { name: "Battle Royale", description: "10 players, last one standing!", questions: 25, timeLimit: 8, icon: "🔫" },
  "Blitz": { name: "Blitz Mode", description: "Infinite questions until you miss!", questions: 999, timeLimit: 7, icon: "💥" },
  "Reverse": { name: "Reverse Trivia", description: "Guess the question from answers!", questions: 12, timeLimit: 15, icon: "🔄" }
};

const DIFFICULTIES = {
  "easy": { name: "Easy", pointMultiplier: 1, icon: "🟢" },
  "medium": { name: "Medium", pointMultiplier: 1.5, icon: "🟡" },
  "hard": { name: "Hard", pointMultiplier: 2, icon: "🔴" },
  "mixed": { name: "Mixed", pointMultiplier: 1.25, icon: "🟣" }
};

const MASCOTS = ['🦊', '🐸', '🦁', '🐼', '🦄', '🐱', '🐶', '🐰', '🐻', '🦋', '🦅', '🐺', '🦈', '🐬', '🦉', '🐨', '🦜', '🐯', '🦩', '🐧', '🦚', '🦢', '🦤', '🦥', '🦦', '🦨', '🦘', '🦬', '🦙', '🦒'];

const SUPERPOWERS = [
  { id: 'fifty_fifty', name: '50/50', description: 'Remove 2 wrong answers', icon: '✂️' },
  { id: 'time_freeze', name: 'Time Freeze', description: '+5 seconds', icon: '⏱️' },
  { id: 'double_points', name: 'Double Points', description: '2x points this round', icon: '✨' },
  { id: 'shield', name: 'Shield', description: 'Protected from one wrong answer', icon: '🛡️' },
  { id: 'peek', name: 'Peek', description: 'See most popular answer', icon: '👁️' },
  { id: 'second_chance', name: 'Second Chance', description: 'Answer again if wrong', icon: '🔄' },
  { id: 'steal', name: 'Steal', description: 'Steal 50 points from a random player', icon: '💰' },
  { id: 'freeze_player', name: 'Freeze', description: 'Freeze another player for 5 seconds', icon: '❄️' },
  { id: 'imposter', name: 'Imposter', description: 'Swap scores with another player', icon: '🎭' },
  { id: 'oracle', name: 'Oracle', description: 'Dimly highlight correct answer', icon: '🔮' },
  { id: 'bomb', name: 'Bomb', description: 'Everyone else loses 30 points', icon: '💣' },
  { id: 'gamble', name: 'Gamble', description: 'Random -50 to +200 points', icon: '🎲' },
  { id: 'ban', name: 'Ban', description: 'Ban one answer for everyone', icon: '📛' }
];

const COLORS = [
  'linear-gradient(135deg, #00d4ff, #0099cc)',
  'linear-gradient(135deg, #7c3aed, #5b21b6)',
  'linear-gradient(135deg, #f472b6, #db2777)',
  'linear-gradient(135deg, #22c55e, #16a34a)',
  'linear-gradient(135deg, #f59e0b, #d97706)',
  'linear-gradient(135deg, #ef4444, #dc2626)',
  'linear-gradient(135deg, #06b6d4, #0891b2)',
  'linear-gradient(135deg, #8b5cf6, #7c3aed)',
  'linear-gradient(135deg, #ec4899, #db2777)',
  'linear-gradient(135deg, #14b8a6, #0d9488)'
];

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;
const MAX_POINTS = 100;
const SPEED_BONUS_MULTIPLIER = 10;
const STREAK_BONUS = 10;
const MAX_STREAK_BONUS = 50;

let rooms = new Map();
let questionTimers = new Map();
let connectedUsers = new Map();

function generateCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getRandomSuperpower() {
  return SUPERPOWERS[Math.floor(Math.random() * SUPERPOWERS.length)];
}

function filterQuestionsByDifficulty(questions, difficulty) {
  if (difficulty === 'mixed') return questions;
  return questions.filter(q => q.difficulty === difficulty || !q.difficulty);
}

function getRandomQuestions(theme, count, difficulty = 'mixed') {
  let questions = theme === 'Random' 
    ? Object.values(QUESTIONS_BY_THEME).flat()
    : QUESTIONS_BY_THEME[theme] || Object.values(QUESTIONS_BY_THEME).flat();
  
  const customQuestions = Questions.getApproved(theme === 'Random' ? null : theme);
  questions = [...questions, ...customQuestions.map(q => ({
    question: q.question,
    options: [q.option_a, q.option_b, q.option_c, q.option_d],
    answer: q.correct_answer,
    difficulty: q.difficulty
  }))];
  
  if (difficulty !== 'mixed') {
    questions = filterQuestionsByDifficulty(questions, difficulty);
  }
  
  return shuffleArray(questions).slice(0, count);
}

function createReverseQuestion(question) {
  const correctOption = question.options[question.answer];
  return {
    question: `What question has "${correctOption}" as its answer?`,
    options: [
      `About: ${question.question}`,
      `About: ${shuffleArray(QUESTIONS_BY_THEME['Science'])[0]?.question || 'Random fact'}`,
      `About: ${shuffleArray(QUESTIONS_BY_THEME['Geography'])[0]?.question || 'Another fact'}`,
      `About: ${shuffleArray(QUESTIONS_BY_THEME['History'])[0]?.question || 'Historical fact'}`
    ],
    answer: 0,
    original: question
  };
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
        color: socket.data.color,
        answered: socket.data.answered,
        superpowers: socket.data.superpowers,
        shieldActive: socket.data.shieldActive,
        hasSecondChance: socket.data.hasSecondChance,
        lives: socket.data.lives,
        bet: socket.data.bet,
        frozen: socket.data.frozen,
        frozenUntil: socket.data.frozenUntil,
        streak: socket.data.streak,
        userId: socket.data.userId,
        team: socket.data.team
      } : null;
    })
    .filter(Boolean);
}

function clearTimer(roomCode) {
  if (questionTimers.has(roomCode)) {
    clearTimeout(questionTimers.get(roomCode));
    questionTimers.delete(roomCode);
  }
}

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || username.length < 2 || username.length > 15) {
    return res.status(400).json({ error: 'Username must be 2-15 characters' });
  }
  if (!password || password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters' });
  }
  
  try {
    const user = User.create(username, password);
    res.json({ success: true, user });
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT') {
      res.status(400).json({ error: 'Username already taken' });
    } else {
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = User.validatePassword(username, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  res.json({ success: true, user });
});

app.get('/api/user/:id', (req, res) => {
  const user = User.getById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

app.get('/api/leaderboard/:type', (req, res) => {
  const leaderboard = User.getLeaderboard(req.params.type, 100);
  res.json(leaderboard);
});

app.post('/api/daily-reward/:id', (req, res) => {
  const result = User.claimDailyReward(req.params.id);
  res.json(result);
});

app.get('/api/inventory/:id', (req, res) => {
  const inventory = User.getInventory(req.params.id);
  res.json(inventory);
});

app.get('/api/achievements/:id', (req, res) => {
  const achievements = User.getAchievements(req.params.id);
  res.json(achievements);
});

app.post('/api/equip-avatar', (req, res) => {
  const { userId, avatarId } = req.body;
  User.equipAvatar(userId, avatarId);
  res.json({ success: true });
});

app.post('/api/equip-color', (req, res) => {
  const { userId, colorId } = req.body;
  User.equipColor(userId, colorId);
  res.json({ success: true });
});

app.post('/api/buy-avatar', (req, res) => {
  const { userId, avatarId } = req.body;
  const result = User.buyAvatar(userId, avatarId);
  res.json(result);
});

app.post('/api/buy-color', (req, res) => {
  const { userId, colorId } = req.body;
  const result = User.buyColor(userId, colorId);
  res.json(result);
});

app.get('/api/friends/:id', (req, res) => {
  const friends = Friends.getFriends(req.params.id);
  res.json(friends);
});

app.post('/api/friend-request', (req, res) => {
  const { userId, friendId } = req.body;
  const result = Friends.add(userId, friendId);
  res.json(result);
});

app.post('/api/friend-accept', (req, res) => {
  const { userId, friendId } = req.body;
  Friends.accept(userId, friendId);
  res.json({ success: true });
});

app.post('/api/submit-question', (req, res) => {
  const { userId, question, options, correctAnswer, theme, difficulty } = req.body;
  const id = Questions.submit(userId, question, options, correctAnswer, theme, difficulty);
  res.json({ success: true, id });
});

io.on('connection', (socket) => {
  socket.data.score = 0;
  socket.data.name = '';
  socket.data.currentRoom = null;
  socket.data.mascot = MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
  socket.data.color = COLORS[Math.floor(Math.random() * COLORS.length)];
  socket.data.answered = false;
  socket.data.superpowers = [];
  socket.data.shieldActive = false;
  socket.data.hasSecondChance = false;
  socket.data.lives = 3;
  socket.data.bet = 0;
  socket.data.frozen = false;
  socket.data.frozenUntil = 0;
  socket.data.usedFiftyFifty = null;
  socket.data.doublePointsActive = false;
  socket.data.streak = 0;
  socket.data.correctThisGame = 0;
  socket.data.userId = null;
  socket.data.team = null;

  socket.on('set-user', (userData) => {
    socket.data.userId = userData.id;
    socket.data.name = userData.username;
    socket.data.mascot = userData.equippedAvatar || MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
    socket.data.color = userData.equippedColor || COLORS[Math.floor(Math.random() * COLORS.length)];
    connectedUsers.set(userData.id, socket.id);
  });

  socket.on('create-room', ({ name, theme, gameMode, avatar, color, settings }) => {
    const roomCode = generateCode();
    socket.data.name = name;
    socket.data.score = 0;
    socket.data.answered = false;
    socket.data.superpowers = [];
    socket.data.shieldActive = false;
    socket.data.hasSecondChance = false;
    socket.data.lives = 3;
    socket.data.bet = 0;
    socket.data.frozen = false;
    socket.data.frozenUntil = 0;
    socket.data.streak = 0;
    socket.data.correctThisGame = 0;
    socket.data.mascot = avatar || MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
    socket.data.color = color || COLORS[Math.floor(Math.random() * COLORS.length)];
    socket.data.team = null;
    
    const mode = GAME_MODES[gameMode] || GAME_MODES["Classic"];
    const questionCount = settings?.questionCount || mode.questions;
    const timeLimit = settings?.timeLimit || mode.timeLimit;
    const difficulty = settings?.difficulty || 'mixed';
    const powerupsEnabled = settings?.powerupsEnabled !== false;
    const pointMultiplier = settings?.pointMultiplier || 1;
    
    const questions = getRandomQuestions(theme, questionCount, difficulty);
    
    rooms.set(roomCode, {
      host: socket.id,
      players: [socket.id],
      questions: questions,
      currentQuestion: 0,
      gameStarted: false,
      answers: new Map(),
      questionStartTime: null,
      theme: theme,
      gameMode: gameMode,
      bets: new Map(),
      settings: {
        questionCount,
        timeLimit,
        difficulty,
        powerupsEnabled,
        pointMultiplier
      },
      teams: { red: [], blue: [] }
    });
    
    socket.join(roomCode);
    socket.data.currentRoom = roomCode;
    
    socket.emit('room-created', { 
      roomCode, 
      isHost: true, 
      minPlayers: MIN_PLAYERS, 
      maxPlayers: MAX_PLAYERS, 
      themes: THEMES,
      gameModes: GAME_MODES,
      gameMode: gameMode,
      settings: rooms.get(roomCode).settings
    });
    io.to(roomCode).emit('players-update', { 
      players: getRoomPlayers(roomCode), 
      minPlayers: MIN_PLAYERS, 
      maxPlayers: MAX_PLAYERS, 
      gameMode: gameMode,
      teams: rooms.get(roomCode).teams
    });
  });

  socket.on('join-room', ({ roomCode, name, avatar, color }) => {
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
    socket.data.superpowers = [];
    socket.data.shieldActive = false;
    socket.data.hasSecondChance = false;
    socket.data.lives = 3;
    socket.data.bet = 0;
    socket.data.frozen = false;
    socket.data.frozenUntil = 0;
    socket.data.streak = 0;
    socket.data.correctThisGame = 0;
    socket.data.mascot = avatar || MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
    socket.data.color = color || COLORS[Math.floor(Math.random() * COLORS.length)];
    socket.data.team = null;
    
    room.players.push(socket.id);
    socket.join(roomCode);
    
    socket.emit('room-joined', { 
      roomCode, 
      isHost: false, 
      minPlayers: MIN_PLAYERS, 
      maxPlayers: MAX_PLAYERS,
      gameMode: room.gameMode,
      settings: room.settings
    });
    io.to(roomCode).emit('players-update', { 
      players: getRoomPlayers(roomCode), 
      minPlayers: MIN_PLAYERS, 
      maxPlayers: MAX_PLAYERS, 
      gameMode: room.gameMode,
      teams: room.teams
    });
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
    
    if (room.gameMode === 'Team') {
      const players = getRoomPlayers(roomCode);
      const shuffled = shuffleArray(players);
      shuffled.forEach((p, i) => {
        const s = io.sockets.sockets.get(p.id);
        if (s) {
          s.data.team = i % 2 === 0 ? 'red' : 'blue';
          room.teams[s.data.team].push(p.id);
        }
      });
      io.to(roomCode).emit('teams-assigned', { teams: room.teams });
    }
    
    const mode = GAME_MODES[room.gameMode] || GAME_MODES["Classic"];
    
    io.to(roomCode).emit('game-started', { 
      theme: room.theme, 
      totalQuestions: room.questions.length,
      gameMode: room.gameMode,
      timeLimit: room.settings.timeLimit,
      settings: room.settings
    });
    
    setTimeout(() => {
      if (room.gameMode === "Betting") {
        startBettingPhase(roomCode);
      } else {
        sendQuestion(roomCode);
      }
    }, 2000);
  });

  function startBettingPhase(roomCode) {
    const room = rooms.get(roomCode);
    if (!room) return;
    
    room.bets.clear();
    getRoomPlayers(roomCode).forEach(p => {
      const s = io.sockets.sockets.get(p.id);
      if (s) s.data.bet = 0;
    });
    
    io.to(roomCode).emit('betting-phase', {
      questionNumber: room.currentQuestion + 1,
      totalQuestions: room.questions.length
    });
    io.to(roomCode).emit('players-update', { 
      players: getRoomPlayers(roomCode), 
      minPlayers: MIN_PLAYERS, 
      maxPlayers: MAX_PLAYERS, 
      gameMode: room.gameMode,
      teams: room.teams
    });
    
    const timer = setTimeout(() => {
      sendQuestion(roomCode);
    }, 8000);
    questionTimers.set(roomCode, timer);
  }

  socket.on('place-bet', (amount) => {
    const roomCode = socket.data.currentRoom;
    const room = rooms.get(roomCode);
    
    if (!room || room.gameMode !== "Betting") return;
    
    const validAmount = Math.min(Math.max(0, amount), socket.data.score);
    socket.data.bet = validAmount;
    room.bets.set(socket.id, validAmount);
    
    io.to(roomCode).emit('players-update', { 
      players: getRoomPlayers(roomCode), 
      minPlayers: MIN_PLAYERS, 
      maxPlayers: MAX_PLAYERS, 
      gameMode: room.gameMode,
      teams: room.teams
    });
  });

  socket.on('all-bets-placed', () => {
    const roomCode = socket.data.currentRoom;
    const room = rooms.get(roomCode);
    
    if (!room || room.host !== socket.id) return;
    
    clearTimer(roomCode);
    sendQuestion(roomCode);
  });

  function sendQuestion(roomCode) {
    const room = rooms.get(roomCode);
    if (!room) return;
    
    clearTimer(roomCode);
    
    room.answers.clear();
    room.questionStartTime = Date.now();
    
    const mode = GAME_MODES[room.gameMode] || GAME_MODES["Classic"];
    const activePlayers = getRoomPlayers(roomCode).filter(p => {
      if (room.gameMode === "Survival" && p.lives <= 0) return false;
      return true;
    });
    
    activePlayers.forEach(p => {
      const s = io.sockets.sockets.get(p.id);
      if (s) {
        s.data.answered = false;
        s.data.usedFiftyFifty = null;
        s.data.doublePointsActive = false;
        
        const now = Date.now();
        if (s.data.frozenUntil && now < s.data.frozenUntil) {
          s.data.frozen = true;
        } else {
          s.data.frozen = false;
          s.data.frozenUntil = 0;
        }
      }
    });
    
    let question = room.questions[room.currentQuestion];
    
    if (room.gameMode === 'Reverse') {
      question = createReverseQuestion(question);
    }
    
    io.to(roomCode).emit('question', {
      question: question.question,
      options: question.options,
      questionNumber: room.currentQuestion + 1,
      totalQuestions: room.questions.length,
      timeLimit: room.settings.timeLimit,
      gameMode: room.gameMode,
      difficulty: question.difficulty,
      type: question.type
    });
    
    io.to(roomCode).emit('players-update', { 
      players: getRoomPlayers(roomCode), 
      minPlayers: MIN_PLAYERS, 
      maxPlayers: MAX_PLAYERS, 
      gameMode: room.gameMode,
      teams: room.teams
    });
    
    const timer = setTimeout(() => {
      revealAnswer(roomCode);
    }, room.settings.timeLimit * 1000);
    questionTimers.set(roomCode, timer);
  }

  socket.on('use-superpower', (powerId) => {
    const roomCode = socket.data.currentRoom;
    const room = rooms.get(roomCode);
    
    if (!room || !room.gameStarted) return;
    if (socket.data.answered || socket.data.frozen) return;
    if (!room.settings.powerupsEnabled) return;
    
    const powerIndex = socket.data.superpowers.findIndex(p => p.id === powerId);
    if (powerIndex === -1) return;
    
    const power = socket.data.superpowers[powerIndex];
    const players = getRoomPlayers(roomCode);
    
    switch(power.id) {
      case 'fifty_fifty':
        const question = room.questions[room.currentQuestion];
        const wrongIndices = [0, 1, 2, 3].filter(i => i !== question.answer);
        const toRemove = shuffleArray(wrongIndices).slice(0, 2);
        socket.data.usedFiftyFifty = toRemove;
        socket.emit('fifty-fifty', { remove: toRemove });
        break;
        
      case 'time_freeze':
        socket.emit('time-freeze', { extraSeconds: 5, timeLimit: room.settings.timeLimit });
        clearTimer(roomCode);
        const newTimer = setTimeout(() => {
          revealAnswer(roomCode);
        }, (room.settings.timeLimit + 5) * 1000);
        questionTimers.set(roomCode, newTimer);
        break;
        
      case 'double_points':
        socket.data.doublePointsActive = true;
        socket.emit('double-points-activated');
        break;
        
      case 'shield':
        socket.data.shieldActive = true;
        socket.emit('shield-activated');
        break;
        
      case 'second_chance':
        socket.data.hasSecondChance = true;
        socket.emit('second-chance-activated');
        break;
        
      case 'peek':
        const answers = [];
        room.answers.forEach((data, socketId) => {
          answers.push(data.answerIndex);
        });
        if (answers.length > 0) {
          const counts = [0, 0, 0, 0];
          answers.forEach(a => counts[a]++);
          const maxCount = Math.max(...counts);
          const popular = counts.indexOf(maxCount);
          socket.emit('peek-result', { popularAnswer: popular, count: maxCount, total: answers.length });
        } else {
          socket.emit('peek-result', { popularAnswer: -1, count: 0, total: 0 });
        }
        break;
        
      case 'steal':
        const stealTargets = players.filter(p => p.id !== socket.id && p.score > 0);
        if (stealTargets.length > 0) {
          const victim = stealTargets[Math.floor(Math.random() * stealTargets.length)];
          const victimSocket = io.sockets.sockets.get(victim.id);
          const stealAmount = Math.min(50, victim.score);
          victimSocket.data.score -= stealAmount;
          socket.data.score += stealAmount;
          socket.emit('steal-result', { victim: victim.name, amount: stealAmount });
          victimSocket.emit('stolen', { thief: socket.data.name, amount: stealAmount });
        }
        break;
        
      case 'freeze_player':
        const freezeTargets = players.filter(p => p.id !== socket.id);
        if (freezeTargets.length > 0) {
          const target = freezeTargets[Math.floor(Math.random() * freezeTargets.length)];
          const targetSocket = io.sockets.sockets.get(target.id);
          targetSocket.data.frozen = true;
          targetSocket.data.frozenUntil = Date.now() + 5000;
          socket.emit('freeze-result', { target: target.name });
          targetSocket.emit('frozen', { freezer: socket.data.name });
        }
        break;
        
      case 'imposter':
        const swapTargets = players.filter(p => p.id !== socket.id);
        if (swapTargets.length > 0) {
          const target = swapTargets[Math.floor(Math.random() * swapTargets.length)];
          const targetSocket = io.sockets.sockets.get(target.id);
          const tempScore = socket.data.score;
          socket.data.score = targetSocket.data.score;
          targetSocket.data.score = tempScore;
          socket.emit('imposter-result', { target: target.name, newScore: socket.data.score });
          targetSocket.emit('swapped', { thief: socket.data.name, newScore: targetSocket.data.score });
        }
        break;
        
      case 'oracle':
        const oracleQuestion = room.questions[room.currentQuestion];
        socket.emit('oracle-result', { correctAnswer: oracleQuestion.answer });
        break;
        
      case 'bomb':
        players.forEach(p => {
          if (p.id !== socket.id) {
            const s = io.sockets.sockets.get(p.id);
            if (s && s.data.score > 0) {
              s.data.score = Math.max(0, s.data.score - 30);
              s.emit('bombed', { bomber: socket.data.name });
            }
          }
        });
        socket.emit('bomb-result');
        break;
        
      case 'gamble':
        const gambleResult = Math.floor(Math.random() * 251) - 50;
        socket.data.score = Math.max(0, socket.data.score + gambleResult);
        socket.emit('gamble-result', { amount: gambleResult, newScore: socket.data.score });
        break;
        
      case 'ban':
        const banQuestion = room.questions[room.currentQuestion];
        const banWrongIndices = [0, 1, 2, 3].filter(i => i !== banQuestion.answer);
        const bannedAnswer = banWrongIndices[Math.floor(Math.random() * banWrongIndices.length)];
        io.to(roomCode).emit('answer-banned', { bannedAnswer, banner: socket.data.name });
        break;
    }
    
    socket.data.superpowers.splice(powerIndex, 1);
    io.to(roomCode).emit('players-update', { 
      players: getRoomPlayers(roomCode), 
      minPlayers: MIN_PLAYERS, 
      maxPlayers: MAX_PLAYERS, 
      gameMode: room.gameMode,
      teams: room.teams
    });
  });

  socket.on('submit-answer', (answerIndex) => {
    const roomCode = socket.data.currentRoom;
    const room = rooms.get(roomCode);
    
    if (!room || !room.gameStarted) return;
    if (socket.data.answered && !socket.data.hasSecondChance) return;
    if (socket.data.frozen) return;
    
    const timeTaken = (Date.now() - room.questionStartTime) / 1000;
    const speedBonus = Math.max(0, Math.floor((room.settings.timeLimit - timeTaken) * SPEED_BONUS_MULTIPLIER));
    
    if (socket.data.hasSecondChance && socket.data.answered) {
      socket.data.hasSecondChance = false;
    }
    
    socket.data.answered = true;
    
    let pointsMultiplier = socket.data.doublePointsActive ? 2 : 1;
    pointsMultiplier *= room.settings.pointMultiplier;
    socket.data.doublePointsActive = false;
    
    room.answers.set(socket.id, { 
      answerIndex, 
      timeTaken, 
      speedBonus,
      pointsMultiplier,
      shieldActive: socket.data.shieldActive,
      bet: socket.data.bet
    });
    
    io.to(roomCode).emit('players-update', { 
      players: getRoomPlayers(roomCode), 
      minPlayers: MIN_PLAYERS, 
      maxPlayers: MAX_PLAYERS, 
      gameMode: room.gameMode,
      teams: room.teams
    });
    
    const activePlayers = getRoomPlayers(roomCode).filter(p => {
      if (room.gameMode === "Survival" && p.lives <= 0) return false;
      if (p.frozen) return false;
      return true;
    });
    
    if (room.answers.size >= activePlayers.length) {
      clearTimer(roomCode);
      setTimeout(() => revealAnswer(roomCode), 500);
    }
  });

  function revealAnswer(roomCode) {
    const room = rooms.get(roomCode);
    if (!room) return;
    
    clearTimer(roomCode);
    
    const question = room.questions[room.currentQuestion];
    const results = [];
    const mode = GAME_MODES[room.gameMode] || GAME_MODES["Classic"];
    const difficultyMult = DIFFICULTIES[question.difficulty]?.pointMultiplier || 1;
    
    room.answers.forEach((data, socketId) => {
      const playerSocket = io.sockets.sockets.get(socketId);
      if (playerSocket) {
        let correct = data.answerIndex === question.answer;
        let points = 0;
        
        if (room.gameMode === "Betting") {
          if (correct) {
            points = data.bet + Math.floor((MAX_POINTS + data.speedBonus) * difficultyMult);
            playerSocket.data.score += points;
          } else {
            playerSocket.data.score -= data.bet;
            points = -data.bet;
          }
        } else if (room.gameMode === "Survival") {
          if (!correct && !data.shieldActive) {
            playerSocket.data.lives--;
            if (playerSocket.data.lives < 0) playerSocket.data.lives = 0;
          } else if (correct) {
            points = Math.floor((MAX_POINTS + data.speedBonus) * data.pointsMultiplier * difficultyMult);
            
            const streakBonus = Math.min(playerSocket.data.streak * STREAK_BONUS, MAX_STREAK_BONUS);
            points += streakBonus;
            
            playerSocket.data.score += points;
            playerSocket.data.streak++;
            playerSocket.data.correctThisGame++;
            
            if (playerSocket.data.streak > playerSocket.data.bestStreakThisGame) {
              playerSocket.data.bestStreakThisGame = playerSocket.data.streak;
            }
            
            if (room.settings.powerupsEnabled && Math.random() < 0.35) {
              const newPower = getRandomSuperpower();
              playerSocket.data.superpowers.push(newPower);
              playerSocket.emit('superpower-earned', newPower);
            }
          } else if (!correct && data.shieldActive) {
            playerSocket.data.shieldActive = false;
            playerSocket.data.streak = 0;
          }
          if (!correct && !data.shieldActive) {
            playerSocket.data.streak = 0;
          }
        } else if (room.gameMode === "Blitz") {
          if (!correct && !data.shieldActive) {
            playerSocket.data.lives = 0;
            playerSocket.data.streak = 0;
          } else if (correct) {
            points = Math.floor((MAX_POINTS + data.speedBonus) * data.pointsMultiplier * difficultyMult);
            const streakBonus = Math.min(playerSocket.data.streak * STREAK_BONUS, MAX_STREAK_BONUS);
            points += streakBonus;
            playerSocket.data.score += points;
            playerSocket.data.streak++;
            playerSocket.data.correctThisGame++;
            
            if (room.settings.powerupsEnabled && Math.random() < 0.35) {
              const newPower = getRandomSuperpower();
              playerSocket.data.superpowers.push(newPower);
              playerSocket.emit('superpower-earned', newPower);
            }
          }
        } else {
          if (!correct && data.shieldActive) {
            correct = true;
            points = 50;
            playerSocket.data.shieldActive = false;
          }
          
          if (correct) {
            points = Math.floor((MAX_POINTS + data.speedBonus) * data.pointsMultiplier * difficultyMult);
            const streakBonus = Math.min(playerSocket.data.streak * STREAK_BONUS, MAX_STREAK_BONUS);
            points += streakBonus;
            playerSocket.data.score += points;
            playerSocket.data.streak++;
            playerSocket.data.correctThisGame++;
            
            if (room.settings.powerupsEnabled && Math.random() < 0.35) {
              const newPower = getRandomSuperpower();
              playerSocket.data.superpowers.push(newPower);
              playerSocket.emit('superpower-earned', newPower);
            }
          } else {
            playerSocket.data.streak = 0;
          }
        }
        
        results.push({
          name: playerSocket.data.name,
          mascot: playerSocket.data.mascot,
          answer: data.answerIndex,
          correct,
          points: correct ? points : (room.gameMode === "Betting" ? -data.bet : 0),
          time: data.timeTaken.toFixed(1),
          speedBonus: data.speedBonus,
          lives: playerSocket.data.lives,
          streak: playerSocket.data.streak
        });
      }
    });
    
    results.sort((a, b) => {
      if (a.correct !== b.correct) return b.correct - a.correct;
      return a.time - b.time;
    });
    
    const teamScores = { red: 0, blue: 0 };
    if (room.gameMode === 'Team') {
      getRoomPlayers(roomCode).forEach(p => {
        if (p.team) {
          teamScores[p.team] += p.score;
        }
      });
    }
    
    io.to(roomCode).emit('answer-reveal', {
      correctAnswer: question.answer,
      results,
      scores: getRoomPlayers(roomCode),
      isLastQuestion: room.currentQuestion >= room.questions.length - 1,
      gameMode: room.gameMode,
      teamScores
    });
  }

  socket.on('next-question', () => {
    const roomCode = socket.data.currentRoom;
    const room = rooms.get(roomCode);
    
    if (!room || room.host !== socket.id) return;
    
    clearTimer(roomCode);
    room.currentQuestion++;
    
    if (room.gameMode === "Survival") {
      const alivePlayers = getRoomPlayers(roomCode).filter(p => p.lives > 0);
      if (alivePlayers.length <= 1) {
        endGame(roomCode);
        return;
      }
    }
    
    if (room.gameMode === "Blitz") {
      const alivePlayers = getRoomPlayers(roomCode).filter(p => p.lives > 0);
      if (alivePlayers.length <= 1) {
        endGame(roomCode);
        return;
      }
    }
    
    if (room.gameMode === "BattleRoyale") {
      const alivePlayers = getRoomPlayers(roomCode).filter(p => p.lives > 0);
      if (alivePlayers.length <= 1) {
        endGame(roomCode);
        return;
      }
    }
    
    if (room.currentQuestion < room.questions.length) {
      if (room.gameMode === "Betting") {
        startBettingPhase(roomCode);
      } else {
        sendQuestion(roomCode);
      }
    } else {
      endGame(roomCode);
    }
  });

  function endGame(roomCode) {
    clearTimer(roomCode);
    const room = rooms.get(roomCode);
    if (!room) return;
    
    let players = getRoomPlayers(roomCode);
    players.sort((a, b) => b.score - a.score);
    
    const gameStats = {
      gameMode: room.gameMode,
      theme: room.theme,
      playersCount: players.length
    };
    
    players.forEach((p, rank) => {
      if (p.userId) {
        const xpGained = Math.floor((p.score / 10) + (rank === 0 ? 100 : rank === 1 ? 50 : rank === 2 ? 25 : 10));
        const coinsGained = Math.floor(p.score / 20) + (rank === 0 ? 20 : 10);
        
        User.addXp(p.userId, xpGained);
        User.addCoins(p.userId, coinsGained);
        User.updateStats(p.userId, {
          gamesPlayed: 1,
          gamesWon: rank === 0 ? 1 : 0,
          correctAnswers: p.correctThisGame || 0,
          questionsAnswered: room.questions.length,
          bestStreak: p.bestStreakThisGame || 0
        });
        
        User.checkAchievements(p.userId, {
          gamesPlayed: 1,
          gamesWon: rank === 0 ? 1 : 0,
          streak: p.bestStreakThisGame || 0
        });
        
        GameHistory.record(p.userId, {
          roomCode,
          gameMode: room.gameMode,
          theme: room.theme,
          score: p.score,
          correctAnswers: p.correctThisGame || 0,
          totalQuestions: room.questions.length,
          rank: rank + 1,
          playersCount: players.length,
          xpEarned: xpGained,
          coinsEarned: coinsGained
        });
        
        p.xpGained = xpGained;
        p.coinsGained = coinsGained;
      }
    });
    
    let teamScores = null;
    if (room.gameMode === 'Team') {
      teamScores = { red: 0, blue: 0 };
      players.forEach(p => {
        if (p.team) {
          teamScores[p.team] += p.score;
        }
      });
    }
    
    io.to(roomCode).emit('game-over', {
      rankings: players,
      teamScores,
      gameMode: room.gameMode
    });
    
    rooms.delete(roomCode);
  }

  socket.on('rematch', () => {
    const roomCode = socket.data.currentRoom;
    const room = rooms.get(roomCode);
    
    if (!room || room.host !== socket.id) return;
    
    const players = getRoomPlayers(roomCode);
    const newRoomCode = generateCode();
    const newQuestions = getRandomQuestions(room.theme, room.settings.questionCount, room.settings.difficulty);
    
    rooms.set(newRoomCode, {
      host: socket.id,
      players: room.players,
      questions: newQuestions,
      currentQuestion: 0,
      gameStarted: false,
      answers: new Map(),
      questionStartTime: null,
      theme: room.theme,
      gameMode: room.gameMode,
      bets: new Map(),
      settings: room.settings,
      teams: { red: [], blue: [] }
    });
    
    players.forEach(p => {
      const s = io.sockets.sockets.get(p.id);
      if (s) {
        s.leave(roomCode);
        s.join(newRoomCode);
        s.data.currentRoom = newRoomCode;
        s.data.score = 0;
        s.data.answered = false;
        s.data.superpowers = [];
        s.data.shieldActive = false;
        s.data.hasSecondChance = false;
        s.data.lives = 3;
        s.data.bet = 0;
        s.data.frozen = false;
        s.data.frozenUntil = 0;
        s.data.streak = 0;
        s.data.correctThisGame = 0;
        s.data.team = null;
        
        s.emit('room-created', {
          roomCode: newRoomCode,
          isHost: p.id === socket.id,
          minPlayers: MIN_PLAYERS,
          maxPlayers: MAX_PLAYERS,
          themes: THEMES,
          gameModes: GAME_MODES,
          gameMode: room.gameMode,
          settings: room.settings
        });
      }
    });
    
    io.to(newRoomCode).emit('players-update', {
      players: getRoomPlayers(newRoomCode),
      minPlayers: MIN_PLAYERS,
      maxPlayers: MAX_PLAYERS,
      gameMode: room.gameMode,
      teams: { red: [], blue: [] }
    });
    
    rooms.delete(roomCode);
  });

  socket.on('disconnect', () => {
    const roomCode = socket.data.currentRoom;
    if (socket.data.userId) {
      connectedUsers.delete(socket.data.userId);
    }
    if (!roomCode) return;
    
    const room = rooms.get(roomCode);
    if (!room) return;
    
    room.players = room.players.filter(id => id !== socket.id);
    
    if (room.players.length === 0) {
      clearTimer(roomCode);
      rooms.delete(roomCode);
    } else {
      io.to(roomCode).emit('players-update', { 
        players: getRoomPlayers(roomCode), 
        minPlayers: MIN_PLAYERS, 
        maxPlayers: MAX_PLAYERS, 
        gameMode: room.gameMode,
        teams: room.teams
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});