
import { db } from '../lib/db';
import { createUser, findUserByUsername, updateUser } from '../lib/db-postgres';

async function main() {
  console.log('Sprawdzanie istnienia Robota Roberta...');
  const username = 'robot_robert';
  const email = 'robot@polutek.app';

  try {
    let user = await findUserByUsername(username);

    if (user) {
      console.log('Robot Robert już istnieje.');
      // isRobot column removed from DB, skipping flag check
    } else {
      console.log('Tworzenie Robota Roberta...');
      user = await createUser({
        username,
        email,
        password: 'secure_password_placeholder_robot',
        displayName: 'Robot Robert',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Robert',
        role: 'user',
      });

      // await updateUser(user.id, { isRobot: true }); // Removed as column is gone
      console.log('Utworzono Robota Roberta.');
    }
  } catch (error) {
    console.error('Błąd podczas seedowania robota:', error);
  }
}

main().catch(console.error);
