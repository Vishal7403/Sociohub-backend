const express = require("express");
const route = express.Router();
const { user } = require("../models/User");
const { Otp } = require("../models/Otp");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
require("dotenv").config();
async function Mailer(email, code) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: `${process.env.USERID}`,
      pass: `${process.env.PASSWORD}`,
    },
  });
  var mailOptions = {
    from: `${process.env.USERID}`,
    to: email,
    subject: "Forget Password for Sociohub account",
    text: `Hello user, otp to reset your password is ${code}.
           This otp will expire after 15 minutes.`,
  };
  let mail = await transporter.sendMail(mailOptions);
}

route.get("/forgotPassword/:id", async (req, res) => {
  const { id } = req.params;
  const data = await user.findOne({ email: id }).lean();
  if (data) {
    try {
      const code = Math.floor(10000 * (Math.random() + 1));
      const q = await Otp.findOne({ email: id }).lean();
      if (q) {
        q.code = code;
        q.expireAt = new Date().getTime() + 900 * 1000;
        const newOtp = await Otp.findByIdAndUpdate(
          q._id,
          { $set: q },
          { new: true }
        ).lean();
        Mailer(id, code);
        return res
          .status(200)
          .json({ success: true, message: "email sent successfully" });
      } else {
        const otp = await Otp.create({
          email: id,
          code: code,
          expireAt: new Date().getTime() + 900 * 1000,
        })
        Mailer(id, code);
        return res
          .status(200)
          .json({ success: true, message: "email sent successfully" });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: "server error" });
    }
  } else {
    return res
      .status(404)
      .json({ success: false, message: "email id not registered" });
  }
});
route.post("/forgotPassword/:id", async (req, res) => {
  const { code, password } = req.body;
  const { id } = req.params;
  try {
    const otp = await Otp.findOne({ email: id }).lean();
    if (otp && otp.code === parseInt(code)) {
      const User = await user.findOne({ email: id }).lean();
      const Salt = await bcrypt.genSalt(10);
      const encryptPass = await bcrypt.hash(password, Salt);
      User.password = encryptPass;
      const updatedUser = await user
        .findByIdAndUpdate(User._id, { $set: User }, { new: true })
        .lean();
      const q = await Otp.findOneAndDelete({ email: id });
      return res
        .status(200)
        .json({ success: true, message: "password updated successfully" });
    } else {
      return res
        .status(401)
        .send({ success: false, message: "otp provided is incorrect" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "server error" });
  }
});
module.exports = { OtpRoute: route };
