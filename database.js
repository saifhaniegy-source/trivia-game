const { Pool } = require('pg');
const { randomUUID } = require('crypto');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  family: 4
});

let dbInitialized = false;
let initPromise = null;

async function initDatabase() {
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    console.log('Initializing database...');
    const client = await pool.connect();
    try {
      await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        daily_reward_claimed DATE
      );

      CREATE TABLE IF NOT EXISTS avatars (
        id SERIAL PRIMARY KEY,
        emoji TEXT UNIQUE NOT NULL,
        name TEXT,
        rarity TEXT DEFAULT 'common',
        unlock_level INTEGER DEFAULT 1,
        unlock_cost INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS user_avatars (
        user_id TEXT,
        avatar_id INTEGER,
        equipped BOOLEAN DEFAULT false,
        PRIMARY KEY (user_id, avatar_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (avatar_id) REFERENCES avatars(id)
      );

      CREATE TABLE IF NOT EXISTS colors (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE,
        gradient TEXT NOT NULL,
        rarity TEXT DEFAULT 'common',
        unlock_level INTEGER DEFAULT 1,
        unlock_cost INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS user_colors (
        user_id TEXT,
        color_id INTEGER,
        equipped BOOLEAN DEFAULT false,
        PRIMARY KEY (user_id, color_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (color_id) REFERENCES colors(id)
      );

      CREATE TABLE IF NOT EXISTS achievements (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        icon TEXT,
        xp_reward INTEGER DEFAULT 0,
        condition_type TEXT,
        condition_value INTEGER
      );

      CREATE TABLE IF NOT EXISTS user_achievements (
        user_id TEXT,
        achievement_id INTEGER,
        unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, achievement_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (achievement_id) REFERENCES achievements(id)
      );

      CREATE TABLE IF NOT EXISTS friends (
        user_id TEXT,
        friend_id TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, friend_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS custom_questions (
        id SERIAL PRIMARY KEY,
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
        approved BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS game_history (
        id SERIAL PRIMARY KEY,
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
        played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Clean up duplicates - first redirect user references to oldest, then delete
    await client.query(`
      UPDATE user_avatars ua SET avatar_id = sub.min_id 
      FROM (SELECT emoji, MIN(id) as min_id FROM avatars GROUP BY emoji HAVING COUNT(*) > 1) sub
      JOIN avatars a ON a.emoji = sub.emoji AND a.id != sub.min_id
      WHERE ua.avatar_id = a.id
    `);
    await client.query(`DELETE FROM avatars a USING avatars b WHERE a.id > b.id AND a.emoji = b.emoji`);
    
    await client.query(`
      UPDATE user_colors uc SET color_id = sub.min_id 
      FROM (SELECT gradient, MIN(id) as min_id FROM colors GROUP BY gradient HAVING COUNT(*) > 1) sub
      JOIN colors c ON c.gradient = sub.gradient AND c.id != sub.min_id
      WHERE uc.color_id = c.id
    `);
    await client.query(`DELETE FROM colors a USING colors b WHERE a.id > b.id AND a.gradient = b.gradient`);
    
    await client.query(`DELETE FROM achievements a USING achievements b WHERE a.id > b.id AND a.name = b.name`);
    
    // Add unique constraints if not exist
    await client.query(`ALTER TABLE avatars ADD CONSTRAINT IF NOT EXISTS avatars_emoji_key UNIQUE (emoji)`);
    await client.query(`ALTER TABLE colors ADD CONSTRAINT IF NOT EXISTS colors_name_key UNIQUE (name)`);
    await client.query(`ALTER TABLE achievements ADD CONSTRAINT IF NOT EXISTS achievements_name_key UNIQUE (name)`);

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

    for (const a of defaultAvatars) {
      await client.query(
        'INSERT INTO avatars (emoji, name, rarity, unlock_level, unlock_cost) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
        [a.emoji, a.name, a.rarity, a.unlock_level, a.unlock_cost]
      );
    }

    for (const c of defaultColors) {
      await client.query(
        'INSERT INTO colors (name, gradient, rarity, unlock_level, unlock_cost) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
        [c.name, c.gradient, c.rarity, c.unlock_level, c.unlock_cost]
      );
    }

    for (const a of defaultAchievements) {
      await client.query(
        'INSERT INTO achievements (name, description, icon, xp_reward, condition_type, condition_value) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
        [a.name, a.description, a.icon, a.xp_reward, a.condition_type, a.condition_value]
      );
    }

    console.log('Database initialized successfully');
      dbInitialized = true;
    } finally {
      client.release();
    }
  })();
  
  return initPromise;
}

initDatabase().catch(err => {
  console.error('Database initialization failed:', err.message);
});

async function ensureDb() {
  if (!dbInitialized) {
    await initDatabase();
  }
}

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
  create: async (username, password) => {
    await ensureDb();
    const id = randomUUID();
    await pool.query('INSERT INTO users (id, username, password) VALUES ($1, $2, $3)', [id, username.toLowerCase(), password]);
    
    const commonAvatarsResult = await pool.query('SELECT id FROM avatars WHERE rarity = $1', ['common']);
    const commonColorsResult = await pool.query('SELECT id FROM colors WHERE rarity = $1', ['common']);
    
    const commonAvatars = commonAvatarsResult.rows;
    const commonColors = commonColorsResult.rows;
    
    for (let i = 0; i < commonAvatars.length; i++) {
      await pool.query('INSERT INTO user_avatars (user_id, avatar_id, equipped) VALUES ($1, $2, $3)', [id, commonAvatars[i].id, i === 0]);
    }
    
    for (let i = 0; i < commonColors.length; i++) {
      await pool.query('INSERT INTO user_colors (user_id, color_id, equipped) VALUES ($1, $2, $3)', [id, commonColors[i].id, i === 0]);
    }
    
    return User.getById(id);
  },
  
  getById: async (id) => {
    await ensureDb();
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (!result.rows[0]) return null;
    return User.addCalculatedFields(result.rows[0]);
  },
  
  getByUsername: async (username) => {
    await ensureDb();
    const result = await pool.query('SELECT * FROM users WHERE username ILIKE $1', [username]);
    if (!result.rows[0]) return null;
    return User.addCalculatedFields(result.rows[0]);
  },
  
  addCalculatedFields: async (user) => {
    if (!user) return null;
    
    user.level = calculateLevel(user.xp);
    const xpInfo = xpToNextLevel(user.xp);
    user.xpProgress = xpInfo.xpProgress;
    user.xpNeeded = xpInfo.xpNeeded;
    user.xpPercentage = xpInfo.progress;
    user.winRate = user.total_games > 0 ? Math.round((user.total_wins / user.total_games) * 100) : 0;
    user.accuracy = user.total_questions > 0 ? Math.round((user.total_correct / user.total_questions) * 100) : 0;
    
    const equippedAvatarResult = await pool.query(`
      SELECT a.* FROM avatars a
      JOIN user_avatars ua ON a.id = ua.avatar_id
      WHERE ua.user_id = $1 AND ua.equipped = true
    `, [user.id]);
    user.equippedAvatar = equippedAvatarResult.rows[0]?.emoji || '🦊';
    
    const equippedColorResult = await pool.query(`
      SELECT c.* FROM colors c
      JOIN user_colors uc ON c.id = uc.color_id
      WHERE uc.user_id = $1 AND uc.equipped = true
    `, [user.id]);
    user.equippedColor = equippedColorResult.rows[0]?.gradient || 'linear-gradient(135deg, #00d4ff, #0099cc)';
    
    return user;
  },
  
  validatePassword: async (username, password) => {
    await ensureDb();
    const result = await pool.query('SELECT * FROM users WHERE username ILIKE $1', [username]);
    if (!result.rows[0]) return null;
    if (result.rows[0].password !== password) return null;
    return User.addCalculatedFields(result.rows[0]);
  },
  
  addXp: async (id, amount) => {
    await ensureDb();
    const userResult = await pool.query('SELECT xp FROM users WHERE id = $1', [id]);
    if (!userResult.rows[0]) return null;
    
    const oldLevel = calculateLevel(userResult.rows[0].xp);
    const newLevel = calculateLevel(userResult.rows[0].xp + amount);
    const leveledUp = newLevel > oldLevel;
    
    await pool.query('UPDATE users SET xp = xp + $1 WHERE id = $2', [amount, id]);
    
    if (leveledUp) {
      await User.checkUnlocks(id, newLevel);
    }
    
    const updatedUser = await User.getById(id);
    return { 
      leveledUp, 
      newLevel, 
      xpGained: amount,
      user: updatedUser
    };
  },
  
  addCoins: async (id, amount) => {
    await ensureDb();
    await pool.query('UPDATE users SET coins = coins + $1 WHERE id = $2', [amount, id]);
  },
  
  checkUnlocks: async (id, level) => {
    await ensureDb();
    const newAvatarsResult = await pool.query(`
      SELECT id FROM avatars 
      WHERE unlock_level <= $1 
      AND id NOT IN (SELECT avatar_id FROM user_avatars WHERE user_id = $2)
    `, [level, id]);
    
    const newColorsResult = await pool.query(`
      SELECT id FROM colors 
      WHERE unlock_level <= $1 
      AND id NOT IN (SELECT color_id FROM user_colors WHERE user_id = $2)
    `, [level, id]);
    
    for (const a of newAvatarsResult.rows) {
      await pool.query('INSERT INTO user_avatars (user_id, avatar_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, a.id]);
    }
    
    for (const c of newColorsResult.rows) {
      await pool.query('INSERT INTO user_colors (user_id, color_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, c.id]);
    }
    
    return { avatars: newAvatarsResult.rows.length, colors: newColorsResult.rows.length };
  },
  
  updateStats: async (id, stats) => {
    await ensureDb();
    const setClauses = [];
    const values = [];
    let paramIndex = 1;
    
    if (stats.gamesPlayed !== undefined) {
      setClauses.push(`total_games = total_games + $${paramIndex++}`);
      values.push(stats.gamesPlayed);
    }
    if (stats.gamesWon !== undefined) {
      setClauses.push(`total_wins = total_wins + $${paramIndex++}`);
      values.push(stats.gamesWon);
    }
    if (stats.correctAnswers !== undefined) {
      setClauses.push(`total_correct = total_correct + $${paramIndex++}`);
      values.push(stats.correctAnswers);
    }
    if (stats.questionsAnswered !== undefined) {
      setClauses.push(`total_questions = total_questions + $${paramIndex++}`);
      values.push(stats.questionsAnswered);
    }
    if (stats.bestStreak !== undefined) {
      setClauses.push(`best_streak = GREATEST(best_streak, $${paramIndex++})`);
      values.push(stats.bestStreak);
    }
    
    if (setClauses.length > 0) {
      values.push(id);
      await pool.query(`UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIndex}`, values);
    }
  },
  
  claimDailyReward: async (id) => {
    await ensureDb();
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (!userResult.rows[0]) return null;
    
    const user = userResult.rows[0];
    const today = new Date().toISOString().split('T')[0];
    
    if (user.daily_reward_claimed && user.daily_reward_claimed.toISOString) {
      const claimedDate = user.daily_reward_claimed.toISOString().split('T')[0];
      if (claimedDate === today) {
        return { claimed: false, message: 'Already claimed today' };
      }
    } else if (user.daily_reward_claimed === today) {
      return { claimed: false, message: 'Already claimed today' };
    }
    
    const level = calculateLevel(user.xp);
    const xpReward = 50 + (level * 10);
    const coinReward = 10 + (level * 5);
    
    await pool.query(
      'UPDATE users SET daily_reward_claimed = $1, xp = xp + $2, coins = coins + $3, last_login = CURRENT_TIMESTAMP WHERE id = $4',
      [today, xpReward, coinReward, id]
    );
    
    return { claimed: true, xpReward, coinReward };
  },
  
  getLeaderboard: async (type = 'xp', limit = 100) => {
    await ensureDb();
    const orderBy = {
      xp: 'xp DESC',
      wins: 'total_wins DESC',
      streak: 'best_streak DESC'
    }[type] || 'xp DESC';
    
    const result = await pool.query(`
      SELECT id, username, xp, level, total_games, total_wins, total_correct, total_questions, best_streak,
             CASE WHEN total_questions > 0 THEN ROUND(total_correct * 100.0 / total_questions, 1) ELSE 0 END as accuracy
      FROM users
      ORDER BY ${orderBy}
      LIMIT $1
    `, [limit]);
    
    return result.rows;
  },
  
  equipAvatar: async (userId, avatarId) => {
    await ensureDb();
    const ownedResult = await pool.query('SELECT * FROM user_avatars WHERE user_id = $1 AND avatar_id = $2', [userId, avatarId]);
    if (!ownedResult.rows[0]) return false;
    
    await pool.query('UPDATE user_avatars SET equipped = false WHERE user_id = $1', [userId]);
    await pool.query('UPDATE user_avatars SET equipped = true WHERE user_id = $1 AND avatar_id = $2', [userId, avatarId]);
    return true;
  },
  
  equipColor: async (userId, colorId) => {
    await ensureDb();
    const ownedResult = await pool.query('SELECT * FROM user_colors WHERE user_id = $1 AND color_id = $2', [userId, colorId]);
    if (!ownedResult.rows[0]) return false;
    
    await pool.query('UPDATE user_colors SET equipped = false WHERE user_id = $1', [userId]);
    await pool.query('UPDATE user_colors SET equipped = true WHERE user_id = $1 AND color_id = $2', [userId, colorId]);
    return true;
  },
  
  buyAvatar: async (userId, avatarId) => {
    await ensureDb();
    const avatarResult = await pool.query('SELECT * FROM avatars WHERE id = $1', [avatarId]);
    const userResult = await pool.query('SELECT coins FROM users WHERE id = $1', [userId]);
    
    if (!avatarResult.rows[0] || !userResult.rows[0]) return { success: false, message: 'Invalid avatar or user' };
    
    const avatar = avatarResult.rows[0];
    const user = userResult.rows[0];
    
    if (user.coins < avatar.unlock_cost) return { success: false, message: 'Not enough coins' };
    
    const ownedResult = await pool.query('SELECT * FROM user_avatars WHERE user_id = $1 AND avatar_id = $2', [userId, avatarId]);
    if (ownedResult.rows[0]) return { success: false, message: 'Already owned' };
    
    await pool.query('UPDATE users SET coins = coins - $1 WHERE id = $2', [avatar.unlock_cost, userId]);
    await pool.query('INSERT INTO user_avatars (user_id, avatar_id) VALUES ($1, $2)', [userId, avatarId]);
    
    return { success: true };
  },
  
  buyColor: async (userId, colorId) => {
    await ensureDb();
    const colorResult = await pool.query('SELECT * FROM colors WHERE id = $1', [colorId]);
    const userResult = await pool.query('SELECT coins FROM users WHERE id = $1', [userId]);
    
    if (!colorResult.rows[0] || !userResult.rows[0]) return { success: false, message: 'Invalid color or user' };
    
    const color = colorResult.rows[0];
    const user = userResult.rows[0];
    
    if (user.coins < color.unlock_cost) return { success: false, message: 'Not enough coins' };
    
    const ownedResult = await pool.query('SELECT * FROM user_colors WHERE user_id = $1 AND color_id = $2', [userId, colorId]);
    if (ownedResult.rows[0]) return { success: false, message: 'Already owned' };
    
    await pool.query('UPDATE users SET coins = coins - $1 WHERE id = $2', [color.unlock_cost, userId]);
    await pool.query('INSERT INTO user_colors (user_id, color_id) VALUES ($1, $2)', [userId, colorId]);
    
    return { success: true };
  },
  
  getInventory: async (userId) => {
    await ensureDb();
    const avatarsResult = await pool.query(`
      SELECT a.*, ua.equipped, true as owned FROM avatars a
      JOIN user_avatars ua ON a.id = ua.avatar_id
      WHERE ua.user_id = $1
      UNION
      SELECT a.*, false as equipped, false as owned FROM avatars a
      WHERE a.id NOT IN (SELECT avatar_id FROM user_avatars WHERE user_id = $1)
      ORDER BY rarity, unlock_level
    `, [userId]);
    
    const colorsResult = await pool.query(`
      SELECT c.*, uc.equipped, true as owned FROM colors c
      JOIN user_colors uc ON c.id = uc.color_id
      WHERE uc.user_id = $1
      UNION
      SELECT c.*, false as equipped, false as owned FROM colors c
      WHERE c.id NOT IN (SELECT color_id FROM user_colors WHERE user_id = $1)
      ORDER BY rarity, unlock_level
    `, [userId]);
    
    return { avatars: avatarsResult.rows, colors: colorsResult.rows };
  },
  
  getAchievements: async (userId) => {
    await ensureDb();
    const result = await pool.query(`
      SELECT a.*, ua.unlocked_at IS NOT NULL as unlocked, ua.unlocked_at
      FROM achievements a
      LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
      ORDER BY a.id
    `, [userId]);
    
    return result.rows;
  },
  
  unlockAchievement: async (userId, achievementId) => {
    await ensureDb();
    const achievementResult = await pool.query('SELECT * FROM achievements WHERE id = $1', [achievementId]);
    if (!achievementResult.rows[0]) return null;
    
    const achievement = achievementResult.rows[0];
    
    const existingResult = await pool.query('SELECT * FROM user_achievements WHERE user_id = $1 AND achievement_id = $2', [userId, achievementId]);
    if (existingResult.rows[0]) return null;
    
    await pool.query('INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2)', [userId, achievementId]);
    await User.addXp(userId, achievement.xp_reward);
    
    return achievement;
  },
  
  checkAchievements: async (userId, stats) => {
    await ensureDb();
    const unlocked = [];
    
    if (stats.gamesPlayed) {
      const result = await pool.query(`
        SELECT a.* FROM achievements a
        LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
        WHERE a.condition_type = 'games_played' AND a.condition_value <= $2 AND ua.user_id IS NULL
      `, [userId, stats.gamesPlayed]);
      
      for (const a of result.rows) {
        await User.unlockAchievement(userId, a.id);
        unlocked.push(a);
      }
    }
    
    if (stats.gamesWon) {
      const result = await pool.query(`
        SELECT a.* FROM achievements a
        LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
        WHERE a.condition_type = 'games_won' AND a.condition_value <= $2 AND ua.user_id IS NULL
      `, [userId, stats.gamesWon]);
      
      for (const a of result.rows) {
        await User.unlockAchievement(userId, a.id);
        unlocked.push(a);
      }
    }
    
    if (stats.streak) {
      const result = await pool.query(`
        SELECT a.* FROM achievements a
        LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
        WHERE a.condition_type = 'streak' AND a.condition_value <= $2 AND ua.user_id IS NULL
      `, [userId, stats.streak]);
      
      for (const a of result.rows) {
        await User.unlockAchievement(userId, a.id);
        unlocked.push(a);
      }
    }
    
    return unlocked;
  }
};

const Friends = {
  add: async (userId, friendId) => {
    await ensureDb();
    if (userId === friendId) return { success: false, message: 'Cannot add yourself' };
    
    const existingResult = await pool.query('SELECT * FROM friends WHERE user_id = $1 AND friend_id = $2', [userId, friendId]);
    if (existingResult.rows[0]) return { success: false, message: 'Already friends or pending' };
    
    await pool.query('INSERT INTO friends (user_id, friend_id, status) VALUES ($1, $2, $3)', [userId, friendId, 'pending']);
    await pool.query('INSERT INTO friends (user_id, friend_id, status) VALUES ($1, $2, $3)', [friendId, userId, 'pending']);
    
    return { success: true };
  },
  
  accept: async (userId, friendId) => {
    await ensureDb();
    await pool.query('UPDATE friends SET status = $1 WHERE user_id = $2 AND friend_id = $3', ['accepted', userId, friendId]);
    await pool.query('UPDATE friends SET status = $1 WHERE user_id = $2 AND friend_id = $3', ['accepted', friendId, userId]);
  },
  
  remove: async (userId, friendId) => {
    await ensureDb();
    await pool.query('DELETE FROM friends WHERE user_id = $1 AND friend_id = $2', [userId, friendId]);
    await pool.query('DELETE FROM friends WHERE user_id = $1 AND friend_id = $2', [friendId, userId]);
  },
  
  getFriends: async (userId) => {
    await ensureDb();
    const result = await pool.query(`
      SELECT u.id, u.username, u.xp, u.level, f.status
      FROM users u
      JOIN friends f ON u.id = f.friend_id
      WHERE f.user_id = $1 AND f.status = 'accepted'
    `, [userId]);
    
    return result.rows;
  },
  
  getPending: async (userId) => {
    await ensureDb();
    const result = await pool.query(`
      SELECT u.id, u.username, u.xp, u.level
      FROM users u
      JOIN friends f ON u.id = f.friend_id
      WHERE f.user_id = $1 AND f.status = 'pending' AND f.friend_id != $1
    `, [userId]);
    
    return result.rows;
  }
};

const Questions = {
  submit: async (userId, question, options, correctAnswer, theme, difficulty) => {
    await ensureDb();
    const result = await pool.query(`
      INSERT INTO custom_questions (user_id, question, option_a, option_b, option_c, option_d, correct_answer, theme, difficulty)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [userId, question, options[0], options[1], options[2], options[3], correctAnswer, theme, difficulty]);
    
    return result.rows[0]?.id;
  },
  
  vote: async (questionId, upvote) => {
    await ensureDb();
    if (upvote) {
      await pool.query('UPDATE custom_questions SET votes_up = votes_up + 1 WHERE id = $1', [questionId]);
    } else {
      await pool.query('UPDATE custom_questions SET votes_down = votes_down + 1 WHERE id = $1', [questionId]);
    }
    
    const qResult = await pool.query('SELECT votes_up, votes_down FROM custom_questions WHERE id = $1', [questionId]);
    const q = qResult.rows[0];
    
    if (q && q.votes_up - q.votes_down >= 5 && q.votes_up >= 10) {
      await pool.query('UPDATE custom_questions SET approved = true WHERE id = $1', [questionId]);
    }
  },
  
  getApproved: async (theme = null) => {
    await ensureDb();
    if (theme) {
      const result = await pool.query('SELECT * FROM custom_questions WHERE approved = true AND theme = $1', [theme]);
      return result.rows;
    }
    const result = await pool.query('SELECT * FROM custom_questions WHERE approved = true');
    return result.rows;
  },
  
  getPending: async () => {
    await ensureDb();
    const result = await pool.query('SELECT * FROM custom_questions WHERE approved = false ORDER BY created_at DESC LIMIT 50');
    return result.rows;
  }
};

const GameHistory = {
  record: async (userId, data) => {
    await ensureDb();
    await pool.query(`
      INSERT INTO game_history (user_id, room_code, game_mode, theme, score, correct_answers, total_questions, rank, players_count, xp_earned, coins_earned)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [userId, data.roomCode, data.gameMode, data.theme, data.score, data.correctAnswers, data.totalQuestions, data.rank, data.playersCount, data.xpEarned || 0, data.coinsEarned || 0]);
  },
  
  getRecent: async (userId, limit = 10) => {
    await ensureDb();
    const result = await pool.query(`
      SELECT * FROM game_history WHERE user_id = $1 ORDER BY played_at DESC LIMIT $2
    `, [userId, limit]);
    
    return result.rows;
  }
};

module.exports = { User, Friends, Questions, GameHistory, pool };
