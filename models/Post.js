const mongoose = require("mongoose");
const { Schema } = mongoose;

const PostSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    caption: {
      type: String,
    },
    File: {
      Id: { type: mongoose.Schema.Types.ObjectId },
      metadata: { type: String },
    },
    likes: {
      type: Array,
    },
  },
  { timestamps: true }
);

const post = mongoose.model("post", PostSchema);
module.exports = { post };
