import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(req) {
  const { pillName, dose, typeName, expireDate, total, unit } = await req.json();

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  await connection.beginTransaction();

  try {
    // Fetch type_id from pill_type table
    const [typeResult] = await connection.execute(
      'SELECT type_id FROM pill_type WHERE type_name = ?',
      [typeName]
    );
    if (typeResult.length === 0) {
      throw new Error(`Invalid type name: ${typeName}`);
    }
    const typeId = typeResult[0].type_id;

    // Fetch unit_id from unit table
    const [unitResult] = await connection.execute(
      'SELECT unit_id FROM unit WHERE unit_type = ?',
      [unit]
    );
    if (unitResult.length === 0) {
      throw new Error(`Invalid unit type: ${unit}`);
    }
    const unitId = unitResult[0].unit_id;

    // Check if the pill already exists
    const [existingPill] = await connection.execute(
      'SELECT pill_id FROM pill WHERE pill_name = ?',
      [pillName]
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
        'INSERT INTO pill (pill_name, dose, type_id, unit_id) VALUES (?, ?, ?, ?)',
        [pillName, dose, typeId, unitId]
      );
      pillId = pillResult.insertId;
    }

    // Insert into pillstock table
    await connection.execute(
      'INSERT INTO pillstock (pill_id, expire, total) VALUES (?, ?, ?)',
      [pillId, expireDate, total]
    );

    await connection.commit();
    return NextResponse.json({ message: 'Data saved successfully' }, { status: 200 });
  } catch (err) {
    await connection.rollback();
    console.error("Error saving data:", err); // Log the error details
    return NextResponse.json({ error: 'Failed to save data', details: err.message }, { status: 500 });
  } finally {
    await connection.end();
  }
}