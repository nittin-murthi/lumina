import 'dotenv/config';
import { connectToDatabase, disconnectFromDatabase } from './connection';

(async () => {
  // 1) Log the environment variable
  console.log('MONGODB_URL (from env):', process.env.MONGODB_URL);

  try {
    await connectToDatabase();            
    console.log("✔ Connection test successful!");
  } catch (err) {
    console.error("✘ Connection test failed:", err);
  } finally {
    await disconnectFromDatabase();       
    console.log("✔ Disconnected from MongoDB");
  }
})();
