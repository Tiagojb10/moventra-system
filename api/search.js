import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
  // ✅ ONLY ALLOW GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  // ==========================
  // 🔐 VALIDATION
  // ==========================
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid ID' });
  }

  try {
    // ==========================
    // 🧼 CLEAN INPUT
    // ==========================
    const cleanId = id.trim();

    // ==========================
    // 🔍 QUERY DATABASE
    // ==========================
    const { data, error } = await supabase
      .from('users')
      .select('id, name, plate_number')
      .eq('staff_student_id', cleanId)
      .single();

    if (error || !data) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // ==========================
    // ✅ RESPONSE
    // ==========================
    return res.status(200).json(data);

  } catch (err) {
    console.error('SEARCH ERROR:', err);

   return res.status(500).json({
  error: err.message,
  details: err
   });
  }
}
