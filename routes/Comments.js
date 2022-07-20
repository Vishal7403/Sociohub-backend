const express = require("express");
const { FetchUser } = require("../middlewares/FetchUser");
const { comment } = require("../models/Comment");
const { user } = require("../models/User");
const route = express.Router();
//ROUTE-1:get post comments
route.get("/getPostComment/:id", FetchUser, async (req, res) => {
  try {
    let Comments = await comment.find({ post: req.params.id }).lean();
    let newComments = await Promise.all(
      Comments.map(async (comment) => {
        let User = await user
          .findById(comment.user)
          .lean()
          .select("_id ProfilePic name");
        comment.user = User;
        return comment;
      })
    );
    return res.status(200).json(newComments);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});
//ROUTE-2: create comment
route.post("/createComment/:id", FetchUser, async (req, res) => {
  try {
    const { description } = req.body;
    let Comment = await comment.create({
      user: req.user.id,
      post: req.params.id,
      description: description,
    });
    let User = await user
      .findById(req.user.id)
      .lean()
      .select("_id ProfilePic name");
    Comment._doc.user = User;
    return res.status(201).json(Comment);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});
//ROUTE-3: delete comment
route.put("/deleteComment/:id", FetchUser, async (req, res) => {
  try {
    const Comment = await comment.findById(req.params.id).lean().select("user");
    if (Comment.user.toString() !== req.user.id) {
      return res.status(401).json({ error: "not allowed" });
    }
    const deletedComment = await comment.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "comment deleted successfully" });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});
module.exports = { CommentsRoute: route };
