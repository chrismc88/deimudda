// Quick script to fix user nickname in database
import mysql from 'mysql2/promise';
import 'dotenv/config';

async function fixNickname() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'deimudda',
  });

  try {
    // Get all users
    const [users] = await connection.execute('SELECT id, name, email, nickname FROM users');
    console.log('\n=== Aktuelle User ===');
    users.forEach(user => {
      console.log(`ID: ${user.id} | Name: ${user.name} | Email: ${user.email} | Nickname: ${user.nickname}`);
    });

    // Update nickname for user with ID 1 (assuming that's you)
    const newNickname = 'german cali';
    await connection.execute(
      'UPDATE users SET nickname = ? WHERE id = ?',
      [newNickname, 1]
    );

    console.log(`\n✅ Nickname für User ID 1 wurde auf "${newNickname}" gesetzt!`);

    // Verify
    const [updated] = await connection.execute('SELECT id, nickname FROM users WHERE id = 1');
    console.log('Verifiziert:', updated[0]);

  } catch (error) {
    console.error('Fehler:', error);
  } finally {
    await connection.end();
  }
}

fixNickname();
