import app from "./app.js";
import { connectToDatabase } from "./db/connection.js";
import { config } from "dotenv";
// Load environment variables
config();
const PORT = process.env.PORT;
connectToDatabase()
    .then(() => {
    app.listen(PORT, () => console.log("Server and database is running on port " + PORT));
})
    .catch((err) => console.log(err));
//# sourceMappingURL=index.js.map