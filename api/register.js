export const runtime = 'nodejs';

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
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
        error: 'Missing required fields'
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { data, error } = await supabase
      .from('users')
      .insert([{
        name: body.name,
        staff_student_id: body.staff_student_id,
        role: body.role,
        phone: body.phone,
        address: body.address,
        college: body.college,
        campus_status: body.campus_status,
        driver_license: body.driver_license,
        plate_number: body.plate_number,
        make: body.make,
        color: body.color,
        created_at: new Date()
      }])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
