import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'Missing ID' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { data, error } = await supabase
      .from('users')
      .select('id, name, plate_number')
      .eq('staff_student_id', id.trim())
      .single();

    if (error || !data) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json(data);

  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
