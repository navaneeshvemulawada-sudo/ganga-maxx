const db = require('../config/database');
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
  /**
   * Handles user login using email and password.
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Missing credentials' });
      }

      // Query user from PostgreSQL by email only (no username column exists)
      const { rows } = await db.query(
        'SELECT * FROM users WHERE email = $1 LIMIT 1',
        [email.trim()]
      );

      if (rows.length === 0) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }

      const user = rows[0];

      // Verify password
      const isValid = verifyPassword(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }

      // Check approval status for staff roles
      if (!user.is_approved) {
        return res.status(403).json({ success: false, error: 'Your account is pending administrator approval.' });
      }

      // Generate JWT token
      const secret = process.env.JWT_SECRET_KEY || 'dev_jwt_secret_key_change_me_in_production';
      const expires = 86400; // 24 hours
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + expires
      };

      const token = generateToken(payload, secret);

      return res.status(200).json({
        success: true,
        token: token,
        user: {
          id: parseInt(user.id, 10),
          full_name: user.full_name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('[Auth Controller Error] login failed:', error);
      return res.status(500).json({ success: false, error: 'An internal server error occurred' });
    }
  },

  /**
   * Handles registering a new user with full_name, email, password, and role.
   */
  async register(req, res) {
    try {
      const { full_name, email, password, role } = req.body;

      if (!full_name || !email || !password) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      // Check if email already exists in PostgreSQL
      const { rows: existingUsers } = await db.query(
        'SELECT * FROM users WHERE email = $1 LIMIT 1',
        [email.trim()]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ success: false, error: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = hashPassword(password);
      
      // Enforce approval gate (clients & distributors are auto-approved, staff roles require admin sign-off)
      const userRole = role || 'client';
      const isApproved = !['operations', 'supervisor', 'admin'].includes(userRole.toLowerCase());

      // Insert into PostgreSQL users table and return the generated serial ID
      await db.query(
        'INSERT INTO users (full_name, email, password_hash, role, is_approved) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [full_name.trim(), email.trim(), hashedPassword, userRole, isApproved]
      );

      return res.status(201).json({
        success: true,
        message: 'User registered successfully'
      });
    } catch (error) {
      console.error('[Auth Controller Error] register failed:', error);
      return res.status(500).json({ success: false, error: 'An internal server error occurred' });
    }
  },

  /**
   * Returns a list of all registered users.
   */
  async listUsers(req, res) {
    try {
      const { rows } = await db.query('SELECT id, full_name, email, role, is_approved, created_at FROM users ORDER BY id ASC');
      return res.status(200).json(rows);
    } catch (error) {
      console.error('[Auth Controller Error] listUsers failed:', error);
      return res.status(500).json({ success: false, error: 'An internal server error occurred' });
    }
  },

  /**
   * Approves a pending staff user account.
   */
  async approveUser(req, res) {
    try {
      const { id } = req.params;
      await db.query('UPDATE users SET is_approved = true WHERE id = $1', [id]);
      return res.status(200).json({ success: true, message: 'User approved successfully' });
    } catch (error) {
      console.error('[Auth Controller Error] approveUser failed:', error);
      return res.status(500).json({ success: false, error: 'An internal server error occurred' });
    }
  }
};

module.exports = authController;
