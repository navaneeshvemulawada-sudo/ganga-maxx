const db = require('../config/db');
const crypto = require('crypto');

function base64urlEncode(str) {
  return Buffer.from(str).toString('base64url');
}

function generateToken(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = base64urlEncode(JSON.stringify(header));
  const payloadB64 = base64urlEncode(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;
  const signature = crypto.createHmac('sha256', secret).update(signingInput).digest('base64url');
  return `${headerB64}.${payloadB64}.${signature}`;
}

function verifyPassword(password, storedPassword) {
  const parts = storedPassword.split(':');
  if (parts.length !== 2) return false;
  const [salt, originalHash] = parts;
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

const authController = {
  async login(req, res) {
    try {
      const { username, password } = req.body;
      const usernameOrEmail = username;

      if (!usernameOrEmail || !password) {
        return res.status(400).json({ error: 'Missing credentials' });
      }

      // Query user from MySQL
      const [rows] = await db.query(
        'SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1',
        [usernameOrEmail, usernameOrEmail]
      );

      if (rows.length === 0) {
        return res.status(401).json({ error: 'Invalid username/email or password' });
      }

      const user = rows[0];

      // Verify password
      const isValid = verifyPassword(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid username/email or password' });
      }

      if (!user.is_approved) {
        return res.status(403).json({ error: 'Your account is pending administrator approval.' });
      }

      // Generate JWT token
      const secret = process.env.JWT_SECRET_KEY || 'dev_jwt_secret_key_change_me_in_production';
      const expires = 86400; // 24 hours
      const payload = {
        sub: user.id,
        username: user.username,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + expires
      };

      const token = generateToken(payload, secret);

      return res.status(200).json({
        message: 'Login successful',
        token: token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          is_approved: !!user.is_approved,
          created_at: user.created_at
        }
      });
    } catch (error) {
      console.error('[Auth Controller Error] login failed:', error);
      return res.status(500).json({ error: 'An internal server error occurred' });
    }
  },

  async register(req, res) {
    try {
      const { username, email, password, role } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if username or email already exists in MySQL
      const [existingUsers] = await db.query(
        'SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1',
        [username, email]
      );

      if (existingUsers.length > 0) {
        const existingUser = existingUsers[0];
        if (existingUser.username === username) {
          return res.status(400).json({ error: 'Username already exists' });
        }
        if (existingUser.email === email) {
          return res.status(400).json({ error: 'Email already exists' });
        }
      }

      // Hash password
      const hashedPassword = hashPassword(password);
      
      // Enforce approval gate (clients & distributors are auto-approved, staff roles require admin sign-off)
      const userRole = role || 'client';
      let isApproved = 1;
      if (['operations', 'supervisor', 'admin'].includes(userRole)) {
        isApproved = 0;
      }

      // Insert into MySQL users table
      const [result] = await db.query(
        'INSERT INTO users (username, email, password_hash, role, is_approved) VALUES (?, ?, ?, ?, ?)',
        [username, email, hashedPassword, userRole, isApproved]
      );

      const newUserId = result.insertId;

      return res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: newUserId,
          username: username,
          email: email,
          role: userRole,
          is_approved: !!isApproved
        }
      });
    } catch (error) {
      console.error('[Auth Controller Error] register failed:', error);
      return res.status(500).json({ error: 'An internal server error occurred' });
    }
  },

  async listUsers(req, res) {
    try {
      const [rows] = await db.query('SELECT id, username, email, role, is_approved, created_at FROM users');
      return res.status(200).json(rows);
    } catch (error) {
      console.error('[Auth Controller Error] listUsers failed:', error);
      return res.status(500).json({ error: 'An internal server error occurred' });
    }
  },

  async approveUser(req, res) {
    try {
      const { id } = req.params;
      await db.query('UPDATE users SET is_approved = 1 WHERE id = ?', [id]);
      return res.status(200).json({ message: 'User approved successfully' });
    } catch (error) {
      console.error('[Auth Controller Error] approveUser failed:', error);
      return res.status(500).json({ error: 'An internal server error occurred' });
    }
  }
};

module.exports = authController;
