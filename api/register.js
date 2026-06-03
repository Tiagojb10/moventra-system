export const runtime = 'nodejs';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;
const MAX_VEHICLES = 5;

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Only POST requests are allowed' });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    // VALIDATION
    if (!body.password || body.password.length !== 8) {
      return res.status(400).json({ error: 'Password must be exactly 8 characters' });
    }

    if (!body.name || !body.staff_student_id || !body.role || !body.vehicles?.length) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const vehicles = body.vehicles;

    if (!Array.isArray(vehicles) || vehicles.length < 1) {
      return res.status(400).json({ error: 'At least one vehicle is required' });
    }

    if (vehicles.length > MAX_VEHICLES) {
      return res.status(400).json({ error: `Max ${MAX_VEHICLES} vehicles allowed` });
    }

    const platePattern = /^[A-Z]{3}-\d{4}$/;

    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];

      if (!platePattern.test(v.plate_number)) {
        return res.status(400).json({ error: `Vehicle ${i + 1}: invalid plate` });
      }

      if (!v.make?.trim()) {
        return res.status(400).json({ error: `Vehicle ${i + 1}: make required` });
      }

      if (!v.color?.trim()) {
        return res.status(400).json({ error: `Vehicle ${i + 1}: color required` });
      }
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const hashedPassword = await bcrypt.hash(body.password.trim(), SALT_ROUNDS);

    // 🔥 CREATE 1 ROW PER VEHICLE
    const inserts = vehicles.map(v => ({
      name: body.name.trim(),
      staff_student_id: body.staff_student_id.trim(),
      role: body.role,
      phone: body.phone || null,
      address: body.address || null,
      college: body.college || null,
      campus_status: body.campus_status === true,
      driver_license: body.driver_license || null,
      password_field: hashedPassword,

      vehicle_id: v.id,
      plate_number: v.plate_number,
      make: v.make,
      color: v.color,

      created_at: new Date()
    }));

    const { data, error } = await supabase
      .from('users')
      .insert(inserts)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      message: 'Registration successful',
      data
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
