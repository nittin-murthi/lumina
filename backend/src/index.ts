import { config } from "dotenv";
import app from "./app";
import { connectToDatabase } from "./db/connection";

// Load environment variables
config();

const PORT = process.env.PORT || 5001;

connectToDatabase()
    .then(() => {
        app.listen(PORT, () => console.log("Server and database is running on port " + PORT));
    })
    .catch((err) => console.log(err));
