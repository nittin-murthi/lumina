//models/User.ts

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    session_id: { type: String, default: null },
  }, { timestamps: true });
  
  export default mongoose.model("User", userSchema);
  