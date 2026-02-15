const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const crypto = require('crypto');
const { User, Friends, Questions, GameHistory, pool } = require('./database');

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
    { question: "_____ is the study of fossils.", options: ["Paleontology", "Archaeology", "Geology", "Biology"], answer: 0, type: "fillblank", difficulty: "medium" },
    { question: "What is the atomic number of Carbon?", options: ["4", "6", "8", "12"], answer: 1, difficulty: "medium" },
    { question: "Which organ filters blood in the human body?", options: ["Heart", "Liver", "Kidney", "Lungs"], answer: 2, difficulty: "easy" },
    { question: "What is the speed of light in vacuum (km/s)?", options: ["300,000", "150,000", "500,000", "1,000,000"], answer: 0, difficulty: "hard" },
    { question: "Which planet is known as the Morning Star?", options: ["Mars", "Venus", "Mercury", "Jupiter"], answer: 1, difficulty: "medium" },
    { question: "What is the chemical formula for table salt?", options: ["NaCl", "KCl", "CaCl2", "MgCl2"], answer: 0, difficulty: "easy" },
    { question: "How many hearts does an octopus have?", options: ["1", "2", "3", "4"], answer: 2, difficulty: "hard" },
    { question: "What is the pH of pure water?", options: ["5", "7", "9", "11"], answer: 1, difficulty: "medium" },
    { question: "Which scientist developed the theory of relativity?", options: ["Newton", "Einstein", "Bohr", "Hawking"], answer: 1, difficulty: "easy" },
    { question: "What is the largest organ in the human body?", options: ["Liver", "Brain", "Skin", "Heart"], answer: 2, difficulty: "medium" },
    { question: "True or False: Light travels faster than sound.", options: ["True", "False", "", ""], answer: 0, type: "truefalse", difficulty: "easy" },
    { question: "What force keeps planets in orbit?", options: ["Electromagnetic", "Nuclear", "Gravity", "Friction"], answer: 2, difficulty: "easy" }
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
    { question: "_____ is the capital of Egypt.", options: ["Alexandria", "Cairo", "Luxor", "Giza"], answer: 1, type: "fillblank", difficulty: "easy" },
    { question: "What is the capital of Germany?", options: ["Munich", "Frankfurt", "Berlin", "Hamburg"], answer: 2, difficulty: "easy" },
    { question: "Which country is shaped like a boot?", options: ["Spain", "Italy", "Greece", "Portugal"], answer: 1, difficulty: "easy" },
    { question: "What is the capital of India?", options: ["Mumbai", "Kolkata", "New Delhi", "Bangalore"], answer: 2, difficulty: "medium" },
    { question: "Which ocean is the warmest?", options: ["Pacific", "Atlantic", "Indian", "Arctic"], answer: 2, difficulty: "hard" },
    { question: "What is the largest island in the world?", options: ["Madagascar", "Borneo", "Greenland", "New Guinea"], answer: 2, difficulty: "medium" },
    { question: "Which country has the most time zones?", options: ["USA", "Russia", "China", "France"], answer: 3, difficulty: "hard" },
    { question: "What is the capital of South Korea?", options: ["Busan", "Seoul", "Incheon", "Daegu"], answer: 1, difficulty: "easy" },
    { question: "Which is the only continent without an active volcano?", options: ["Africa", "Australia", "Europe", "Antarctica"], answer: 1, difficulty: "hard" },
    { question: "What is the capital of Mexico?", options: ["Guadalajara", "Monterrey", "Mexico City", "Cancun"], answer: 2, difficulty: "medium" },
    { question: "True or False: Russia is the largest country by area.", options: ["True", "False", "", ""], answer: 0, type: "truefalse", difficulty: "easy" },
    { question: "What sea is located between Europe and Africa?", options: ["Caribbean", "Mediterranean", "Red Sea", "Black Sea"], answer: 1, difficulty: "medium" }
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
    { question: "_____ built the Taj Mahal.", options: ["Akbar", "Shah Jahan", "Humayun", "Aurangzeb"], answer: 1, type: "fillblank", difficulty: "medium" },
    { question: "What year did the French Revolution begin?", options: ["1776", "1789", "1799", "1804"], answer: 1, difficulty: "medium" },
    { question: "Who was the first female Prime Minister of the UK?", options: ["Theresa May", "Margaret Thatcher", "Queen Victoria", "Elizabeth I"], answer: 1, difficulty: "easy" },
    { question: "What ancient civilization built Machu Picchu?", options: ["Aztec", "Maya", "Inca", "Olmec"], answer: 2, difficulty: "medium" },
    { question: "Who was known as the 'Iron Lady'?", options: ["Angela Merkel", "Margaret Thatcher", "Indira Gandhi", "Golda Meir"], answer: 1, difficulty: "medium" },
    { question: "What year did the American Civil War end?", options: ["1863", "1864", "1865", "1866"], answer: 2, difficulty: "medium" },
    { question: "Which pharaoh's tomb was discovered intact in 1922?", options: ["Ramesses II", "Tutankhamun", "Cleopatra", "Khufu"], answer: 1, difficulty: "medium" },
    { question: "What was the name of the first satellite in space?", options: ["Apollo", "Sputnik", "Explorer", "Voyager"], answer: 1, difficulty: "medium" },
    { question: "Who wrote the Declaration of Independence?", options: ["George Washington", "Benjamin Franklin", "Thomas Jefferson", "John Adams"], answer: 2, difficulty: "hard" },
    { question: "What year did the Soviet Union collapse?", options: ["1989", "1990", "1991", "1992"], answer: 2, difficulty: "medium" },
    { question: "True or False: The Great Wall of China is visible from space.", options: ["True", "False", "", ""], answer: 1, type: "truefalse", difficulty: "hard" },
    { question: "Who was the longest reigning British monarch?", options: ["Victoria", "Elizabeth II", "George III", "Henry VIII"], answer: 1, difficulty: "medium" }
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
    { question: "_____ is Earth's natural satellite.", options: ["The Moon", "Mars", "Venus", "The Sun"], answer: 0, type: "fillblank", difficulty: "easy" },
    { question: "What is the smallest planet in our solar system?", options: ["Mercury", "Mars", "Venus", "Pluto"], answer: 0, difficulty: "medium" },
    { question: "How long does Earth take to orbit the Sun?", options: ["365 days", "30 days", "24 hours", "7 days"], answer: 0, difficulty: "easy" },
    { question: "What is the Sun made of?", options: ["Rock", "Liquid lava", "Gas and plasma", "Solid metal"], answer: 2, difficulty: "medium" },
    { question: "Which planet spins on its side?", options: ["Neptune", "Uranus", "Saturn", "Jupiter"], answer: 1, difficulty: "hard" },
    { question: "What is a shooting star?", options: ["A star dying", "A meteor", "A comet", "A planet"], answer: 1, difficulty: "medium" },
    { question: "How old is the universe (approximately)?", options: ["10 billion years", "13.8 billion years", "20 billion years", "5 billion years"], answer: 1, difficulty: "hard" },
    { question: "What is the name of the first black hole photographed?", options: ["Cygnus X-1", "Sagittarius A*", "M87*", "Andromeda"], answer: 2, difficulty: "hard" },
    { question: "Which planet has a day longer than its year?", options: ["Mercury", "Venus", "Mars", "Jupiter"], answer: 1, difficulty: "hard" },
    { question: "What causes the Northern Lights?", options: ["Moonlight", "Solar particles", "Volcanic activity", "Ocean currents"], answer: 1, difficulty: "medium" },
    { question: "True or False: The Sun is a star.", options: ["True", "False", "", ""], answer: 0, type: "truefalse", difficulty: "easy" },
    { question: "What is the second planet from the Sun?", options: ["Mercury", "Venus", "Earth", "Mars"], answer: 1, difficulty: "easy" }
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
    { question: "_____ produced Stranger Things.", options: ["Netflix", "Amazon", "Hulu", "Disney"], answer: 0, type: "fillblank", difficulty: "easy" },
    { question: "Who directed 'Jaws'?", options: ["Spielberg", "Scorsese", "Coppola", "Kubrick"], answer: 0, difficulty: "medium" },
    { question: "What is the name of Harry Potter's owl?", options: ["Errol", "Hedwig", "Pigwidgeon", "Scabbers"], answer: 1, difficulty: "easy" },
    { question: "Which TV show features dragons and the Iron Throne?", options: ["The Witcher", "Game of Thrones", "Vikings", "Lord of the Rings"], answer: 1, difficulty: "easy" },
    { question: "Who plays Iron Man in the MCU?", options: ["Chris Evans", "Robert Downey Jr.", "Chris Hemsworth", "Mark Ruffalo"], answer: 1, difficulty: "easy" },
    { question: "What animated movie features a clownfish named Nemo?", options: ["Shark Tale", "Finding Nemo", "The Little Mermaid", "Moana"], answer: 1, difficulty: "easy" },
    { question: "How many seasons did 'Friends' have?", options: ["8", "9", "10", "11"], answer: 2, difficulty: "medium" },
    { question: "Who wrote 'The Hobbit'?", options: ["J.K. Rowling", "J.R.R. Tolkien", "C.S. Lewis", "George R.R. Martin"], answer: 1, difficulty: "medium" },
    { question: "What is the highest-grossing film of all time?", options: ["Avengers: Endgame", "Avatar", "Titanic", "Star Wars: The Force Awakens"], answer: 1, difficulty: "medium" },
    { question: "Which video game features a plumber named Mario?", options: ["Zelda", "Super Mario Bros", "Sonic", "Donkey Kong"], answer: 1, difficulty: "easy" },
    { question: "True or False: 'Frozen' features the song 'Let It Go'.", options: ["True", "False", "", ""], answer: 0, type: "truefalse", difficulty: "easy" },
    { question: "What year was the first Star Wars movie released?", options: ["1975", "1977", "1979", "1981"], answer: 1, difficulty: "hard" }
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
    { question: "_____ hosts Wimbledon.", options: ["London", "Paris", "New York", "Melbourne"], answer: 0, type: "fillblank", difficulty: "medium" },
    { question: "What sport is played at the Masters tournament?", options: ["Tennis", "Golf", "Cricket", "Polo"], answer: 1, difficulty: "medium" },
    { question: "How many players are on a basketball team on court?", options: ["4", "5", "6", "7"], answer: 1, difficulty: "easy" },
    { question: "What country won the first FIFA World Cup?", options: ["Brazil", "Uruguay", "Argentina", "Italy"], answer: 1, difficulty: "hard" },
    { question: "In which sport would you perform a slam dunk?", options: ["Volleyball", "Basketball", "Tennis", "Badminton"], answer: 1, difficulty: "easy" },
    { question: "How often are the Summer Olympics held?", options: ["Every 2 years", "Every 3 years", "Every 4 years", "Every 5 years"], answer: 2, difficulty: "easy" },
    { question: "What is the national sport of Canada?", options: ["Hockey", "Lacrosse", "Curling", "Football"], answer: 1, difficulty: "hard" },
    { question: "Who has won the most NBA championships?", options: ["Lakers", "Celtics", "Bulls", "Warriors"], answer: 1, difficulty: "medium" },
    { question: "What sport uses a puck?", options: ["Field Hockey", "Ice Hockey", "Lacrosse", "Curling"], answer: 1, difficulty: "easy" },
    { question: "How many holes are played in a standard round of golf?", options: ["9", "12", "18", "21"], answer: 2, difficulty: "easy" },
    { question: "True or False: A soccer game has two 45-minute halves.", options: ["True", "False", "", ""], answer: 0, type: "truefalse", difficulty: "medium" },
    { question: "What country hosted the 2016 Summer Olympics?", options: ["China", "UK", "Brazil", "Japan"], answer: 2, difficulty: "medium" }
  ],
  "Food": [
    { question: "Which country invented pizza?", options: ["USA", "Italy", "France", "Greece"], answer: 1, difficulty: "easy" },
    { question: "What is the main ingredient in guacamole?", options: ["Tomato", "Avocado", "Pepper", "Onion"], answer: 1, difficulty: "easy" },
    { question: "What type of food is sushi?", options: ["Chinese", "Korean", "Japanese", "Thai"], answer: 2, difficulty: "easy" },
    { question: "What fruit is used to make wine?", options: ["Apple", "Grape", "Pear", "Peach"], answer: 1, difficulty: "easy" },
    { question: "What is the main ingredient in chocolate?", options: ["Coffee beans", "Cocoa beans", "Vanilla beans", "Carob beans"], answer: 1, difficulty: "easy" },
    { question: "True or False: French fries originated in France.", options: ["True", "False", "", ""], answer: 1, type: "truefalse", difficulty: "medium" },
    { question: "_____ is the main ingredient in tofu.", options: ["Rice", "Soybeans", "Wheat", "Corn"], answer: 1, type: "fillblank", difficulty: "medium" },
    { question: "What is the most popular spice in the world?", options: ["Salt", "Pepper", "Cumin", "Paprika"], answer: 1, difficulty: "medium" },
    { question: "Which country is known for croissants?", options: ["Italy", "France", "Austria", "Germany"], answer: 1, difficulty: "easy" },
    { question: "What vegetable is used to make pickles?", options: ["Carrot", "Cucumber", "Cabbage", "Onion"], answer: 1, difficulty: "easy" },
    { question: "What is the main ingredient in hummus?", options: ["Lentils", "Chickpeas", "Black beans", "Kidney beans"], answer: 1, difficulty: "medium" },
    { question: "Which country is famous for paella?", options: ["Mexico", "Italy", "Spain", "Portugal"], answer: 2, difficulty: "medium" },
    { question: "What type of food is a bagel?", options: ["Pastry", "Bread", "Cookie", "Cracker"], answer: 1, difficulty: "easy" },
    { question: "True or False: Tomatoes are technically fruits.", options: ["True", "False", "", ""], answer: 0, type: "truefalse", difficulty: "medium" },
    { question: "What is the most expensive spice by weight?", options: ["Vanilla", "Saffron", "Cardamom", "Cinnamon"], answer: 1, difficulty: "hard" },
    { question: "Which fruit is known for having its seeds on the outside?", options: ["Blueberry", "Raspberry", "Strawberry", "Blackberry"], answer: 2, difficulty: "easy" },
    { question: "What is the main ingredient in pesto sauce?", options: ["Parsley", "Basil", "Cilantro", "Mint"], answer: 1, difficulty: "medium" },
    { question: "Which country invented ice cream?", options: ["USA", "Italy", "China", "France"], answer: 2, difficulty: "hard" }
  ],
  "Technology": [
    { question: "Who founded Apple?", options: ["Bill Gates", "Steve Jobs", "Mark Zuckerberg", "Jeff Bezos"], answer: 1, difficulty: "easy" },
    { question: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Power Unit", "Central Power Unit", "Computer Processing Unit"], answer: 0, difficulty: "medium" },
    { question: "What year was Google founded?", options: ["1996", "1997", "1998", "1999"], answer: 2, difficulty: "medium" },
    { question: "Who is the CEO of Tesla?", options: ["Jeff Bezos", "Elon Musk", "Tim Cook", "Sundar Pichai"], answer: 1, difficulty: "easy" },
    { question: "What does AI stand for?", options: ["Automated Intelligence", "Artificial Intelligence", "Advanced Intelligence", "Automated Interface"], answer: 1, difficulty: "easy" },
    { question: "What company created the Xbox?", options: ["Sony", "Nintendo", "Microsoft", "Sega"], answer: 2, difficulty: "easy" },
    { question: "True or False: Python was named after a snake.", options: ["True", "False", "", ""], answer: 1, type: "truefalse", difficulty: "hard" },
    { question: "_____ owns Instagram.", options: ["Google", "Twitter", "Meta", "Microsoft"], answer: 2, type: "fillblank", difficulty: "easy" },
    { question: "What does RAM stand for?", options: ["Read Access Memory", "Random Access Memory", "Run Access Memory", "Rapid Access Memory"], answer: 1, difficulty: "medium" },
    { question: "Who is the co-founder of Microsoft?", options: ["Steve Jobs", "Bill Gates", "Mark Zuckerberg", "Larry Page"], answer: 1, difficulty: "easy" },
    { question: "What programming language is known for its coffee cup logo?", options: ["Python", "Java", "JavaScript", "C++"], answer: 1, difficulty: "medium" },
    { question: "What year was the first iPhone released?", options: ["2005", "2006", "2007", "2008"], answer: 2, difficulty: "medium" },
    { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"], answer: 0, difficulty: "medium" },
    { question: "Which company created the PlayStation?", options: ["Microsoft", "Nintendo", "Sony", "Sega"], answer: 2, difficulty: "easy" },
    { question: "What is the most popular social media platform?", options: ["Twitter", "Instagram", "Facebook", "TikTok"], answer: 2, difficulty: "easy" },
    { question: "What does URL stand for?", options: ["Universal Resource Locator", "Uniform Resource Locator", "Unified Resource Link", "Universal Reference Link"], answer: 1, difficulty: "medium" },
    { question: "True or False: JavaScript is the same as Java.", options: ["True", "False", "", ""], answer: 1, type: "truefalse", difficulty: "medium" },
    { question: "What company owns YouTube?", options: ["Meta", "Amazon", "Google", "Microsoft"], answer: 2, difficulty: "easy" },
    { question: "What is the name of Tesla's AI assistant in cars?", options: ["Siri", "Alexa", "Autopilot", "Cortana"], answer: 2, difficulty: "medium" }
  ],
  "Music": [
    { question: "Who is known as the 'King of Pop'?", options: ["Elvis Presley", "Michael Jackson", "Prince", "Freddie Mercury"], answer: 1, difficulty: "easy" },
    { question: "How many members were in The Beatles?", options: ["3", "4", "5", "6"], answer: 1, difficulty: "easy" },
    { question: "What instrument has 88 keys?", options: ["Guitar", "Violin", "Piano", "Accordion"], answer: 2, difficulty: "easy" },
    { question: "Which band performed 'Bohemian Rhapsody'?", options: ["The Beatles", "Led Zeppelin", "Queen", "Pink Floyd"], answer: 2, difficulty: "easy" },
    { question: "What genre did Elvis Presley popularize?", options: ["Jazz", "Rock and Roll", "Blues", "Country"], answer: 1, difficulty: "easy" },
    { question: "How many strings does a violin have?", options: ["3", "4", "5", "6"], answer: 1, difficulty: "medium" },
    { question: "Who sang 'Like a Rolling Stone'?", options: ["Bob Dylan", "John Lennon", "Bruce Springsteen", "David Bowie"], answer: 0, difficulty: "medium" },
    { question: "What is the best-selling album of all time?", options: ["Thriller", "Back in Black", "The Dark Side of the Moon", "Rumours"], answer: 0, difficulty: "medium" },
    { question: "True or False: Madonna is known as the 'Queen of Pop'.", options: ["True", "False", "", ""], answer: 0, type: "truefalse", difficulty: "easy" },
    { question: "_____ wrote 'Imagine'.", options: ["Paul McCartney", "John Lennon", "George Harrison", "Ringo Starr"], answer: 1, type: "fillblank", difficulty: "easy" },
    { question: "What country did the band ABBA come from?", options: ["Norway", "Denmark", "Sweden", "Finland"], answer: 2, difficulty: "medium" },
    { question: "Who is known as the 'Guitar God'?", options: ["Eric Clapton", "Jimi Hendrix", "Jimmy Page", "Carlos Santana"], answer: 1, difficulty: "medium" },
    { question: "What year was Spotify founded?", options: ["2004", "2006", "2008", "2010"], answer: 1, difficulty: "hard" },
    { question: "Which artist has the most Grammy awards?", options: ["Michael Jackson", "Beyoncé", "Taylor Swift", "Stevie Wonder"], answer: 1, difficulty: "hard" },
    { question: "What is the name of Taylor Swift's debut single?", options: ["Love Story", "Tim McGraw", "Teardrops on My Guitar", "Our Song"], answer: 1, difficulty: "hard" },
    { question: "True or False: Beethoven was deaf when he composed some of his works.", options: ["True", "False", "", ""], answer: 0, type: "truefalse", difficulty: "medium" },
    { question: "How many symphonies did Beethoven compose?", options: ["7", "8", "9", "10"], answer: 2, difficulty: "hard" }
  ],
  "Nature": [
    { question: "What is the largest land animal?", options: ["Rhino", "Hippo", "African Elephant", "Giraffe"], answer: 2, difficulty: "easy" },
    { question: "How many legs does a spider have?", options: ["6", "8", "10", "12"], answer: 1, difficulty: "easy" },
    { question: "What is the fastest bird in the world?", options: ["Eagle", "Falcon", "Hawk", "Condor"], answer: 1, difficulty: "medium" },
    { question: "Which animal is known as the 'King of the Jungle'?", options: ["Tiger", "Lion", "Leopard", "Cheetah"], answer: 1, difficulty: "easy" },
    { question: "What is the largest species of shark?", options: ["Great White", "Tiger Shark", "Whale Shark", "Hammerhead"], answer: 2, difficulty: "medium" },
    { question: "How long can a tortoise live?", options: ["50 years", "100 years", "150 years", "200+ years"], answer: 3, difficulty: "medium" },
    { question: "What is the tallest tree species?", options: ["Oak", "Pine", "Redwood", "Maple"], answer: 2, difficulty: "medium" },
    { question: "Which animal can change its color?", options: ["Gecko", "Chameleon", "Iguana", "Salamander"], answer: 1, difficulty: "easy" },
    { question: "True or False: Dolphins are mammals.", options: ["True", "False", "", ""], answer: 0, type: "truefalse", difficulty: "easy" },
    { question: "_____ is the process by which plants make food.", options: ["Respiration", "Photosynthesis", "Digestion", "Fermentation"], answer: 1, type: "fillblank", difficulty: "easy" },
    { question: "What is the smallest bird in the world?", options: ["Sparrow", "Hummingbird", "Finch", "Wren"], answer: 1, difficulty: "medium" },
    { question: "Which continent has the most biodiversity?", options: ["Africa", "Asia", "South America", "North America"], answer: 2, difficulty: "medium" },
    { question: "What is the largest rainforest in the world?", options: ["Congo", "Daintree", "Amazon", "Southeast Asian"], answer: 2, difficulty: "easy" },
    { question: "How many hearts does an earthworm have?", options: ["1", "3", "5", "9"], answer: 2, difficulty: "hard" },
    { question: "Which animal sleeps the most (up to 22 hours/day)?", options: ["Sloth", "Koala", "Cat", "Bat"], answer: 1, difficulty: "medium" },
    { question: "What is the deepest part of the ocean called?", options: ["Mariana Trench", "Pacific Depth", "Ocean Floor", "Abyssal Zone"], answer: 0, difficulty: "medium" },
    { question: "True or False: A group of lions is called a pride.", options: ["True", "False", "", ""], answer: 0, type: "truefalse", difficulty: "easy" },
    { question: "What type of animal is a Komodo dragon?", options: ["Mammal", "Amphibian", "Reptile", "Fish"], answer: 2, difficulty: "medium" },
    { question: "Which bird cannot fly?", options: ["Eagle", "Penguin", "Parrot", "Owl"], answer: 1, difficulty: "easy" }
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

async function getRandomQuestions(theme, count, difficulty = 'mixed') {
  let questions = theme === 'Random' 
    ? Object.values(QUESTIONS_BY_THEME).flat()
    : QUESTIONS_BY_THEME[theme] || Object.values(QUESTIONS_BY_THEME).flat();
  
  const customQuestions = await Questions.getApproved(theme === 'Random' ? null : theme);
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
  const players = Array.from(io.sockets.adapter.rooms.get(roomCode) || [])
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
        team: socket.data.team,
        correctThisGame: socket.data.correctThisGame,
        bestStreakThisGame: socket.data.bestStreakThisGame,
        isBot: false
      } : null;
    })
    .filter(Boolean);
  
  if (room.bots) {
    players.push(...room.bots.map(b => ({ ...b, isBot: true })));
  }
  
  return players;
}

function clearTimer(roomCode) {
  if (questionTimers.has(roomCode)) {
    clearTimeout(questionTimers.get(roomCode));
    questionTimers.delete(roomCode);
  }
}

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || username.length < 2 || username.length > 15) {
    return res.status(400).json({ error: 'Username must be 2-15 characters' });
  }
  if (!password || password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters' });
  }
  
  try {
    const user = await User.create(username, password);
    res.json({ success: true, user });
  } catch (e) {
    console.error('Registration error:', e.message, e.code);
    if (e.code === '23505') {
      res.status(400).json({ error: 'Username already taken' });
    } else {
      res.status(500).json({ error: 'Failed to create user: ' + e.message });
    }
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.validatePassword(username, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  res.json({ success: true, user });
});

app.get('/api/user/:id', async (req, res) => {
  const user = await User.getById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

app.get('/api/leaderboard/:type', async (req, res) => {
  const leaderboard = await User.getLeaderboard(req.params.type, 100);
  res.json(leaderboard);
});

app.post('/api/daily-reward/:id', async (req, res) => {
  const result = await User.claimDailyReward(req.params.id);
  res.json(result);
});

app.get('/api/inventory/:id', async (req, res) => {
  const inventory = await User.getInventory(req.params.id);
  res.json(inventory);
});

app.get('/api/achievements/:id', async (req, res) => {
  const achievements = await User.getAchievements(req.params.id);
  res.json(achievements);
});

app.get('/api/history/:id', async (req, res) => {
  const history = await GameHistory.getRecent(req.params.id, 20);
  res.json(history);
});

app.post('/api/add-coins', async (req, res) => { const { userId, amount } = req.body; await User.addCoins(userId, amount); const updated = await User.getById(userId); res.json({ success: true, user: updated }); });

app.post('/api/equip-avatar', async (req, res) => {
  const { userId, avatarId } = req.body;
  await User.equipAvatar(userId, avatarId);
  res.json({ success: true });
});

app.post('/api/equip-color', async (req, res) => {
  const { userId, colorId } = req.body;
  await User.equipColor(userId, colorId);
  res.json({ success: true });
});

app.post('/api/buy-avatar', async (req, res) => {
  const { userId, avatarId } = req.body;
  const result = await User.buyAvatar(userId, avatarId);
  res.json(result);
});

app.post('/api/buy-color', async (req, res) => {
  const { userId, colorId } = req.body;
  const result = await User.buyColor(userId, colorId);
  res.json(result);
});

app.get('/api/friends/:id', async (req, res) => {
  const friends = await Friends.getFriends(req.params.id);
  res.json(friends);
});

app.post('/api/friend-request', async (req, res) => {
  const { userId, friendId } = req.body;
  const result = await Friends.add(userId, friendId);
  res.json(result);
});

app.post('/api/friend-accept', async (req, res) => {
  const { userId, friendId } = req.body;
  await Friends.accept(userId, friendId);
  res.json({ success: true });
});


app.get('/api/friend-requests/:id', async (req, res) => {
  const requests = Friends.getPending(req.params.id);
  res.json(requests);
});

app.get('/api/user/search/:name', async (req, res) => {
  const result = await pool.query('SELECT id, username, level FROM users WHERE username ILIKE $1 LIMIT 10', ['%' + req.params.name + '%']);
  res.json(result.rows);
});

app.post('/api/friend-accept', async (req, res) => {
  const { userId, friendId } = req.body;
  await Friends.accept(userId, friendId);
  res.json({ success: true });
});

app.post('/api/friend-decline', async (req, res) => {
  const { userId, friendId } = req.body;
  await Friends.remove(userId, friendId);
  res.json({ success: true });
});

app.post('/api/friend-remove', async (req, res) => {
  const { userId, friendId } = req.body;
  await Friends.remove(userId, friendId);
  res.json({ success: true });
});

app.post('/api/submit-question', async (req, res) => {
  const { userId, question, options, correctAnswer, theme, difficulty } = req.body;
  const id = await Questions.submit(userId, question, options, correctAnswer, theme, difficulty);
  res.json({ success: true, id });
});

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'trivia2024';
const ADMIN_TOKEN = crypto.createHash('sha256').update(process.env.DATABASE_URL || 'admin-secret').digest('hex').substring(0, 32);

function authAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token === ADMIN_TOKEN) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/admin/verify', authAdmin, (req, res) => {
  res.json({ valid: true });
});

app.get('/api/admin/stats', authAdmin, async (req, res) => {
  try {
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const gamesResult = await pool.query('SELECT SUM(total_games) as sum FROM users');
    const questionsResult = await pool.query('SELECT COUNT(*) as count FROM custom_questions');
    const pendingResult = await pool.query('SELECT COUNT(*) as count FROM custom_questions WHERE approved = false');
    
    const stats = {
      totalUsers: parseInt(usersResult.rows[0]?.count) || 0,
      totalGames: parseInt(gamesResult.rows[0]?.sum) || 0,
      totalQuestions: parseInt(questionsResult.rows[0]?.count) || 0,
      pendingQuestions: parseInt(pendingResult.rows[0]?.count) || 0
    };
    res.json(stats);
  } catch (e) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/admin/users', authAdmin, async (req, res) => {
  const result = await pool.query('SELECT id, username, xp, level, coins, total_games, total_wins, total_correct, best_streak, created_at FROM users ORDER BY created_at DESC');
  res.json(result.rows);
});

app.put('/api/admin/user/:id', authAdmin, async (req, res) => {
  const { username, xp, coins, level } = req.body;
  try {
    await pool.query('UPDATE users SET username = $1, xp = $2, coins = $3, level = $4 WHERE id = $5', [username, xp, coins, level, req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/admin/user/:id', authAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM user_avatars WHERE user_id = $1', [req.params.id]);
    await pool.query('DELETE FROM user_colors WHERE user_id = $1', [req.params.id]);
    await pool.query('DELETE FROM user_achievements WHERE user_id = $1', [req.params.id]);
    await pool.query('DELETE FROM friends WHERE user_id = $1 OR friend_id = $1', [req.params.id]);
    await pool.query('DELETE FROM custom_questions WHERE user_id = $1', [req.params.id]);
    await pool.query('DELETE FROM game_history WHERE user_id = $1', [req.params.id]);
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.get('/api/admin/questions', authAdmin, async (req, res) => {
  const result = await pool.query('SELECT * FROM custom_questions ORDER BY created_at DESC');
  res.json(result.rows);
});

app.post('/api/admin/question/:id/approve', authAdmin, async (req, res) => {
  await pool.query('UPDATE custom_questions SET approved = true WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

app.delete('/api/admin/question/:id', authAdmin, async (req, res) => {
  await pool.query('DELETE FROM custom_questions WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

app.get('/api/admin/history', authAdmin, async (req, res) => {
  const result = await pool.query(`
    SELECT gh.*, u.username FROM game_history gh
    LEFT JOIN users u ON gh.user_id = u.id
    ORDER BY gh.played_at DESC LIMIT 100
  `);
  res.json(result.rows);
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

  socket.on('create-room', async ({ name, theme, gameMode, avatar, color, settings, isPractice }) => {
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
    
    const questions = await getRandomQuestions(theme, questionCount, difficulty);
    
    const bots = [];
    if (isPractice) {
      const botNames = ['Bot Alex', 'Bot Sam', 'Bot Jordan', 'Bot Taylor', 'Bot Morgan'];
      for (let i = 0; i < 3; i++) {
        bots.push({
          id: `bot-${roomCode}-${i}`,
          name: botNames[i],
          score: 0,
          mascot: MASCOTS[Math.floor(Math.random() * MASCOTS.length)],
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          answered: false,
          superpowers: [],
          shieldActive: false,
          hasSecondChance: false,
          lives: 3,
          bet: 0,
          frozen: false,
          frozenUntil: 0,
          streak: 0,
          correctThisGame: 0,
          userId: null,
          team: null,
          isBot: true
        });
      }
    }
    
    rooms.set(roomCode, {
      host: socket.id,
      players: [socket.id, ...bots.map(b => b.id)],
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
      teams: { red: [], blue: [] },
      isPractice: isPractice || false,
      bots: bots
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
      settings: rooms.get(roomCode).settings,
      isPractice: isPractice || false
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
    const minNeeded = room.isPractice ? 1 : MIN_PLAYERS;
    if (playerCount < minNeeded) {
      socket.emit('error', 'Need at least ' + minNeeded + ' players to start');
      return;
    }
    
    room.gameStarted = true;
    room.currentQuestion = 0;
    
    if (room.gameMode === 'Team') {
      const players = getRoomPlayers(roomCode);
      const shuffled = shuffleArray(players);
      shuffled.forEach((p, i) => {
        if (!p.isBot) {
          const s = io.sockets.sockets.get(p.id);
          if (s) {
            s.data.team = i % 2 === 0 ? 'red' : 'blue';
            room.teams[s.data.team].push(p.id);
          }
        } else {
          p.team = i % 2 === 0 ? 'red' : 'blue';
          room.teams[p.team].push(p.id);
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
    
    if (room.bots && room.bots.length > 0) {
      room.bots.forEach(bot => {
        bot.answered = false;
        const answerDelay = 2000 + Math.random() * 6000;
        setTimeout(() => {
          if (!room.gameStarted) return;
          const currentQ = room.questions[room.currentQuestion];
          if (!currentQ) return;
          
          const difficulty = currentQ.difficulty || 'medium';
          let accuracy;
          switch (difficulty) {
            case 'easy': accuracy = 0.70; break;
            case 'medium': accuracy = 0.50; break;
            case 'hard': accuracy = 0.30; break;
            default: accuracy = 0.50;
          }
          
          let botAnswer;
          if (Math.random() < accuracy) {
            botAnswer = currentQ.answer;
          } else {
            const wrongAnswers = [0, 1, 2, 3].filter(i => i !== currentQ.answer);
            botAnswer = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
          }
          
          bot.answered = true;
          const timeTaken = (Date.now() - room.questionStartTime) / 1000;
          const speedBonus = Math.max(0, Math.floor((room.settings.timeLimit - timeTaken) * SPEED_BONUS_MULTIPLIER));
          
          room.answers.set(bot.id, {
            answerIndex: botAnswer,
            timeTaken,
            speedBonus,
            pointsMultiplier: 1,
            shieldActive: false,
            bet: 0
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
        }, answerDelay);
      });
    }
    
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
      const isBot = socketId.startsWith('bot-');
      const bot = isBot ? room.bots?.find(b => b.id === socketId) : null;
      
      if (playerSocket || bot) {
        let correct = data.answerIndex === question.answer;
        let points = 0;
        const targetData = playerSocket ? playerSocket.data : bot;
        
        if (room.gameMode === "Betting") {
          if (correct) {
            points = data.bet + Math.floor((MAX_POINTS + data.speedBonus) * difficultyMult);
            targetData.score += points;
          } else {
            targetData.score -= data.bet;
            points = -data.bet;
          }
        } else if (room.gameMode === "Survival") {
          if (!correct && !data.shieldActive) {
            targetData.lives--;
            if (targetData.lives < 0) targetData.lives = 0;
          } else if (correct) {
            points = Math.floor((MAX_POINTS + data.speedBonus) * data.pointsMultiplier * difficultyMult);
            
            const streakBonus = Math.min(targetData.streak * STREAK_BONUS, MAX_STREAK_BONUS);
            points += streakBonus;
            
            targetData.score += points;
            targetData.streak++;
            targetData.correctThisGame++;
            
            if (targetData.streak > (targetData.bestStreakThisGame || 0)) {
              targetData.bestStreakThisGame = targetData.streak;
            }
            
            if (room.settings.powerupsEnabled && playerSocket && Math.random() < 0.35) {
              const newPower = getRandomSuperpower();
              playerSocket.data.superpowers.push(newPower);
              playerSocket.emit('superpower-earned', newPower);
            }
          } else if (!correct && data.shieldActive) {
            targetData.shieldActive = false;
            targetData.streak = 0;
          }
          if (!correct && !data.shieldActive) {
            targetData.streak = 0;
          }
        } else if (room.gameMode === "Blitz") {
          if (!correct && !data.shieldActive) {
            targetData.lives = 0;
            targetData.streak = 0;
          } else if (correct) {
            points = Math.floor((MAX_POINTS + data.speedBonus) * data.pointsMultiplier * difficultyMult);
            const streakBonus = Math.min(targetData.streak * STREAK_BONUS, MAX_STREAK_BONUS);
            points += streakBonus;
            targetData.score += points;
            targetData.streak++;
            targetData.correctThisGame++;
            
            if (room.settings.powerupsEnabled && playerSocket && Math.random() < 0.35) {
              const newPower = getRandomSuperpower();
              playerSocket.data.superpowers.push(newPower);
              playerSocket.emit('superpower-earned', newPower);
            }
          }
        } else {
          if (!correct && data.shieldActive) {
            correct = true;
            points = 50;
            targetData.shieldActive = false;
          }
          
          if (correct) {
            points = Math.floor((MAX_POINTS + data.speedBonus) * data.pointsMultiplier * difficultyMult);
            const streakBonus = Math.min(targetData.streak * STREAK_BONUS, MAX_STREAK_BONUS);
            points += streakBonus;
            targetData.score += points;
            targetData.streak++;
            targetData.correctThisGame++;
            
            if (room.settings.powerupsEnabled && playerSocket && Math.random() < 0.35) {
              const newPower = getRandomSuperpower();
              playerSocket.data.superpowers.push(newPower);
              playerSocket.emit('superpower-earned', newPower);
            }
          } else {
            targetData.streak = 0;
          }
        }
        
        results.push({
          name: targetData.name,
          mascot: targetData.mascot,
          answer: data.answerIndex,
          correct,
          points: correct ? points : (room.gameMode === "Betting" ? -data.bet : 0),
          time: data.timeTaken.toFixed(1),
          speedBonus: data.speedBonus,
          lives: targetData.lives,
          streak: targetData.streak
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

  socket.on('next-question', async () => {
    const roomCode = socket.data.currentRoom;
    const room = rooms.get(roomCode);
    
    if (!room || room.host !== socket.id) return;
    
    clearTimer(roomCode);
    room.currentQuestion++;
    
    if (room.gameMode === "Survival") {
      const alivePlayers = getRoomPlayers(roomCode).filter(p => p.lives > 0);
      if (alivePlayers.length <= 1) {
        await endGame(roomCode);
        return;
      }
    }
    
    if (room.gameMode === "Blitz") {
      const alivePlayers = getRoomPlayers(roomCode).filter(p => p.lives > 0);
      if (alivePlayers.length <= 1) {
        await endGame(roomCode);
        return;
      }
    }
    
    if (room.gameMode === "BattleRoyale") {
      const alivePlayers = getRoomPlayers(roomCode).filter(p => p.lives > 0);
      if (alivePlayers.length <= 1) {
        await endGame(roomCode);
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
      await endGame(roomCode);
    }
  });

  async function endGame(roomCode) {
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
    
    if (!room.isPractice) {
      for (let rank = 0; rank < players.length; rank++) {
        const p = players[rank];
        if (p.userId && !p.isBot) {
          const xpGained = Math.floor((p.score / 10) + (rank === 0 ? 100 : rank === 1 ? 50 : rank === 2 ? 25 : 10));
          const coinsGained = Math.floor(p.score / 20) + (rank === 0 ? 20 : 10);
          
          await User.addXp(p.userId, xpGained);
          await User.addCoins(p.userId, coinsGained);
          await User.updateStats(p.userId, {
            gamesPlayed: 1,
            gamesWon: rank === 0 ? 1 : 0,
            correctAnswers: p.correctThisGame || 0,
            questionsAnswered: room.questions.length,
            bestStreak: p.bestStreakThisGame || 0
          });
          
          await User.checkAchievements(p.userId, {
            gamesPlayed: 1,
            gamesWon: rank === 0 ? 1 : 0,
            streak: p.bestStreakThisGame || 0
          });
          
          await GameHistory.record(p.userId, {
            roomCode,
            gameMode: room.gameMode,
            theme: room.theme,
            score: p.score,
            correctAnswers: p.correctThisGame || 0,
            totalQuestions: room.questions.length,
            rank: rank + 1,
            playersCount: players.filter(pl => !pl.isBot).length,
            xpEarned: xpGained,
            coinsEarned: coinsGained
          });
          
          p.xpGained = xpGained;
          p.coinsGained = coinsGained;
        }
      }
    }
    
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

  socket.on('rematch', async () => {
    const roomCode = socket.data.currentRoom;
    const room = rooms.get(roomCode);
    
    if (!room || room.host !== socket.id) return;
    
    const players = getRoomPlayers(roomCode);
    const newRoomCode = generateCode();
    const newQuestions = await getRandomQuestions(room.theme, room.settings.questionCount, room.settings.difficulty);
    
    const newBots = room.bots ? room.bots.map(b => ({
      ...b,
      score: 0,
      answered: false,
      superpowers: [],
      shieldActive: false,
      hasSecondChance: false,
      lives: 3,
      bet: 0,
      frozen: false,
      frozenUntil: 0,
      streak: 0,
      correctThisGame: 0,
      team: null
    })) : [];
    
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
      teams: { red: [], blue: [] },
      isPractice: room.isPractice || false,
      bots: newBots
    });
    
    players.forEach(p => {
      if (p.isBot) return;
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
          settings: room.settings,
          isPractice: room.isPractice || false
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