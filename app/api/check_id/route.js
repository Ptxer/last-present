import mysql from "mysql2/promise";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const patient_id = searchParams.get("patient_id"); // แก้ไขให้ตรงกับพารามิเตอร์

  if (!patient_id) {
    return new Response(
      JSON.stringify({ error: "Student ID is required" }),
      { status: 400 }
    );
  }

  try {
    // เชื่อมต่อกับฐานข้อมูล
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    // ดึงข้อมูลจากตาราง patient
    const query = `
      SELECT patient_id, patient_name, patienttype_name
      FROM patient  
      JOIN patient_type  on patient.patienttype_id = patient_type.patienttype_id
      WHERE patient_id = ?
    `;
    const [rows] = await connection.execute(query, [patient_id]);
    await connection.end();

    // ตรวจสอบว่าพบรหัสนักศึกษาหรือไม่
    if (rows.length === 0) {
      return new Response(JSON.stringify({ exists: false }), { status: 200 });
    }

    // ดึงข้อมูลจากผลลัพธ์
    const { patient_id: id, patient_name, patienttype_name } = rows[0];
    return new Response(
      JSON.stringify({
        exists: true,
        student_id: id,
        patient_name,
        role: patienttype_name, // ส่งข้อมูลสถานะ role
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error checking student ID:", err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch data" }),
      { status: 500 }
    );
  }
}
