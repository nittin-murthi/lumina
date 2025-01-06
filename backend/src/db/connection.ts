import {connect, disconnect} from "mongoose";

export default async function connectToDatabase() {
    try {
        await connect(process.env.MONGODB_URL);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log("Error connecting to MongoDB", error);
        throw new Error("Error connecting to MongoDB");
    }
}

async function disconnectFromDatabase() {
    try {
        await disconnect();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.log("Error disconnecting from MongoDB", error);
        throw new Error("Error disconnecting from MongoDB");
    }
}

export { connectToDatabase, disconnectFromDatabase };