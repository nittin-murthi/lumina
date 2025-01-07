"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = connectToDatabase;
exports.connectToDatabase = connectToDatabase;
exports.disconnectFromDatabase = disconnectFromDatabase;
const mongoose_1 = require("mongoose");
async function connectToDatabase() {
    try {
        await (0, mongoose_1.connect)(process.env.MONGODB_URL);
        console.log("Connected to MongoDB");
    }
    catch (error) {
        console.log("Error connecting to MongoDB", error);
        throw new Error("Error connecting to MongoDB");
    }
}
async function disconnectFromDatabase() {
    try {
        await (0, mongoose_1.disconnect)();
        console.log("Disconnected from MongoDB");
    }
    catch (error) {
        console.log("Error disconnecting from MongoDB", error);
        throw new Error("Error disconnecting from MongoDB");
    }
}
//# sourceMappingURL=connection.js.map