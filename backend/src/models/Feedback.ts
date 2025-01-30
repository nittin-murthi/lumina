import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    // Reference the user providing feedback
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Session ID from the user's current session
    session_id: {
      type: String,
      required: true,
    },

    // The runId you capture from LangSmith or your RAG process
    runId: {
      type: String,
      default: null,
    },

    // Numeric rating score
    score: {
      type: Number,
      default: 0,
    },

    // Any text-based comment from the user
    comment: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
