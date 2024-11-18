import mysql from "mysql2/promise";

export async function POST(req) {
  const { pillName, dose, typeName, unit } = await req.json();

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  await connection.beginTransaction();

  try {
    // Check if typeName is valid
    const [typeExists] = await connection.execute(
      'SELECT type_id FROM pill_type WHERE type_id = ?',
      [typeName]  // Assuming typeName is actually type_id
    );

    if (typeExists.length === 0) {
      return new Response(
        JSON.stringify({ error: `Invalid type id: ${typeName}` }),
        { status: 400 }
      );
    }

    // Check if unit exists in unit table
    const [unitExists] = await connection.execute(
      'SELECT unit_id FROM unit WHERE unit_type = ?',
      [unit]
    );

    if (unitExists.length === 0) {
      return new Response(
        JSON.stringify({ error: `Invalid unit type: ${unit}` }),
        { status: 400 }
      );
    }

    const typeId = typeExists[0].type_id;
    const unitId = unitExists[0].unit_id;

    // Check if the pill already exists with the same pillName, dose, typeId, and unitId
    const [existingPill] = await connection.execute(
      'SELECT pill_id FROM pill WHERE pill_name = ? AND dose = ? AND type_id = ? AND unit_id = ?',
      [pillName, dose, typeId, unitId]
    );

    let pillId;

    if (existingPill.length > 0) {
      // Pill already exists, update its status to 1
      pillId = existingPill[0].pill_id;
      await connection.execute(
        'UPDATE pill SET status = 1 WHERE pill_id = ?',
        [pillId]
      );
    } else {
      // Pill does not exist, insert a new record
      const [pillResult] = await connection.execute(
        'INSERT INTO pill (pill_name, dose, type_id, unit_id, status) VALUES (?, ?, ?, ?, 1)',
        [pillName, dose, typeId, unitId]
      );
      pillId = pillResult.insertId;
    }

    await connection.commit();
    return new Response(
      JSON.stringify({ message: 'Pill added or updated successfully', pillId }),
      { status: 200 }
    );
  } catch (err) {
    await connection.rollback();
    console.error("Error saving data:", err); // Log the error details
    return new Response(
      JSON.stringify({ error: 'Failed to add or update pill' }),
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}