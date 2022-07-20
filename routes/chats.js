const route = require("express").Router();
const { FetchUser } = require("../middlewares/FetchUser");
const { chat } = require("../models/Chats");
route.post("/", FetchUser, async (req, res) => {
  try {
    const newChat = await chat.create(req.body);
    return res.status(201).json(newChat);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});
route.get("/:id", FetchUser, async (req, res) => {
  try {
    const Chats = await chat
      .find({
        conversationId: req.params.id,
      })
      .lean();
    return res.status(201).json(Chats);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});
module.exports = { ChatRoute: route };
