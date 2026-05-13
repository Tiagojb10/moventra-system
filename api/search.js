export const runtime = 'nodejs';

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

// ==========================
// 🔒 RATE LIMITER
// Max 5 attempts per IP per 15 minutes
// ==========================
const attempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function isRateLimited(ip) {
  const now = Date.now();
  const record = attempts.get(ip);

  if (!record || now - record.windowStart > WINDOW_MS) {
    attempts.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (record.count >= MAX_ATTEMPTS) {
    return true;
  }

  record.count++;
  return false;
}

export default async function handler(req, res) {
  try {
    // ✅ ONLY POST ALLOWED NOW
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Only POST requests are allowed' });
    }

    // 🔒 RATE LIMIT CHECK
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    if (isRateLimited(ip)) {
      return res.status(429).json({
        error: 'Too many attempts. Please wait 15 minutes and try again.'
      });
    }

    // ✅ FIX: define body FIRST
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const { id, password } = body;

    // 🔐 PASSWORD LENGTH CHECK (moved here)
    if (password.length !== 8) {
      return res.status(400).json({
        error: 'Invalid password format'
      });
    }

    // ✅ VALIDATION
    if (!id || !id.trim() || !password) {
      return res.status(400).json({
        error: 'ID and password are required'
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // 🔐 Fetch user by ID only first, then compare password hash
    const { data, error } = await supabase
      .from('users')
      .select('id, name, plate_number, password_field')
      .eq('staff_student_id', id.trim())
      .limit(1);

    if (error) {
      return res.status(500).json({
        error: 'Database error: ' + error.message
      });
    }

    // ❌ USER NOT FOUND
    if (!data || data.length === 0) {
      return res.status(401).json({
        error: 'Invalid ID or password'
      });
    }

    // 🔐 COMPARE password against stored hash — never match plain text in DB
    const passwordMatch = await bcrypt.compare(password, data[0].password_field);

    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Invalid ID or password'
      });
    }

    // ✅ SUCCESS — strip password_field before sending response
    const { password_field, ...safeUser } = data[0];

    // ✅ SUCCESS
    return res.status(200).json({
      message: 'User authenticated',
      data: safeUser
    });

  } catch (err) {
    return res.status(500).json({
      error: 'Server error: ' + err.message
    });
  }
}
