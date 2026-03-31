export const runtime = 'nodejs';

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Only POST requests are allowed' });
    }

    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    if (
      !body.name ||
      !body.staff_student_id ||
      !body.role ||
      !body.plate_number
    ) {
      return res.status(400).json({
        error: 'Please fill in all required fields'
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { data, error } = await supabase
      .from('users')
      .insert([{
        name: body.name.trim(),
        staff_student_id: body.staff_student_id.trim(),
        role: body.role,
        phone: body.phone || null,
        address: body.address || null,
        college: body.college || null,
        campus_status: body.campus_status === true,
        driver_license: body.driver_license || null,
        plate_number: body.plate_number.trim(),
        make: body.make || null,
        color: body.color || null,
        created_at: new Date()
      }])
      .select();

    if (error) {
      // 🔥 Friendly error handling
      if (error.message.toLowerCase().includes('duplicate')) {
        return res.status(400).json({
          error: 'This ID or plate number is already registered'
        });
      }

      if (error.message.toLowerCase().includes('null value')) {
        return res.status(400).json({
          error: 'Some required data is missing'
        });
      }

      return res.status(500).json({
        error: 'Database error: ' + error.message
      });
    }

    return res.status(200).json({
      message: 'Registration successful',
      data
    });

  } catch (err) {
    return res.status(500).json({
      error: 'Server error: ' + err.message
    });
  }
}
