const express = require("express");
const route = express.Router();
const { user } = require("../models/User");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const { FetchUser } = require("../middlewares/FetchUser");
const jwt = require("jsonwebtoken");
const { upload } = require("../middlewares/FileUpload");
require("dotenv").config();
//ROUTE-1:for sign up
route.post(
  "/signup",
  [
    body("email", "enter valid email").isEmail(),
    body("password", "minimum length of password is 5").isLength({ min: 5 }),
    body("name", "enter valid name").isLength({ min: 3 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password, name } = req.body;
    let User = await user.findOne({ email: email }).lean();
    if (User) {
      return res
        .status(400)
        .json({ success, error: "user with this email already exists" });
    }
    const Salt = await bcrypt.genSalt(10);
    const encryptPass = await bcrypt.hash(password, Salt);
    User = await user.create({
      name: name,
      email: email,
      password: encryptPass,
    });
    success = true;
    return res.status(201).json({ success, msg: "user created successfully" });
  }
);
//ROUTE-2: for login
route.post(
  "/login",
  [
    body("password", "cannot be blank").exists(),
    body("email", "enter a valid email").isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { email, password } = req.body;
    console.log(email, password);
    try {
      let User = await user.findOne({ email: email }).lean();
      if (!User) {
        return res
          .status(400)
          .json({ success: false, message: "login with correct credentials" });
      }
      const passCompare = await bcrypt.compare(password, User.password);
      if (!passCompare) {
        return res
          .status(400)
          .json({ success: false, message: "login with correct credentials" });
      }
      const Data = {
        user: {
          id: User._id,
        },
      };
      success = true;
      const authToken = jwt.sign(Data, process.env.JWT_SECRET);
      return res.status(200).json({
        success: true,
        authToken: authToken,
        UserId: User._id,
        message: "Logged in successfully",
      });
    } catch (err) {
      return res.status(500).send({ success: false, error: err });
    }
  }
);
//ROUTE-3:to fetch user details
route.get("/getUser/:id", FetchUser, async (req, res) => {
  try {
    let UserId = req.params.id;
    const User = await user.findById(UserId).select("-password").lean();
    return res.status(200).send(User);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});
//ROUTE-5: for handling follow and unfollow
route.get("/updateProfile/:id", FetchUser, async (req, res) => {
  try {
    const User1 = await user.findById(req.user.id);
    const User2 = await user.findById(req.params.id);
    if (!User1.Following.includes(req.params.id)) {
      User1.Following.push(req.params.id);
      User2.Followers.push(req.user.id);
    } else {
      User1.Following = User1.Following.filter(
        (user) => user !== req.params.id
      );
      User2.Followers = User2.Followers.filter((user) => user !== req.user.id);
    }

    const [updatedUser1, updatedUser2] = await Promise.all([
      user
        .findByIdAndUpdate(req.user.id, { $set: User1 }, { new: true })
        .lean(),
      user
        .findByIdAndUpdate(req.params.id, { $set: User2 }, { new: true })
        .lean(),
    ]);
    if (updatedUser1 && updatedUser2) {
      return res.status(200).json({ message: "success" });
    }
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});
// ROUTE - 6 : for searching users
route.get("/search/:id", FetchUser, async (req, res) => {
  try {
    const { id } = req.params;
    const response = await user
      .find({ name: { $regex: `^${id}`, $options: "i" } })
      .select("_id ProfilePic name")
      .lean()
      .limit(20);
    res.status(201).json(response);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});
route.post(
  "/setProfile",
  FetchUser,
  upload.single("file"),
  async (req, res) => {
    try {
      const { id } = req.user;
      const User = await user.findById(id).lean();
      User.ProfilePic = req.file.id;
      const UpdatedUser = await user
        .findByIdAndUpdate(id, { $set: User }, { new: true })
        .lean();
      return res.status(200).json(UpdatedUser);
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }
);
route.post("/google-login", async (req, res) => {
  try {
    const { email } = req.body;
    const User = await user.findOne({ email: email }).lean();
    if (!User) {
      return res.status(404).json({
        success: false,
        message: "No user with this email registered",
      });
    }
    const Data = {
      user: {
        id: User._id,
      },
    };
    const authToken = jwt.sign(Data, process.env.JWT_SECRET);
    return res
      .status(200)
      .json({ success: true, authToken: authToken, UserId: User._id });
  } catch (err) {
    return res.status(500).json({ success: false, message: err });
  }
});
route.put("/savePost/:id", FetchUser, async (req, res) => {
  try {
    const { id } = req.params;
    const User = await user.findById(req.user.id).lean();
    if (User.SavedPosts.includes(id)) {
      User.SavedPosts = User.SavedPosts.filter((Id) => Id !== id);
    } else {
      User.SavedPosts.push(id);
    }
    const updatedUser = await user
      .findByIdAndUpdate(req.user.id, { $set: User }, { new: true })
      .lean();
    return res.status(200).json("saved successfully");
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});
module.exports = { UserRoute: route };
