import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const body = await request.json();

    if (
      !body.name ||
      !body.staff_student_id ||
      !body.role ||
      !body.plate_number
    ) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

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

    const { data, error } = await supabase
      .from('users')
      .insert([newUser])
      .select();

    if (error) throw error;

    return Response.json(data);

  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
