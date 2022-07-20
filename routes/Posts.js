const express = require("express");
const route = express.Router();
const { post } = require("../models/Post");
const { comment } = require("../models/Comment");
const { user } = require("../models/User");
const { FetchUser } = require("../middlewares/FetchUser");
const { upload } = require("../middlewares/FileUpload");
const mongoose = require("mongoose");
let bucket = null;
mongoose.connection.on("connected", () => {
  bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "upload",
  });
});

//ROUTE-1:create post
route.post(
  "/createPost",
  FetchUser,
  upload.single("file"),
  async (req, res) => {
    try {
      const { id, contentType } = req.file;
      const { caption } = req.body;
      const Post = await post.create({
        user: req.user.id,
        caption: caption,
        File: {
          Id: id,
          metadata: contentType,
        },
      });
      return res.status(201).json({ msg: "succesfully posted" });
    } catch (err) {
      return res.status(400).json({ error: "server error", message: err });
    }
  }
);
//ROUTE-2: get user posts
route.get("/getUserPost/:id", FetchUser, async (req, res) => {
  try {
    const Posts = await post
      .find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(Posts);
  } catch (err) {
    return res.status(400).json({ error: "server error", message: err });
  }
});
route.get("/getImages/:id", FetchUser, async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const { id } = req.params;
    const file = await db
      .collection("upload.files")
      .findOne({ _id: mongoose.Types.ObjectId(id) });
    if (!file) {
      return res.status(404).json("no file found");
    }
    let Stream = bucket.openDownloadStream(mongoose.Types.ObjectId(id));
    Stream.pipe(res);
    Stream.on("error", (err) => {
      return res.status(400).json(err);
    });
    Stream.on("end", () => {
      return res.end();
    });
  } catch (err) {
    return res.status(400).json({ error: "server error", message: err });
  }
});
route.get("/getVideos/:id", async (req, res) => {
  const db = mongoose.connection.db;
  const { id } = req.params;
  const video = await db
    .collection("upload.files")
    .findOne({ _id: mongoose.Types.ObjectId(id) });
  if (!video) {
    return res.status(400).json("no video uploaded");
  }
  const range = req.headers["range"];
  if (range && typeof range === "string") {
    const parts = range.replace(/bytes=/, "").split("-");
    const partialstart = parts[0];
    const partialend = parts[1];

    const start = parseInt(partialstart, 10);
    const end = partialend ? parseInt(partialend, 10) : video.length - 1;
    const chunksize = end - start + 1;

    res.writeHead(206, {
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Range": "bytes " + start + "-" + end + "/" + video.length,
      "Content-Type": video.contentType,
    });

    let downloadStream = bucket.openDownloadStream(
      mongoose.Types.ObjectId(id),
      {
        start,
        end: end + 1,
      }
    );
    downloadStream.pipe(res);
    downloadStream.on("error", () => {
      res.sendStatus(404);
    });
    downloadStream.on("end", () => {
      res.end();
    });
  } else {
    res.header("Content-Length", video.length);
    res.header("Content-Type", video.contentType);

    let downloadStream = gridfs.openDownloadStream(mongoose.Types.ObjectId(id));
    downloadStream.pipe(res);
    downloadStream.on("error", () => {
      res.sendStatus(404);
    });
    downloadStream.on("end", () => {
      res.end();
    });
  }
});
//ROUTE-3: get all posts
route.get("/getAllPost", FetchUser, async (req, res) => {
  try {
    const { page } = req.query;
    let Posts = await post
      .find({})
      .limit(10)
      .skip(10 * parseInt(page))
      .sort({ createdAt: -1 })
      .lean();
    let newPosts = await Promise.all(
      Posts.map(async (post) => {
        let User = await user
          .findById(post.user)
          .select("_id ProfilePic name")
          .lean();
        post.user = User;
        let comments = await comment.find({ post: post._id }).lean().count();
        post.comment = comments;
        return post;
      })
    );
    return res.status(200).json(newPosts);
  } catch (err) {
    return res.status(400).json({ error: "server error", message: err });
  }
});
//ROUTE-4: update post
route.put("/updatePost/:id", FetchUser, async (req, res) => {
  let success = false;
  try {
    const newPost = {};
    const { caption } = req.body;
    if (caption) {
      newPost.caption = caption;
    }
    const Post = await post.findById(req.params.id);
    if (!Post) {
      return res.status(404).json({ success, error: "not found" });
    }
    if (Post.user.toString() !== req.user.id) {
      return res.status(401).json({ success, error: "not allowed" });
    }

    const updatedPost = await post.findByIdAndUpdate(
      req.params.id,
      { $set: newPost },
      { new: true }
    );

    success = true;
    return res.status(200).json({ success, updatedPost });
  } catch (err) {
    return res
      .status(400)
      .json({ success, error: "server error", message: err });
  }
});
//ROUTE-5:delete post
route.put("/deletePost/:id", FetchUser, async (req, res) => {
  let success = false;
  try {
    const Post = await post.findById(req.params.id).lean();
    if (!Post) {
      res.status(404).json({ success, error: "not found" });
    }
    if (Post.user.toString() !== req.user.id) {
      res.status(401).json({ success, error: "not allowed" });
    }
    success = true;
    const [DeletedPost, DeletedComments] = await Promise.all([
      post.deleteById(req.params.id),
      comment.deleteMany({ post: req.params.id }),
    ]);
    return res
      .status(200)
      .json({ success, message: "Post deleted successfully" });
  } catch (err) {
    return res
      .status(400)
      .json({ success, error: "server error", message: err });
  }
});
//ROUTE-6:get post by id
route.get("/PostById/:id", FetchUser, async (req, res) => {
  try {
    const Post = await post.findById(req.params.id).lean();
    const User = await user.findById(Post.user).lean();
    Post.user = User;
    return res.status(200).json(Post);
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, error: "server error", message: err });
  }
});
//ROUTE-7: set like by id
route.put("/updateLike/:postId", FetchUser, async (req, res) => {
  let success = false;
  try {
    const Post = await post.findById(req.params.postId);
    if (!Post) {
      res.status(404).json({ success, error: "not found" });
    }
    if (Post.likes.includes(req.user.id)) {
      Post.likes = Post.likes.filter((id) => id !== req.user.id);
    } else {
      Post.likes.push(req.user.id);
    }
    const updatedPost = await post.findByIdAndUpdate(
      req.params.postId,
      { $set: Post },
      { new: true }
    );

    success = true;
    return res.status(200).json({ success, updatedPost });
  } catch (err) {
    return res
      .status(400)
      .json({ success, error: "server error", message: err });
  }
});
//ROUTE-8 : find count of posts
route.get("/getCount", FetchUser, async (req, res) => {
  try {
    const count = await post.count().lean();
    return res.status(200).json(count);
  } catch (err) {
    return res.status(400).json({ error: "server error", message: err });
  }
});
module.exports = { PostsRoute: route };
