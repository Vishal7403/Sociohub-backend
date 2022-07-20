const mongoose = require("mongoose");
const { Schema } = mongoose;
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  ProfilePic: {
    type: mongoose.Schema.Types.ObjectId,
  },
  Followers: {
    type: Array,
  },
  Following: {
    type: Array,
  },
  SavedPosts: {
    type: Array,
  },
});
const user = mongoose.model("user", UserSchema);
module.exports = { user };
