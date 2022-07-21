const mongoose = require("mongoose");
const { Schema } = mongoose;
const chatSchema = new Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "conversation",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    message: {
      type: String,
      required: "true",
    },
  },
  {
    timestamps: true,
  }
);
const chat = mongoose.model("chat", chatSchema);
module.exports = { chat };
