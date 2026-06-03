export const runtime = 'nodejs';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;
const MAX_VEHICLES = 5;
const MAX_DRIVERS = 2;

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Only POST requests are allowed' });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    // ── PASSWORD ──────────────────────────────────────────
    if (!body.password || body.password.length !== 8) {
      return res.status(400).json({ error: 'Password must be exactly 8 characters' });
    }

    // ── REQUIRED FIELDS ───────────────────────────────────
    if (!body.name || !body.staff_student_id || !body.role || !body.vehicles?.length) {
      return res.status(400).json({ error: 'Please fill in all required fields' });
    }

    // ── VEHICLES VALIDATION ───────────────────────────────
    const vehicles = body.vehicles;

    if (!Array.isArray(vehicles) || vehicles.length < 1) {
      return res.status(400).json({ error: 'At least one vehicle is required' });
    }

    if (vehicles.length > MAX_VEHICLES) {
      return res.status(400).json({ error: `Maximum ${MAX_VEHICLES} vehicles allowed` });
    }

    const platePattern = /^[A-Z]{3}-\d{4}$/;
    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];
      if (!v.id || typeof v.id !== 'string') {
        return res.status(400).json({ error: `Vehicle ${i + 1}: missing id` });
      }
      if (!platePattern.test(v.plate_number)) {
        return res.status(400).json({ error: `Vehicle ${i + 1}: plate must be in format ABC-1234` });
      }
      if (!v.make?.trim()) {
        return res.status(400).json({ error: `Vehicle ${i + 1}: make/model is required` });
      }
      if (!v.color?.trim()) {
        return res.status(400).json({ error: `Vehicle ${i + 1}: color is required` });
      }
    }

    // ── DUPLICATE PLATES within submission ────────────────
    const plateSet = new Set(vehicles.map(v => v.plate_number));
    if (plateSet.size !== vehicles.length) {
      return res.status(400).json({ error: 'Duplicate plate numbers in your submission' });
    }

    // ── DRIVERS VALIDATION ────────────────────────────────
    const additionalDrivers = body.additional_drivers || [];

    if (!Array.isArray(additionalDrivers) || additionalDrivers.length > MAX_DRIVERS) {
      return res.status(400).json({ error: `Maximum ${MAX_DRIVERS} additional drivers allowed` });
    }

    for (let i = 0; i < additionalDrivers.length; i++) {
      const d = additionalDrivers[i];
      if (!d.name?.trim() || !d.license?.trim()) {
        return res.status(400).json({ error: `Driver ${i + 1}: name and license are required` });
      }
    }

    // ── SUPABASE ───────────────────────────────────────────
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password.trim(), SALT_ROUNDS);

    // ── INSERT ─────────────────────────────────────────────
    // vehicles and additional_drivers are stored as JSONB columns
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
        password_field: hashedPassword,
        // ── NEW: store as JSONB ──────────────────────────
        vehicles: vehicles,                      // [{id, plate_number, make, color}]
        additional_drivers: additionalDrivers,   // [{name, license}]
        // ── Legacy: keep first vehicle's plate for backwards compatibility
        plate_number: vehicles[0].plate_number,
        make: vehicles[0].make,
        color: vehicles[0].color,
        // ────────────────────────────────────────────────
        created_at: new Date()
      }])
      .select();

    if (error) {
      if (error.message.toLowerCase().includes('duplicate')) {
        return res.status(400).json({ error: 'This ID or plate number is already registered' });
      }
      if (error.message.toLowerCase().includes('null value')) {
        return res.status(400).json({ error: 'Some required data is missing' });
      }
      return res.status(500).json({ error: 'Database error: ' + error.message });
    }

    return res.status(200).json({
      message: 'Registration successful',
      data
    });

  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
