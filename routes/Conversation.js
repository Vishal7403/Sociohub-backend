const route = require("express").Router();
const { FetchUser } = require("../middlewares/FetchUser");
const { conversation } = require("../models/Conversation");
route.post("/createConversation", FetchUser, async (req, res) => {
  const { sender, receiver } = req.body;
  try {
    const newConversation = await conversation.create({
      members: [sender, receiver],
    });
    return res.status(201).json(newConversation);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});
route.get("/:id", FetchUser, async (req, res) => {
  try {
    const Conversations = await conversation
      .find({
        members: { $in: [req.params.id] },
      })
      .lean();
    return res.status(201).json(Conversations);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});
route.get("/getConversation/:id", FetchUser, async (req, res) => {
  try {
    const Conversation = await conversation.findById(req.params.id);
    return res.status(201).json(Conversation);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});
route.get("/getConversationByreceiver/:id", FetchUser, async (req, res) => {
  try {
    const { id } = req.params;
    let Conversation = await conversation
      .findOne({ members: { $all: [id, req.user.id] } })
      .lean();
    if (!Conversation) {
      Conversation = await conversation.create({
        members: [id, req.user.id],
      });
    }
    console.log(Conversation)
    return res.status(200).json(Conversation);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});
module.exports = { ConversationRoute: route };
