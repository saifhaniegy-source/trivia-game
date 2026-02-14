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
    { question: "What is the fastest land animal?", options: ["Lion", "Cheetah", "Horse", "Leopard"], answer: 1 },
    { question: "What is the smallest unit of matter?", options: ["Molecule", "Atom", "Electron", "Quark"], answer: 3 },
    { question: "What planet has the most moons?", options: ["Jupiter", "Saturn", "Uranus", "Neptune"], answer: 1 },
    { question: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], answer: 2 },
    { question: "What is the most abundant gas in Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], answer: 2 },
    { question: "How many chromosomes do humans have?", options: ["23", "46", "48", "44"], answer: 1 },
    { question: "What is the freezing point of water in Celsius?", options: ["-32°C", "0°C", "32°C", "100°C"], answer: 1 },
    { question: "What type of energy does the sun produce?", options: ["Chemical", "Nuclear", "Mechanical", "Electrical"], answer: 1 },
    { question: "What is the chemical formula for water?", options: ["H2O", "CO2", "NaCl", "O2"], answer: 0 },
    { question: "Which planet is known as Earth's twin?", options: ["Mars", "Venus", "Mercury", "Jupiter"], answer: 1 },
    { question: "What is the study of fungi called?", options: ["Botany", "Mycology", "Zoology", "Biology"], answer: 1 },
    { question: "How many hearts does an octopus have?", options: ["1", "2", "3", "4"], answer: 2 },
    { question: "What is the most common blood type?", options: ["A", "B", "AB", "O"], answer: 3 }
  ],
  "Geography": [
    { question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], answer: 2 },
    { question: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3 },
    { question: "What is the capital of Japan?", options: ["Beijing", "Seoul", "Tokyo", "Bangkok"], answer: 2 },
    { question: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], answer: 2 },
    { question: "What is the smallest country in the world?", options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"], answer: 1 },
    { question: "What is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], answer: 1 },
    { question: "What is the capital of Brazil?", options: ["Rio de Janeiro", "Sao Paulo", "Brasilia", "Salvador"], answer: 2 },
    { question: "How many continents are there?", options: ["5", "6", "7", "8"], answer: 2 },
    { question: "What is the largest desert in the world?", options: ["Sahara", "Arabian", "Gobi", "Antarctic"], answer: 3 },
    { question: "Which country has the most population?", options: ["India", "USA", "China", "Indonesia"], answer: 2 },
    { question: "What is the capital of Canada?", options: ["Toronto", "Vancouver", "Ottawa", "Montreal"], answer: 2 },
    { question: "Which country is known as the Land of Rising Sun?", options: ["China", "Thailand", "Japan", "South Korea"], answer: 2 },
    { question: "What is the tallest mountain in the world?", options: ["K2", "Kangchenjunga", "Mount Everest", "Lhotse"], answer: 2 },
    { question: "Which country has the most islands?", options: ["Indonesia", "Philippines", "Sweden", "Finland"], answer: 2 },
    { question: "What is the capital of Egypt?", options: ["Alexandria", "Cairo", "Luxor", "Giza"], answer: 1 },
    { question: "Which continent has the most countries?", options: ["Asia", "Europe", "Africa", "South America"], answer: 2 },
    { question: "What is the capital of Russia?", options: ["St. Petersburg", "Moscow", "Novosibirsk", "Kazan"], answer: 1 },
    { question: "Which country is both in Europe and Asia?", options: ["Russia", "China", "India", "Iran"], answer: 0 },
    { question: "What is the largest lake in Africa?", options: ["Lake Chad", "Lake Tanganyika", "Lake Victoria", "Lake Malawi"], answer: 2 },
    { question: "What is the capital of Germany?", options: ["Munich", "Hamburg", "Frankfurt", "Berlin"], answer: 3 }
  ],
  "History": [
    { question: "What year did World War II end?", options: ["1943", "1944", "1945", "1946"], answer: 2 },
    { question: "What year did the Titanic sink?", options: ["1910", "1911", "1912", "1913"], answer: 2 },
    { question: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Michelangelo"], answer: 2 },
    { question: "Who wrote 'Romeo and Juliet'?", options: ["Dickens", "Shakespeare", "Austen", "Hemingway"], answer: 1 },
    { question: "What year did the Berlin Wall fall?", options: ["1987", "1988", "1989", "1990"], answer: 2 },
    { question: "Who was the first President of the United States?", options: ["Lincoln", "Jefferson", "Washington", "Adams"], answer: 2 },
    { question: "What ancient wonder was located in Egypt?", options: ["Colossus", "Hanging Gardens", "Great Pyramid", "Lighthouse"], answer: 2 },
    { question: "Who discovered America in 1492?", options: ["Magellan", "Columbus", "Vespucci", "Cook"], answer: 1 },
    { question: "What year did World War I start?", options: ["1912", "1913", "1914", "1915"], answer: 2 },
    { question: "Who was the first woman to fly solo across the Atlantic?", options: ["Amelia Earhart", "Bessie Coleman", "Harriet Quimby", "Jacqueline Cochran"], answer: 0 },
    { question: "What empire was ruled by Julius Caesar?", options: ["Greek", "Persian", "Roman", "Ottoman"], answer: 2 },
    { question: "In what year did the French Revolution begin?", options: ["1776", "1789", "1799", "1804"], answer: 1 },
    { question: "Who invented the printing press?", options: ["Da Vinci", "Galileo", "Gutenberg", "Newton"], answer: 2 },
    { question: "What was the name of the first satellite in space?", options: ["Apollo", "Sputnik", "Explorer", "Voyager"], answer: 1 },
    { question: "Who was the first man on the moon?", options: ["Buzz Aldrin", "Neil Armstrong", "Michael Collins", "Yuri Gagarin"], answer: 1 },
    { question: "What year did the Cold War end?", options: ["1989", "1990", "1991", "1992"], answer: 2 },
    { question: "Who built the Taj Mahal?", options: ["Akbar", "Shah Jahan", "Humayun", "Aurangzeb"], answer: 1 },
    { question: "What civilization built Machu Picchu?", options: ["Aztec", "Maya", "Inca", "Olmec"], answer: 2 },
    { question: "Who was known as the Iron Lady?", options: ["Indira Gandhi", "Angela Merkel", "Margaret Thatcher", "Golda Meir"], answer: 2 },
    { question: "What year did India gain independence?", options: ["1945", "1946", "1947", "1948"], answer: 2 }
  ],
  "Space": [
    { question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answer: 1 },
    { question: "Which planet is closest to the Sun?", options: ["Venus", "Mercury", "Earth", "Mars"], answer: 1 },
    { question: "How many planets are in our solar system?", options: ["7", "8", "9", "10"], answer: 1 },
    { question: "What is the largest planet in our solar system?", options: ["Saturn", "Neptune", "Jupiter", "Uranus"], answer: 2 },
    { question: "What is the Sun made of?", options: ["Solid rock", "Liquid magma", "Plasma", "Gas and dust"], answer: 2 },
    { question: "Which planet has the most rings?", options: ["Jupiter", "Saturn", "Uranus", "Neptune"], answer: 1 },
    { question: "What is a light-year a measure of?", options: ["Time", "Distance", "Speed", "Brightness"], answer: 1 },
    { question: "What is the closest star to Earth?", options: ["Alpha Centauri", "Proxima Centauri", "The Sun", "Sirius"], answer: 2 },
    { question: "What galaxy is Earth located in?", options: ["Andromeda", "Milky Way", "Triangulum", "Sombrero"], answer: 1 },
    { question: "Which planet has a day longer than its year?", options: ["Mercury", "Venus", "Mars", "Jupiter"], answer: 1 },
    { question: "What is the name of NASA's Mars rover?", options: ["Opportunity", "Curiosity", "Spirit", "Perseverance"], answer: 3 },
    { question: "What causes a solar eclipse?", options: ["Earth's shadow", "Moon blocking Sun", "Venus passing Sun", "Sun's rotation"], answer: 1 },
    { question: "What is the largest moon in our solar system?", options: ["Titan", "Ganymede", "Callisto", "Europa"], answer: 1 },
    { question: "Which planet rotates on its side?", options: ["Neptune", "Saturn", "Uranus", "Jupiter"], answer: 2 },
    { question: "What is the asteroid belt located between?", options: ["Earth and Mars", "Mars and Jupiter", "Jupiter and Saturn", "Saturn and Uranus"], answer: 1 },
    { question: "What is a comet mostly made of?", options: ["Rock", "Metal", "Ice and dust", "Gas"], answer: 2 },
    { question: "How long does it take Earth to orbit the Sun?", options: ["365 days", "366 days", "360 days", "370 days"], answer: 0 },
    { question: "What is the hottest planet?", options: ["Mercury", "Venus", "Mars", "Jupiter"], answer: 1 },
    { question: "What is the Great Red Spot on Jupiter?", options: ["Volcano", "Storm", "Crater", "Mountain"], answer: 1 },
    { question: "Which planet has no atmosphere?", options: ["Mars", "Venus", "Mercury", "Pluto"], answer: 2 }
  ],
  "Entertainment": [
    { question: "How many strings does a guitar have?", options: ["4", "5", "6", "7"], answer: 2 },
    { question: "In what year was the first iPhone released?", options: ["2005", "2006", "2007", "2008"], answer: 2 },
    { question: "How many Harry Potter books are there?", options: ["6", "7", "8", "9"], answer: 1 },
    { question: "What is the highest-grossing film of all time?", options: ["Titanic", "Avatar", "Avengers: Endgame", "Star Wars"], answer: 1 },
    { question: "Who played Jack in Titanic?", options: ["Brad Pitt", "Leonardo DiCaprio", "Johnny Depp", "Tom Cruise"], answer: 1 },
    { question: "What is the name of Batman's butler?", options: ["James", "Alfred", "Bruce", "Thomas"], answer: 1 },
    { question: "How many Marvel Infinity Stones are there?", options: ["4", "5", "6", "7"], answer: 2 },
    { question: "What animated film features a character named Simba?", options: ["Bambi", "The Lion King", "Jungle Book", "Tarzan"], answer: 1 },
    { question: "Who sang 'Thriller'?", options: ["Prince", "Michael Jackson", "Whitney Houston", "Stevie Wonder"], answer: 1 },
    { question: "What is the best-selling video game of all time?", options: ["Tetris", "Minecraft", "GTA V", "Wii Sports"], answer: 1 },
    { question: "What year was YouTube founded?", options: ["2003", "2004", "2005", "2006"], answer: 2 },
    { question: "Who is the main character in The Legend of Zelda?", options: ["Zelda", "Link", "Ganon", "Navi"], answer: 1 },
    { question: "What is the name of the coffee shop in Friends?", options: ["Central Park", "Central Perk", "Coffee House", "The Brew"], answer: 1 },
    { question: "How many seasons does Game of Thrones have?", options: ["6", "7", "8", "9"], answer: 2 },
    { question: "Who voiced Woody in Toy Story?", options: ["Tim Allen", "Tom Hanks", "Billy Crystal", "John Ratzenberger"], answer: 1 },
    { question: "What is the name of the dragon in Game of Thrones?", options: ["Smaug", "Drogon", "Toothless", "Falkor"], answer: 1 },
    { question: "Who wrote the Hunger Games series?", options: ["J.K. Rowling", "Suzanne Collins", "Stephenie Meyer", "Veronica Roth"], answer: 1 },
    { question: "What is the highest-grossing animated film?", options: ["Frozen II", "The Lion King", "Frozen", "Toy Story 4"], answer: 0 },
    { question: "What band was Freddie Mercury the lead singer of?", options: ["The Beatles", "Led Zeppelin", "Queen", "Pink Floyd"], answer: 2 },
    { question: "What streaming service produced Stranger Things?", options: ["Amazon Prime", "Hulu", "Netflix", "Disney+"], answer: 2 }
  ],
  "Sports": [
    { question: "How many players are on a soccer team?", options: ["9", "10", "11", "12"], answer: 2 },
    { question: "What sport is known as America's pastime?", options: ["Football", "Basketball", "Baseball", "Hockey"], answer: 2 },
    { question: "How many rings are on the Olympic flag?", options: ["4", "5", "6", "7"], answer: 1 },
    { question: "What country hosted the 2016 Summer Olympics?", options: ["China", "UK", "Brazil", "Japan"], answer: 2 },
    { question: "How long is a marathon?", options: ["26.2 miles", "25 miles", "30 miles", "28 miles"], answer: 0 },
    { question: "What sport does Tiger Woods play?", options: ["Tennis", "Golf", "Cricket", "Polo"], answer: 1 },
    { question: "How many points is a touchdown worth?", options: ["5", "6", "7", "8"], answer: 1 },
    { question: "What country won the first FIFA World Cup?", options: ["Brazil", "Argentina", "Uruguay", "Italy"], answer: 2 },
    { question: "How many players are on a basketball team on court?", options: ["4", "5", "6", "7"], answer: 1 },
    { question: "What sport uses a shuttlecock?", options: ["Tennis", "Squash", "Badminton", "Table Tennis"], answer: 2 },
    { question: "In what sport would you perform a slam dunk?", options: ["Volleyball", "Basketball", "Tennis", "Football"], answer: 1 },
    { question: "How many holes are played in a standard round of golf?", options: ["9", "12", "18", "21"], answer: 2 },
    { question: "What country is famous for sumo wrestling?", options: ["China", "Korea", "Japan", "Thailand"], answer: 2 },
    { question: "What is the national sport of Canada?", options: ["Hockey", "Lacrosse", "Curling", "Football"], answer: 1 },
    { question: "How often is the FIFA World Cup held?", options: ["2 years", "3 years", "4 years", "5 years"], answer: 2 },
    { question: "What sport uses terms like 'love' and 'deuce'?", options: ["Golf", "Tennis", "Cricket", "Squash"], answer: 1 },
    { question: "Who has the most NBA championships?", options: ["Lakers", "Celtics", "Bulls", "Warriors"], answer: 1 },
    { question: "What sport is played at Wimbledon?", options: ["Golf", "Cricket", "Tennis", "Polo"], answer: 2 },
    { question: "How many players are on an ice hockey team?", options: ["5", "6", "7", "8"], answer: 1 },
    { question: "What is the maximum score in a single frame of bowling?", options: ["20", "25", "30", "35"], answer: 2 }
  ],
  "Food": [
    { question: "Which country invented pizza?", options: ["USA", "Italy", "France", "Greece"], answer: 1 },
    { question: "What is the main ingredient in guacamole?", options: ["Tomato", "Avocado", "Pepper", "Onion"], answer: 1 },
    { question: "What type of food is sushi?", options: ["Chinese", "Korean", "Japanese", "Thai"], answer: 2 },
    { question: "What is the most popular spice in the world?", options: ["Salt", "Pepper", "Cinnamon", "Cumin"], answer: 1 },
    { question: "Which fruit is known for having seeds on the outside?", options: ["Raspberry", "Blackberry", "Strawberry", "Blueberry"], answer: 2 },
    { question: "What gives bread its rise?", options: ["Sugar", "Salt", "Yeast", "Butter"], answer: 2 },
    { question: "What is the main ingredient in hummus?", options: ["Lentils", "Chickpeas", "Black beans", "Peas"], answer: 1 },
    { question: "Which country is the largest producer of coffee?", options: ["Colombia", "Vietnam", "Brazil", "Ethiopia"], answer: 2 },
    { question: "What is the most ordered fast food item?", options: ["Burger", "Pizza", "Fries", "Chicken"], answer: 2 },
    { question: "What type of food is paneer?", options: ["Meat", "Cheese", "Vegetable", "Bread"], answer: 1 },
    { question: "Which country does paella originate from?", options: ["Italy", "Portugal", "Spain", "France"], answer: 2 },
    { question: "What is the world's most expensive spice?", options: ["Vanilla", "Cardamom", "Saffron", "Clove"], answer: 2 },
    { question: "What fruit is used to make wine?", options: ["Apple", "Grape", "Pear", "Peach"], answer: 1 },
    { question: "What is the main ingredient in chocolate?", options: ["Coffee beans", "Cocoa beans", "Vanilla beans", "Carob beans"], answer: 1 },
    { question: "Which nut is used to make marzipan?", options: ["Walnut", "Hazelnut", "Almond", "Pecan"], answer: 2 },
    { question: "What is the most consumed beverage in the world?", options: ["Coffee", "Tea", "Water", "Beer"], answer: 2 },
    { question: "Which country invented french fries?", options: ["France", "USA", "Belgium", "Germany"], answer: 2 },
    { question: "What is tempura?", options: ["Soup", "Fried batter", "Noodles", "Rice dish"], answer: 1 },
    { question: "What vegetable is used to make pickles?", options: ["Carrot", "Cucumber", "Cabbage", "Onion"], answer: 1 },
    { question: "What is the main ingredient in tofu?", options: ["Rice", "Soybeans", "Wheat", "Corn"], answer: 1 }
  ],
  "Technology": [
    { question: "Who founded Apple?", options: ["Bill Gates", "Steve Jobs", "Mark Zuckerberg", "Jeff Bezos"], answer: 1 },
    { question: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Power Unit", "Central Power Unit", "Computer Processing Unit"], answer: 0 },
    { question: "What year was Google founded?", options: ["1996", "1997", "1998", "1999"], answer: 2 },
    { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"], answer: 0 },
    { question: "Who is the CEO of Tesla?", options: ["Jeff Bezos", "Elon Musk", "Tim Cook", "Sundar Pichai"], answer: 1 },
    { question: "What programming language is known for its coffee cup logo?", options: ["Python", "JavaScript", "Java", "C++"], answer: 2 },
    { question: "What does VPN stand for?", options: ["Virtual Private Network", "Very Private Network", "Virtual Protocol Network", "Verified Private Network"], answer: 0 },
    { question: "What company developed the PlayStation?", options: ["Nintendo", "Microsoft", "Sony", "Sega"], answer: 2 },
    { question: "What is the name of Amazon's voice assistant?", options: ["Siri", "Alexa", "Cortana", "Google Assistant"], answer: 1 },
    { question: "What does RAM stand for?", options: ["Read Access Memory", "Random Access Memory", "Run Access Memory", "Rapid Access Memory"], answer: 1 },
    { question: "What year was Facebook launched?", options: ["2002", "2003", "2004", "2005"], answer: 2 },
    { question: "What company owns Instagram?", options: ["Google", "Twitter", "Meta", "Microsoft"], answer: 2 },
    { question: "What is the most popular programming language?", options: ["Java", "Python", "JavaScript", "C++"], answer: 1 },
    { question: "What does AI stand for?", options: ["Automated Intelligence", "Artificial Intelligence", "Advanced Intelligence", "Automated Interface"], answer: 1 },
    { question: "What company created the Xbox?", options: ["Sony", "Nintendo", "Microsoft", "Sega"], answer: 2 },
    { question: "What does URL stand for?", options: ["Universal Resource Locator", "Uniform Resource Locator", "Universal Reference Link", "Uniform Reference Link"], answer: 1 },
    { question: "What is the name of the first computer virus?", options: ["ILOVEYOU", "Creeper", "Morris", "Brain"], answer: 1 },
    { question: "What company developed the Android operating system?", options: ["Apple", "Microsoft", "Google", "Samsung"], answer: 2 },
    { question: "What does USB stand for?", options: ["Universal Serial Bus", "United Serial Bus", "Universal System Bus", "Unified Serial Bus"], answer: 0 },
    { question: "What year was the first website created?", options: ["1989", "1990", "1991", "1992"], answer: 2 }
  ]
};

const THEMES = Object.keys(QUESTIONS_BY_THEME);

const GAME_MODES = {
  "Classic": { name: "Classic Trivia", description: "Answer questions, earn points!", questions: 15, timeLimit: 10, icon: "🎯" },
  "Speed": { name: "Speed Round", description: "Faster questions, higher stakes!", questions: 15, timeLimit: 5, icon: "⚡" },
  "Survival": { name: "Survival Mode", description: "3 lives - one wrong = lose a life!", questions: 20, timeLimit: 10, icon: "❤️" },
  "Betting": { name: "Betting Mode", description: "Bet your points before each question!", questions: 10, timeLimit: 12, icon: "🎰" },
  "Lightning": { name: "Lightning Round", description: "Rapid-fire 3 second questions!", questions: 20, timeLimit: 3, icon: "🌩️" }
};

const MASCOTS = ['🦊', '🐸', '🦁', '🐼', '🦄', '🐱', '🐶', '🐰', '🐻', '🦋', '🦅', '🐺', '🦈', '🐬', '🦉', '🐨', '🦜', '🐯', '🦩', '🐧'];

const SUPERPOWERS = [
  { id: 'fifty_fifty', name: '50/50', description: 'Remove 2 wrong answers', icon: '✂️' },
  { id: 'time_freeze', name: 'Time Freeze', description: '+5 seconds', icon: '⏱️' },
  { id: 'double_points', name: 'Double Points', description: '2x points this round', icon: '✨' },
  { id: 'shield', name: 'Shield', description: 'Protected from one wrong answer', icon: '🛡️' },
  { id: 'peek', name: 'Peek', description: 'See most popular answer', icon: '👁️' },
  { id: 'second_chance', name: 'Second Chance', description: 'Answer again if wrong', icon: '🔄' },
  { id: 'steal', name: 'Steal', description: 'Steal 50 points from a random player', icon: '💰' },
  { id: 'freeze_player', name: 'Freeze', description: 'Freeze another player for 5 seconds', icon: '❄️' }
];

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;
const MAX_POINTS = 100;
const SPEED_BONUS_MULTIPLIER = 10;

let rooms = new Map();
let questionTimers = new Map();

function generateCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getRandomQuestions(theme, count) {
  const questions = theme === 'Random' 
    ? Object.values(QUESTIONS_BY_THEME).flat()
    : QUESTIONS_BY_THEME[theme] || Object.values(QUESTIONS_BY_THEME).flat();
  return shuffleArray(questions).slice(0, count);
}

function getRandomSuperpower() {
  return SUPERPOWERS[Math.floor(Math.random() * SUPERPOWERS.length)];
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
        frozenUntil: socket.data.frozenUntil
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

  socket.on('create-room', ({ name, theme, gameMode, avatar, color }) => {
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
    socket.data.mascot = avatar || MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
    socket.data.color = color || COLORS[Math.floor(Math.random() * COLORS.length)];
    
    const mode = GAME_MODES[gameMode] || GAME_MODES["Classic"];
    const questions = getRandomQuestions(theme, mode.questions);
    
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
      bets: new Map()
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
      gameMode: gameMode
    });
    io.to(roomCode).emit('players-update', { players: getRoomPlayers(roomCode), minPlayers: MIN_PLAYERS, maxPlayers: MAX_PLAYERS, gameMode: gameMode });
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
    socket.data.mascot = avatar || MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
    socket.data.color = color || COLORS[Math.floor(Math.random() * COLORS.length)];
    
    room.players.push(socket.id);
    socket.join(roomCode);
    
    socket.emit('room-joined', { 
      roomCode, 
      isHost: false, 
      minPlayers: MIN_PLAYERS, 
      maxPlayers: MAX_PLAYERS,
      gameMode: room.gameMode
    });
    io.to(roomCode).emit('players-update', { players: getRoomPlayers(roomCode), minPlayers: MIN_PLAYERS, maxPlayers: MAX_PLAYERS, gameMode: room.gameMode });
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
    
    const mode = GAME_MODES[room.gameMode] || GAME_MODES["Classic"];
    
    io.to(roomCode).emit('game-started', { 
      theme: room.theme, 
      totalQuestions: room.questions.length,
      gameMode: room.gameMode,
      timeLimit: mode.timeLimit
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
    io.to(roomCode).emit('players-update', { players: getRoomPlayers(roomCode), minPlayers: MIN_PLAYERS, maxPlayers: MAX_PLAYERS, gameMode: room.gameMode });
    
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
    
    io.to(roomCode).emit('players-update', { players: getRoomPlayers(roomCode), minPlayers: MIN_PLAYERS, maxPlayers: MAX_PLAYERS, gameMode: room.gameMode });
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
    
    const question = room.questions[room.currentQuestion];
    
    io.to(roomCode).emit('question', {
      question: question.question,
      options: question.options,
      questionNumber: room.currentQuestion + 1,
      totalQuestions: room.questions.length,
      timeLimit: mode.timeLimit,
      gameMode: room.gameMode
    });
    
    io.to(roomCode).emit('players-update', { players: getRoomPlayers(roomCode), minPlayers: MIN_PLAYERS, maxPlayers: MAX_PLAYERS, gameMode: room.gameMode });
    
    const timer = setTimeout(() => {
      revealAnswer(roomCode);
    }, mode.timeLimit * 1000);
    questionTimers.set(roomCode, timer);
  }

  socket.on('use-superpower', (powerId) => {
    const roomCode = socket.data.currentRoom;
    const room = rooms.get(roomCode);
    
    if (!room || !room.gameStarted) return;
    if (socket.data.answered || socket.data.frozen) return;
    
    const powerIndex = socket.data.superpowers.findIndex(p => p.id === powerId);
    if (powerIndex === -1) return;
    
    const power = socket.data.superpowers[powerIndex];
    
    switch(power.id) {
      case 'fifty_fifty':
        const question = room.questions[room.currentQuestion];
        const wrongIndices = [0, 1, 2, 3].filter(i => i !== question.answer);
        const toRemove = shuffleArray(wrongIndices).slice(0, 2);
        socket.data.usedFiftyFifty = toRemove;
        socket.emit('fifty-fifty', { remove: toRemove });
        break;
        
      case 'time_freeze':
        const mode = GAME_MODES[room.gameMode] || GAME_MODES["Classic"];
        socket.emit('time-freeze', { extraSeconds: 5, timeLimit: mode.timeLimit });
        clearTimer(roomCode);
        const newTimer = setTimeout(() => {
          revealAnswer(roomCode);
        }, (mode.timeLimit + 5) * 1000);
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
        const players = getRoomPlayers(roomCode).filter(p => p.id !== socket.id && p.score > 0);
        if (players.length > 0) {
          const victim = players[Math.floor(Math.random() * players.length)];
          const victimSocket = io.sockets.sockets.get(victim.id);
          const stealAmount = Math.min(50, victim.score);
          victimSocket.data.score -= stealAmount;
          socket.data.score += stealAmount;
          socket.emit('steal-result', { victim: victim.name, amount: stealAmount });
          victimSocket.emit('stolen', { thief: socket.data.name, amount: stealAmount });
        }
        break;
        
      case 'freeze_player':
        const targets = getRoomPlayers(roomCode).filter(p => p.id !== socket.id);
        if (targets.length > 0) {
          const target = targets[Math.floor(Math.random() * targets.length)];
          const targetSocket = io.sockets.sockets.get(target.id);
          targetSocket.data.frozen = true;
          targetSocket.data.frozenUntil = Date.now() + 5000;
          socket.emit('freeze-result', { target: target.name });
          targetSocket.emit('frozen', { freezer: socket.data.name });
        }
        break;
    }
    
    socket.data.superpowers.splice(powerIndex, 1);
    io.to(roomCode).emit('players-update', { players: getRoomPlayers(roomCode), minPlayers: MIN_PLAYERS, maxPlayers: MAX_PLAYERS, gameMode: room.gameMode });
  });

  socket.on('submit-answer', (answerIndex) => {
    const roomCode = socket.data.currentRoom;
    const room = rooms.get(roomCode);
    
    if (!room || !room.gameStarted) return;
    if (socket.data.answered && !socket.data.hasSecondChance) return;
    if (socket.data.frozen) return;
    
    const mode = GAME_MODES[room.gameMode] || GAME_MODES["Classic"];
    const timeTaken = (Date.now() - room.questionStartTime) / 1000;
    const speedBonus = Math.max(0, Math.floor((mode.timeLimit - timeTaken) * SPEED_BONUS_MULTIPLIER));
    
    if (socket.data.hasSecondChance && socket.data.answered) {
      socket.data.hasSecondChance = false;
    }
    
    socket.data.answered = true;
    
    let pointsMultiplier = socket.data.doublePointsActive ? 2 : 1;
    socket.data.doublePointsActive = false;
    
    room.answers.set(socket.id, { 
      answerIndex, 
      timeTaken, 
      speedBonus,
      pointsMultiplier,
      shieldActive: socket.data.shieldActive,
      bet: socket.data.bet
    });
    
    io.to(roomCode).emit('players-update', { players: getRoomPlayers(roomCode), minPlayers: MIN_PLAYERS, maxPlayers: MAX_PLAYERS, gameMode: room.gameMode });
    
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
    
    room.answers.forEach((data, socketId) => {
      const playerSocket = io.sockets.sockets.get(socketId);
      if (playerSocket) {
        let correct = data.answerIndex === question.answer;
        let points = 0;
        
        if (room.gameMode === "Betting") {
          if (correct) {
            points = data.bet + MAX_POINTS + data.speedBonus;
            playerSocket.data.score += points;
          } else {
            playerSocket.data.score -= data.bet;
          }
        } else if (room.gameMode === "Survival") {
          if (!correct && !data.shieldActive) {
            playerSocket.data.lives--;
            if (playerSocket.data.lives < 0) playerSocket.data.lives = 0;
          } else if (correct) {
            points = (MAX_POINTS + data.speedBonus) * data.pointsMultiplier;
            playerSocket.data.score += points;
            
            if (Math.random() < 0.4) {
              const newPower = getRandomSuperpower();
              playerSocket.data.superpowers.push(newPower);
              playerSocket.emit('superpower-earned', newPower);
            }
          }
          if (data.shieldActive) {
            playerSocket.data.shieldActive = false;
          }
        } else {
          if (!correct && data.shieldActive) {
            correct = true;
            points = 50;
            playerSocket.data.shieldActive = false;
          }
          
          if (correct) {
            points = (MAX_POINTS + data.speedBonus) * data.pointsMultiplier;
            playerSocket.data.score += points;
            
            if (Math.random() < 0.35) {
              const newPower = getRandomSuperpower();
              playerSocket.data.superpowers.push(newPower);
              playerSocket.emit('superpower-earned', newPower);
            }
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
          lives: playerSocket.data.lives
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
      isLastQuestion: room.currentQuestion >= room.questions.length - 1,
      gameMode: room.gameMode
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
      clearTimer(roomCode);
      rooms.delete(roomCode);
    } else {
      io.to(roomCode).emit('players-update', { players: getRoomPlayers(roomCode), minPlayers: MIN_PLAYERS, maxPlayers: MAX_PLAYERS, gameMode: room.gameMode });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});