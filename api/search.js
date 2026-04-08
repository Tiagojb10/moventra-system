export const runtime = 'nodejs';

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    // ✅ ONLY POST ALLOWED NOW
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Only POST requests are allowed' });
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

    // 🔐 MATCH ID + PASSWORD
    const { data, error } = await supabase
      .from('users')
      .select('id, name, plate_number')
      .eq('staff_student_id', id.trim())
      .eq('password_field', password)
      .limit(1);

    if (error) {
      return res.status(500).json({
        error: 'Database error: ' + error.message
      });
    }

    // ❌ INVALID LOGIN
    if (!data || data.length === 0) {
      return res.status(401).json({
        error: 'Invalid ID or password'
      });
    }

    // ✅ SUCCESS
    return res.status(200).json({
      message: 'User authenticated',
      data: data[0]
    });

  } catch (err) {
    return res.status(500).json({
      error: 'Server error: ' + err.message
    });
  }
}
