"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const app_1 = __importDefault(require("./app"));
const connection_1 = require("./db/connection");
// Load environment variables
(0, dotenv_1.config)();
const PORT = process.env.PORT || 5001;
(0, connection_1.connectToDatabase)()
    .then(() => {
    app_1.default.listen(PORT, () => console.log("Server and database is running on port " + PORT));
})
    .catch((err) => console.log(err));
//# sourceMappingURL=index.js.map