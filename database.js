const Database = require('better-sqlite3');
const path = require('path');
const { randomUUID } = require('crypto');

const db = new Database(path.join(__dirname, 'trivia.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL COLLATE NOCASE,
    password TEXT NOT NULL,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    coins INTEGER DEFAULT 0,
    total_games INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    total_correct INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
    daily_reward_claimed DATE
  );

  CREATE TABLE IF NOT EXISTS avatars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emoji TEXT NOT NULL,
    name TEXT,
    rarity TEXT DEFAULT 'common',
    unlock_level INTEGER DEFAULT 1,
    unlock_cost INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS user_avatars (
    user_id TEXT,
    avatar_id INTEGER,
    equipped BOOLEAN DEFAULT 0,
    PRIMARY KEY (user_id, avatar_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (avatar_id) REFERENCES avatars(id)
  );

  CREATE TABLE IF NOT EXISTS colors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    gradient TEXT NOT NULL,
    rarity TEXT DEFAULT 'common',
    unlock_level INTEGER DEFAULT 1,
    unlock_cost INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS user_colors (
    user_id TEXT,
    color_id INTEGER,
    equipped BOOLEAN DEFAULT 0,
    PRIMARY KEY (user_id, color_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (color_id) REFERENCES colors(id)
  );

  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    xp_reward INTEGER DEFAULT 0,
    condition_type TEXT,
    condition_value INTEGER
  );

  CREATE TABLE IF NOT EXISTS user_achievements (
    user_id TEXT,
    achievement_id INTEGER,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id)
  );

  CREATE TABLE IF NOT EXISTS friends (
    user_id TEXT,
    friend_id TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, friend_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (friend_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS custom_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer INTEGER NOT NULL,
    theme TEXT,
    difficulty TEXT DEFAULT 'medium',
    votes_up INTEGER DEFAULT 0,
    votes_down INTEGER DEFAULT 0,
    approved BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS game_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    room_code TEXT,
    game_mode TEXT,
    theme TEXT,
    score INTEGER,
    correct_answers INTEGER,
    total_questions INTEGER,
    rank INTEGER,
    players_count INTEGER,
    xp_earned INTEGER DEFAULT 0,
    coins_earned INTEGER DEFAULT 0,
    played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

const defaultAvatars = [
  { emoji: '🦊', name: 'Fox', rarity: 'common', unlock_level: 1, unlock_cost: 0 },
  { emoji: '🐸', name: 'Frog', rarity: 'common', unlock_level: 1, unlock_cost: 0 },
  { emoji: '🐱', name: 'Cat', rarity: 'common', unlock_level: 1, unlock_cost: 0 },
  { emoji: '🐶', name: 'Dog', rarity: 'common', unlock_level: 1, unlock_cost: 0 },
  { emoji: '🐰', name: 'Rabbit', rarity: 'common', unlock_level: 1, unlock_cost: 0 },
  { emoji: '🐻', name: 'Bear', rarity: 'common', unlock_level: 1, unlock_cost: 0 },
  { emoji: '🦁', name: 'Lion', rarity: 'rare', unlock_level: 5, unlock_cost: 100 },
  { emoji: '🐼', name: 'Panda', rarity: 'rare', unlock_level: 5, unlock_cost: 100 },
  { emoji: '🦄', name: 'Unicorn', rarity: 'rare', unlock_level: 10, unlock_cost: 200 },
  { emoji: '🦋', name: 'Butterfly', rarity: 'rare', unlock_level: 10, unlock_cost: 200 },
  { emoji: '🦅', name: 'Eagle', rarity: 'epic', unlock_level: 15, unlock_cost: 500 },
  { emoji: '🐺', name: 'Wolf', rarity: 'epic', unlock_level: 15, unlock_cost: 500 },
  { emoji: '🦈', name: 'Shark', rarity: 'epic', unlock_level: 20, unlock_cost: 500 },
  { emoji: '🐬', name: 'Dolphin', rarity: 'epic', unlock_level: 20, unlock_cost: 500 },
  { emoji: '🦉', name: 'Owl', rarity: 'legendary', unlock_level: 25, unlock_cost: 1000 },
  { emoji: '🐲', name: 'Dragon', rarity: 'legendary', unlock_level: 30, unlock_cost: 1500 },
  { emoji: '🦚', name: 'Peacock', rarity: 'legendary', unlock_level: 35, unlock_cost: 2000 },
  { emoji: '👑', name: 'Crown', rarity: 'mythic', unlock_level: 50, unlock_cost: 5000 },
  { emoji: '🌟', name: 'Star', rarity: 'mythic', unlock_level: 50, unlock_cost: 5000 },
  { emoji: '🔥', name: 'Fire', rarity: 'mythic', unlock_level: 50, unlock_cost: 5000 }
];

const defaultColors = [
  { name: 'Ocean Blue', gradient: 'linear-gradient(135deg, #00d4ff, #0099cc)', rarity: 'common', unlock_level: 1, unlock_cost: 0 },
  { name: 'Purple Haze', gradient: 'linear-gradient(135deg, #7c3aed, #5b21b6)', rarity: 'common', unlock_level: 1, unlock_cost: 0 },
  { name: 'Pink Dream', gradient: 'linear-gradient(135deg, #f472b6, #db2777)', rarity: 'common', unlock_level: 1, unlock_cost: 0 },
  { name: 'Forest Green', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)', rarity: 'common', unlock_level: 1, unlock_cost: 0 },
  { name: 'Golden Sun', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', rarity: 'common', unlock_level: 1, unlock_cost: 0 },
  { name: 'Fire Red', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', rarity: 'common', unlock_level: 1, unlock_cost: 0 },
  { name: 'Cyan Wave', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)', rarity: 'rare', unlock_level: 5, unlock_cost: 100 },
  { name: 'Violet Storm', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', rarity: 'rare', unlock_level: 5, unlock_cost: 100 },
  { name: 'Hot Pink', gradient: 'linear-gradient(135deg, #ec4899, #db2777)', rarity: 'rare', unlock_level: 10, unlock_cost: 200 },
  { name: 'Teal Ocean', gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)', rarity: 'rare', unlock_level: 10, unlock_cost: 200 },
  { name: 'Rainbow', gradient: 'linear-gradient(135deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #8b00ff)', rarity: 'epic', unlock_level: 20, unlock_cost: 500 },
  { name: 'Galaxy', gradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', rarity: 'epic', unlock_level: 20, unlock_cost: 500 },
  { name: 'Sunset', gradient: 'linear-gradient(135deg, #f472b6, #fb923c, #fbbf24)', rarity: 'legendary', unlock_level: 30, unlock_cost: 1000 },
  { name: 'Neon', gradient: 'linear-gradient(135deg, #00ff00, #00ffff, #ff00ff)', rarity: 'legendary', unlock_level: 35, unlock_cost: 1500 },
  { name: 'Aurora', gradient: 'linear-gradient(135deg, #00ff87, #60efff, #ff00ff, #ff0080)', rarity: 'mythic', unlock_level: 50, unlock_cost: 5000 }
];

const defaultAchievements = [
  { name: 'First Steps', description: 'Play your first game', icon: '🎮', xp_reward: 50, condition_type: 'games_played', condition_value: 1 },
  { name: 'Getting Started', description: 'Play 10 games', icon: '🎯', xp_reward: 100, condition_type: 'games_played', condition_value: 10 },
  { name: 'Veteran', description: 'Play 100 games', icon: '🏅', xp_reward: 500, condition_type: 'games_played', condition_value: 100 },
  { name: 'First Win', description: 'Win your first game', icon: '🏆', xp_reward: 100, condition_type: 'games_won', condition_value: 1 },
  { name: 'Champion', description: 'Win 10 games', icon: '👑', xp_reward: 300, condition_type: 'games_won', condition_value: 10 },
  { name: 'Legend', description: 'Win 50 games', icon: '🌟', xp_reward: 1000, condition_type: 'games_won', condition_value: 50 },
  { name: 'Speed Demon', description: 'Answer in under 2 seconds', icon: '⚡', xp_reward: 50, condition_type: 'fast_answer', condition_value: 1 },
  { name: 'Streak Master', description: 'Get a 5 answer streak', icon: '🔥', xp_reward: 100, condition_type: 'streak', condition_value: 5 },
  { name: 'Unstoppable', description: 'Get a 10 answer streak', icon: '💎', xp_reward: 300, condition_type: 'streak', condition_value: 10 },
  { name: 'Perfectionist', description: 'Get all questions correct', icon: '💯', xp_reward: 200, condition_type: 'perfect_game', condition_value: 1 },
  { name: 'Survivor', description: 'Win a Survival mode game', icon: '❤️', xp_reward: 150, condition_type: 'survival_win', condition_value: 1 },
  { name: 'High Roller', description: 'Bet 500+ points in one round', icon: '🎰', xp_reward: 100, condition_type: 'big_bet', condition_value: 500 },
  { name: 'Lightning Fast', description: 'Win a Lightning round', icon: '🌩️', xp_reward: 200, condition_type: 'lightning_win', condition_value: 1 },
  { name: 'Social Butterfly', description: 'Add 5 friends', icon: '🦋', xp_reward: 100, condition_type: 'friends', condition_value: 5 },
  { name: 'Question Creator', description: 'Submit 10 approved questions', icon: '✍️', xp_reward: 200, condition_type: 'questions_submitted', condition_value: 10 }
];

const insertAvatar = db.prepare('INSERT OR IGNORE INTO avatars (emoji, name, rarity, unlock_level, unlock_cost) VALUES (?, ?, ?, ?, ?)');
defaultAvatars.forEach(a => insertAvatar.run(a.emoji, a.name, a.rarity, a.unlock_level, a.unlock_cost));

const insertColor = db.prepare('INSERT OR IGNORE INTO colors (name, gradient, rarity, unlock_level, unlock_cost) VALUES (?, ?, ?, ?, ?)');
defaultColors.forEach(c => insertColor.run(c.name, c.gradient, c.rarity, c.unlock_level, c.unlock_cost));

const insertAchievement = db.prepare('INSERT OR IGNORE INTO achievements (name, description, icon, xp_reward, condition_type, condition_value) VALUES (?, ?, ?, ?, ?, ?)');
defaultAchievements.forEach(a => insertAchievement.run(a.name, a.description, a.icon, a.xp_reward, a.condition_type, a.condition_value));

function calculateLevel(xp) {
  if (xp < 100) return 1;
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

function xpForLevel(level) {
  if (level <= 1) return 0;
  return Math.pow(level - 1, 2) * 100;
}

function xpToNextLevel(currentXp) {
  const currentLevel = calculateLevel(currentXp);
  const nextLevelXp = xpForLevel(currentLevel + 1);
  return {
    currentLevel,
    nextLevelXp,
    xpProgress: currentXp - xpForLevel(currentLevel),
    xpNeeded: nextLevelXp - xpForLevel(currentLevel),
    progress: (currentXp - xpForLevel(currentLevel)) / (nextLevelXp - xpForLevel(currentLevel)) * 100
  };
}

const User = {
  create: (username, password) => {
    const id = randomUUID();
    const stmt = db.prepare('INSERT INTO users (id, username, password) VALUES (?, ?, ?)');
    stmt.run(id, username.toLowerCase(), password);
    
    const commonAvatars = db.prepare('SELECT id FROM avatars WHERE rarity = ?').all('common');
    const commonColors = db.prepare('SELECT id FROM colors WHERE rarity = ?').all('common');
    
    const insertUserAvatar = db.prepare('INSERT INTO user_avatars (user_id, avatar_id, equipped) VALUES (?, ?, ?)');
    commonAvatars.forEach((a, i) => insertUserAvatar.run(id, a.id, i === 0 ? 1 : 0));
    
    const insertUserColor = db.prepare('INSERT INTO user_colors (user_id, color_id, equipped) VALUES (?, ?, ?)');
    commonColors.forEach((c, i) => insertUserColor.run(id, c.id, i === 0 ? 1 : 0));
    
    return User.getById(id);
  },
  
  getById: (id) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) return null;
    return User.addCalculatedFields(user);
  },
  
  getByUsername: (username) => {
    const user = db.prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE').get(username);
    if (!user) return null;
    return User.addCalculatedFields(user);
  },
  
  addCalculatedFields: (user) => {
    if (!user) return null;
    
    user.level = calculateLevel(user.xp);
    const xpInfo = xpToNextLevel(user.xp);
    user.xpProgress = xpInfo.xpProgress;
    user.xpNeeded = xpInfo.xpNeeded;
    user.xpPercentage = xpInfo.progress;
    user.winRate = user.total_games > 0 ? Math.round((user.total_wins / user.total_games) * 100) : 0;
    user.accuracy = user.total_questions > 0 ? Math.round((user.total_correct / user.total_questions) * 100) : 0;
    
    const equippedAvatar = db.prepare(`
      SELECT a.* FROM avatars a
      JOIN user_avatars ua ON a.id = ua.avatar_id
      WHERE ua.user_id = ? AND ua.equipped = 1
    `).get(user.id);
    user.equippedAvatar = equippedAvatar?.emoji || '🦊';
    
    const equippedColor = db.prepare(`
      SELECT c.* FROM colors c
      JOIN user_colors uc ON c.id = uc.color_id
      WHERE uc.user_id = ? AND uc.equipped = 1
    `).get(user.id);
    user.equippedColor = equippedColor?.gradient || 'linear-gradient(135deg, #00d4ff, #0099cc)';
    
    return user;
  },
  
  validatePassword: (username, password) => {
    const user = db.prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE').get(username);
    if (!user) return null;
    if (user.password !== password) return null;
    return User.addCalculatedFields(user);
  },
  
  addXp: (id, amount) => {
    const user = db.prepare('SELECT xp, level FROM users WHERE id = ?').get(id);
    if (!user) return null;
    
    const oldLevel = calculateLevel(user.xp);
    const newLevel = calculateLevel(user.xp + amount);
    const leveledUp = newLevel > oldLevel;
    
    db.prepare('UPDATE users SET xp = xp + ? WHERE id = ?').run(amount, id);
    
    if (leveledUp) {
      User.checkUnlocks(id, newLevel);
    }
    
    const updatedUser = User.getById(id);
    return { 
      leveledUp, 
      newLevel, 
      xpGained: amount,
      user: updatedUser
    };
  },
  
  addCoins: (id, amount) => {
    db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(amount, id);
  },
  
  checkUnlocks: (id, level) => {
    const newAvatars = db.prepare('SELECT id FROM avatars WHERE unlock_level <= ? AND id NOT IN (SELECT avatar_id FROM user_avatars WHERE user_id = ?)').all(level, id);
    const newColors = db.prepare('SELECT id FROM colors WHERE unlock_level <= ? AND id NOT IN (SELECT color_id FROM user_colors WHERE user_id = ?)').all(level, id);
    
    const insertUserAvatar = db.prepare('INSERT OR IGNORE INTO user_avatars (user_id, avatar_id) VALUES (?, ?)');
    newAvatars.forEach(a => insertUserAvatar.run(id, a.id));
    
    const insertUserColor = db.prepare('INSERT OR IGNORE INTO user_colors (user_id, color_id) VALUES (?, ?)');
    newColors.forEach(c => insertUserColor.run(id, c.id));
    
    return { avatars: newAvatars.length, colors: newColors.length };
  },
  
  updateStats: (id, stats) => {
    const setClauses = [];
    const values = [];
    
    if (stats.gamesPlayed !== undefined) {
      setClauses.push('total_games = total_games + ?');
      values.push(stats.gamesPlayed);
    }
    if (stats.gamesWon !== undefined) {
      setClauses.push('total_wins = total_wins + ?');
      values.push(stats.gamesWon);
    }
    if (stats.correctAnswers !== undefined) {
      setClauses.push('total_correct = total_correct + ?');
      values.push(stats.correctAnswers);
    }
    if (stats.questionsAnswered !== undefined) {
      setClauses.push('total_questions = total_questions + ?');
      values.push(stats.questionsAnswered);
    }
    if (stats.bestStreak !== undefined) {
      setClauses.push('best_streak = MAX(best_streak, ?)');
      values.push(stats.bestStreak);
    }
    
    if (setClauses.length > 0) {
      values.push(id);
      db.prepare(`UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
    }
  },
  
  claimDailyReward: (id) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) return null;
    
    const today = new Date().toISOString().split('T')[0];
    if (user.daily_reward_claimed === today) {
      return { claimed: false, message: 'Already claimed today' };
    }
    
    const xpReward = 50 + (user.level * 10);
    const coinReward = 10 + (user.level * 5);
    
    db.prepare('UPDATE users SET daily_reward_claimed = ?, xp = xp + ?, coins = coins + ?, last_login = CURRENT_TIMESTAMP WHERE id = ?').run(today, xpReward, coinReward, id);
    
    return { claimed: true, xpReward, coinReward };
  },
  
  getLeaderboard: (type = 'xp', limit = 100) => {
    const orderBy = {
      xp: 'xp DESC',
      wins: 'total_wins DESC',
      streak: 'best_streak DESC'
    }[type] || 'xp DESC';
    
    return db.prepare(`
      SELECT id, username, xp, level, total_games, total_wins, total_correct, total_questions, best_streak,
             CASE WHEN total_questions > 0 THEN ROUND(total_correct * 100.0 / total_questions, 1) ELSE 0 END as accuracy
      FROM users
      ORDER BY ${orderBy}
      LIMIT ?
    `).all(limit);
  },
  
  equipAvatar: (userId, avatarId) => {
    const owned = db.prepare('SELECT * FROM user_avatars WHERE user_id = ? AND avatar_id = ?').get(userId, avatarId);
    if (!owned) return false;
    
    db.prepare('UPDATE user_avatars SET equipped = 0 WHERE user_id = ?').run(userId);
    db.prepare('UPDATE user_avatars SET equipped = 1 WHERE user_id = ? AND avatar_id = ?').run(userId, avatarId);
    return true;
  },
  
  equipColor: (userId, colorId) => {
    const owned = db.prepare('SELECT * FROM user_colors WHERE user_id = ? AND color_id = ?').get(userId, colorId);
    if (!owned) return false;
    
    db.prepare('UPDATE user_colors SET equipped = 0 WHERE user_id = ?').run(userId);
    db.prepare('UPDATE user_colors SET equipped = 1 WHERE user_id = ? AND color_id = ?').run(userId, colorId);
    return true;
  },
  
  buyAvatar: (userId, avatarId) => {
    const avatar = db.prepare('SELECT * FROM avatars WHERE id = ?').get(avatarId);
    const user = db.prepare('SELECT coins FROM users WHERE id = ?').get(userId);
    
    if (!avatar || !user) return { success: false, message: 'Invalid avatar or user' };
    if (user.coins < avatar.unlock_cost) return { success: false, message: 'Not enough coins' };
    
    const owned = db.prepare('SELECT * FROM user_avatars WHERE user_id = ? AND avatar_id = ?').get(userId, avatarId);
    if (owned) return { success: false, message: 'Already owned' };
    
    db.prepare('UPDATE users SET coins = coins - ? WHERE id = ?').run(avatar.unlock_cost, userId);
    db.prepare('INSERT INTO user_avatars (user_id, avatar_id) VALUES (?, ?)').run(userId, avatarId);
    
    return { success: true };
  },
  
  buyColor: (userId, colorId) => {
    const color = db.prepare('SELECT * FROM colors WHERE id = ?').get(colorId);
    const user = db.prepare('SELECT coins FROM users WHERE id = ?').get(userId);
    
    if (!color || !user) return { success: false, message: 'Invalid color or user' };
    if (user.coins < color.unlock_cost) return { success: false, message: 'Not enough coins' };
    
    const owned = db.prepare('SELECT * FROM user_colors WHERE user_id = ? AND color_id = ?').get(userId, colorId);
    if (owned) return { success: false, message: 'Already owned' };
    
    db.prepare('UPDATE users SET coins = coins - ? WHERE id = ?').run(color.unlock_cost, userId);
    db.prepare('INSERT INTO user_colors (user_id, color_id) VALUES (?, ?)').run(userId, colorId);
    
    return { success: true };
  },
  
  getInventory: (userId) => {
    const avatars = db.prepare(`
      SELECT a.*, ua.equipped, 1 as owned FROM avatars a
      JOIN user_avatars ua ON a.id = ua.avatar_id
      WHERE ua.user_id = ?
      UNION
      SELECT a.*, 0 as equipped, 0 as owned FROM avatars a
      WHERE a.id NOT IN (SELECT avatar_id FROM user_avatars WHERE user_id = ?)
      ORDER BY a.rarity, a.unlock_level
    `).all(userId, userId);
    
    const colors = db.prepare(`
      SELECT c.*, uc.equipped, 1 as owned FROM colors c
      JOIN user_colors uc ON c.id = uc.color_id
      WHERE uc.user_id = ?
      UNION
      SELECT c.*, 0 as equipped, 0 as owned FROM colors c
      WHERE c.id NOT IN (SELECT color_id FROM user_colors WHERE user_id = ?)
      ORDER BY c.rarity, c.unlock_level
    `).all(userId, userId);
    
    return { avatars, colors };
  },
  
  getAchievements: (userId) => {
    return db.prepare(`
      SELECT a.*, ua.unlocked_at IS NOT NULL as unlocked, ua.unlocked_at
      FROM achievements a
      LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
      ORDER BY a.id
    `).all(userId);
  },
  
  unlockAchievement: (userId, achievementId) => {
    const achievement = db.prepare('SELECT * FROM achievements WHERE id = ?').get(achievementId);
    if (!achievement) return null;
    
    const existing = db.prepare('SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?').get(userId, achievementId);
    if (existing) return null;
    
    db.prepare('INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)').run(userId, achievementId);
    User.addXp(userId, achievement.xp_reward);
    
    return achievement;
  },
  
  checkAchievements: (userId, stats) => {
    const unlocked = [];
    
    if (stats.gamesPlayed) {
      const achievements = db.prepare(`
        SELECT a.* FROM achievements a
        LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
        WHERE a.condition_type = 'games_played' AND a.condition_value <= ? AND ua.id IS NULL
      `).all(userId, stats.gamesPlayed);
      achievements.forEach(a => {
        User.unlockAchievement(userId, a.id);
        unlocked.push(a);
      });
    }
    
    if (stats.gamesWon) {
      const achievements = db.prepare(`
        SELECT a.* FROM achievements a
        LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
        WHERE a.condition_type = 'games_won' AND a.condition_value <= ? AND ua.id IS NULL
      `).all(userId, stats.gamesWon);
      achievements.forEach(a => {
        User.unlockAchievement(userId, a.id);
        unlocked.push(a);
      });
    }
    
    if (stats.streak) {
      const achievements = db.prepare(`
        SELECT a.* FROM achievements a
        LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
        WHERE a.condition_type = 'streak' AND a.condition_value <= ? AND ua.id IS NULL
      `).all(userId, stats.streak);
      achievements.forEach(a => {
        User.unlockAchievement(userId, a.id);
        unlocked.push(a);
      });
    }
    
    return unlocked;
  }
};

const Friends = {
  add: (userId, friendId) => {
    if (userId === friendId) return { success: false, message: 'Cannot add yourself' };
    
    const existing = db.prepare('SELECT * FROM friends WHERE user_id = ? AND friend_id = ?').get(userId, friendId);
    if (existing) return { success: false, message: 'Already friends or pending' };
    
    db.prepare('INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)').run(userId, friendId, 'pending');
    db.prepare('INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)').run(friendId, userId, 'pending');
    
    return { success: true };
  },
  
  accept: (userId, friendId) => {
    db.prepare('UPDATE friends SET status = ? WHERE user_id = ? AND friend_id = ?').run('accepted', userId, friendId);
    db.prepare('UPDATE friends SET status = ? WHERE user_id = ? AND friend_id = ?').run('accepted', friendId, userId);
  },
  
  remove: (userId, friendId) => {
    db.prepare('DELETE FROM friends WHERE user_id = ? AND friend_id = ?').run(userId, friendId);
    db.prepare('DELETE FROM friends WHERE user_id = ? AND friend_id = ?').run(friendId, userId);
  },
  
  getFriends: (userId) => {
    return db.prepare(`
      SELECT u.id, u.username, u.xp, u.level, f.status
      FROM users u
      JOIN friends f ON u.id = f.friend_id
      WHERE f.user_id = ? AND f.status = 'accepted'
    `).all(userId);
  },
  
  getPending: (userId) => {
    return db.prepare(`
      SELECT u.id, u.username, u.xp, u.level
      FROM users u
      JOIN friends f ON u.id = f.friend_id
      WHERE f.user_id = ? AND f.status = 'pending' AND f.friend_id != ?
    `).all(userId, userId);
  }
};

const Questions = {
  submit: (userId, question, options, correctAnswer, theme, difficulty) => {
    const result = db.prepare(`
      INSERT INTO custom_questions (user_id, question, option_a, option_b, option_c, option_d, correct_answer, theme, difficulty)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, question, options[0], options[1], options[2], options[3], correctAnswer, theme, difficulty);
    
    return result.lastInsertRowid;
  },
  
  vote: (questionId, upvote) => {
    if (upvote) {
      db.prepare('UPDATE custom_questions SET votes_up = votes_up + 1 WHERE id = ?').run(questionId);
    } else {
      db.prepare('UPDATE custom_questions SET votes_down = votes_down + 1 WHERE id = ?').run(questionId);
    }
    
    const q = db.prepare('SELECT votes_up, votes_down FROM custom_questions WHERE id = ?').get(questionId);
    if (q && q.votes_up - q.votes_down >= 5 && q.votes_up >= 10) {
      db.prepare('UPDATE custom_questions SET approved = 1 WHERE id = ?').run(questionId);
    }
  },
  
  getApproved: (theme = null) => {
    if (theme) {
      return db.prepare('SELECT * FROM custom_questions WHERE approved = 1 AND theme = ?').all(theme);
    }
    return db.prepare('SELECT * FROM custom_questions WHERE approved = 1').all();
  },
  
  getPending: () => {
    return db.prepare('SELECT * FROM custom_questions WHERE approved = 0 ORDER BY created_at DESC LIMIT 50').all();
  }
};

const GameHistory = {
  record: (userId, data) => {
    db.prepare(`
      INSERT INTO game_history (user_id, room_code, game_mode, theme, score, correct_answers, total_questions, rank, players_count, xp_earned, coins_earned)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, data.roomCode, data.gameMode, data.theme, data.score, data.correctAnswers, data.totalQuestions, data.rank, data.playersCount, data.xpEarned || 0, data.coinsEarned || 0);
  },
  
  getRecent: (userId, limit = 10) => {
    return db.prepare(`
      SELECT * FROM game_history WHERE user_id = ? ORDER BY played_at DESC LIMIT ?
    `).all(userId, limit);
  }
};

module.exports = { User, Friends, Questions, GameHistory, db };