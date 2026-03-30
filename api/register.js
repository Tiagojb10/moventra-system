import { createClient } from '@supabase/supabase-js';

// ==========================
// INIT SUPABASE (SECURE)
// ==========================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ==========================
// HANDLER
// ==========================
export default async function handler(req, res) {
  // ✅ ONLY ALLOW POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;

    // ==========================
    // 🔐 VALIDATION (IMPROVED)
    // ==========================
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

    // ==========================
    // 🧼 CLEAN DATA (PREVENT BAD INPUT)
    // ==========================
    const newUser = {
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
    };

    // ==========================
    // 🚀 INSERT INTO DB
    // ==========================
    const { data, error } = await supabase
      .from('users')
      .insert([newUser])
      .select();

    if (error) throw error;

    // ==========================
    // ✅ RESPONSE
    // ==========================
    return res.status(200).json(data);

  } catch (err) {
    console.error('REGISTER ERROR:', err);

    return res.status(500).json({
      error: 'Server error'
    });
  }
}