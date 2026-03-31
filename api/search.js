export const runtime = 'nodejs';

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Only GET requests are allowed' });
    }

    const { id } = req.query;

    if (!id || !id.trim()) {
      return res.status(400).json({
        error: 'Please enter a valid ID'
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { data, error } = await supabase
      .from('users')
      .select('id, name, plate_number')
      .eq('staff_student_id', id.trim())
      .limit(1);

    if (error) {
      return res.status(500).json({
        error: 'Database error: ' + error.message
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        error: 'No user found with this ID'
      });
    }

    return res.status(200).json({
      message: 'User found',
      data: data[0]
    });

  } catch (err) {
    return res.status(500).json({
      error: 'Server error: ' + err.message
    });
  }
}
