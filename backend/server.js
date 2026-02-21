// server.js — Express REST API for Arcade
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { pool, initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
    origin: (origin, callback) => {
        // Allow all origins in dev, or specific ones if needed
        callback(null, true);
    },
    credentials: true,
}));

// Simple logger to see incoming requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// ─── Auth: Register ─────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
    const { username, password, nickname } = req.body;
    if (!username || !password || username.length < 3 || password.length < 3) {
        return res.status(400).json({ error: 'Минимум 3 символа' });
    }

    try {
        const exists = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
        if (exists.rows.length > 0) {
            return res.status(409).json({ error: 'Пользователь уже существует' });
        }

        const hash = await bcrypt.hash(password, 10);
        const displayName = nickname || username;

        const result = await pool.query(
            `INSERT INTO users (username, password_hash, nickname)
       VALUES ($1, $2, $3)
       RETURNING id, username, avatar, nickname, level, rank, xp,
                 next_level_xp, total_score, games_played, total_wins, play_time`,
            [username, hash, displayName]
        );

        const user = toUserData(result.rows[0]);
        res.status(201).json({ username, data: user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ─── Auth: Login ─────────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Введите логин и пароль' });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Неверное имя или пароль' });
        }

        const row = result.rows[0];
        const valid = await bcrypt.compare(password, row.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Неверное имя или пароль' });
        }

        res.json({ username, data: toUserData(row) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ─── Leaderboard ─────────────────────────────────────────────────────────────
app.get('/api/leaderboard', async (req, res) => {
    const { sort = 'score' } = req.query;
    const sortMap = {
        score: 'total_score',
        level: 'level',
        wins: 'total_wins',
    };
    const orderBy = sortMap[sort] || 'total_score';

    try {
        const result = await pool.query(
            `SELECT username, avatar, nickname, level, total_score, total_wins
       FROM users
       ORDER BY ${orderBy} DESC
       LIMIT 100`
        );

        const players = result.rows.map((row, i) => ({
            id: row.username,
            rank: i + 1,
            avatar: row.avatar,
            nickname: row.nickname,
            score: row.total_score,
            level: row.level,
            gamesWon: row.total_wins,
        }));

        res.json(players);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ─── Get User Data ───────────────────────────────────────────────────────────
app.get('/api/users/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        res.json({ username, data: toUserData(result.rows[0]) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ─── Update User Stats ────────────────────────────────────────────────────────
app.put('/api/users/:username', async (req, res) => {
    const { username } = req.params;
    const {
        avatar, nickname, level, rank, xp,
        next_level_xp, total_score, games_played, total_wins, play_time
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE users SET
        avatar = COALESCE($1, avatar),
        nickname = COALESCE($2, nickname),
        level = COALESCE($3, level),
        rank = COALESCE($4, rank),
        xp = COALESCE($5, xp),
        next_level_xp = COALESCE($6, next_level_xp),
        total_score = COALESCE($7, total_score),
        games_played = COALESCE($8, games_played),
        total_wins = COALESCE($9, total_wins),
        play_time = COALESCE($10, play_time)
       WHERE username = $11
       RETURNING id, username, avatar, nickname, level, rank, xp,
                 next_level_xp, total_score, games_played, total_wins, play_time`,
            [avatar, nickname, level, rank, xp, next_level_xp, total_score,
                games_played, total_wins, play_time, username]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json({ username, data: toUserData(result.rows[0]) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// ─── Helper ──────────────────────────────────────────────────────────────────
function toUserData(row) {
    return {
        avatar: row.avatar,
        nickname: row.nickname,
        level: row.level,
        rank: row.rank,
        xp: row.xp,
        nextLevelXp: row.next_level_xp,
        totalScore: row.total_score,
        gamesPlayed: row.games_played,
        totalWins: row.total_wins,
        playTime: row.play_time,
    };
}

// ─── Start ────────────────────────────────────────────────────────────────────
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize DB:', err);
    process.exit(1);
});
