require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");

const User = require("./modals/user.modal");
const Note = require("./modals/note.model");

mongoose.connect(config.connectionString);

const express = require("express");
const cors = require("cors");
const app = express();

const jwt = require("jsonwebtoken");
const { authenticationToken } = require("./utilities");

app.use(express.json());

app.use(
    cors({
        origin: "*",
    })
);

// Home endpoint
app.get("/", (req, res) => {
    res.json({ data: "hello" });
});

// Create Account
app.post("/create-account", async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName) {
        return res
            .status(400)
            .json({ error: true, message: "Full Name is required" });
    }

    if (!email) {
        return res
            .status(400)
            .json({ error: true, message: "Email is required" });
    }
    if (!password) {
        return res
            .status(400)
            .json({ error: true, message: "Password is required" });
    }
    const isUser = await User.findOne({ email: email });
    if (isUser) {
        return res.json({
            error: true,
            message: "User already exist",
        });
    }
    const user = new User({
        fullName,
        email,
        password,
    });
    await user.save();

    // --- UPDATED --- Sign only minimal fields into the JWT payload
    const accessToken = jwt.sign(
        { _id: user._id, email: user.email },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "36000m",
        }
    );

    return res.json({
        error: false,
        user,
        accessToken,
        message: "Registration Successfully",
    });
});

// Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }

    const userInfo = await User.findOne({ email: email });

    if (!userInfo) {
        return res.status(400).json({ message: "User not found" });
    }

    if (userInfo.email === email && userInfo.password === password) {
        // --- UPDATED --- Sign only minimal fields into the JWT payload
        const accessToken = jwt.sign(
            { _id: userInfo._id, email: userInfo.email },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: "36000m",
            }
        );

        return res.json({
            error: false,
            message: "Login Successfully",
            email,
            accessToken,
        });
    } else {
        return res.status(400).json({
            error: true,
            message: "Invalid Credentials",
        });
    }
});

// Get User
app.get("/get-user", authenticationToken, async (req, res) => {
    // --- UPDATED --- Use _id from token directly
    const { _id } = req.user;
    const isUser = await User.findOne({ _id: _id });

    if (!isUser) {
        return res.sendStatus(401);
    }

    return res.json({
        user: {
            fullName: isUser.fullName,
            email: isUser.email,
            _id: isUser._id,
            createdOn: isUser.createdOn,
        },
        message: "",
    });
});

// Create Note
app.post("/add-note", authenticationToken, async (req, res) => {
    const { title, content, tags } = req.body;

    const user = req.user;

    if (!title) {
        return res
            .status(400)
            .json({ error: true, message: "Title is required" });
    }

    if (!content) {
        return res
            .status(400)
            .json({ error: true, message: "Content is required" });
    }

    try {
        const note = new Note({
            title,
            content,
            tags: tags || [],
            userId: user._id,
        });

        await note.save();

        return res.json({
            error: false,
            note,
            message: "Note added successfully",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});

// Edit Note
app.put("/edit-note/:noteId", authenticationToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { title, content, isPinned, tags } = req.body;
    const user = req.user;

    if (!title && !content && !tags && typeof isPinned !== "boolean") {
        return res
            .status(400)
            .json({ error: true, message: "No changes provided" });
    }
    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });
        if (!note) {
            return res
                .status(404)
                .json({ error: true, message: "Note not found" });
        }

        if (title) note.title = title;
        if (content) note.content = content;
        if (tags) note.tags = tags;
        if (typeof isPinned === "boolean") note.isPinned = isPinned;

        await note.save();

        return res.json({
            error: false,
            note,
            message: "Note updated successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});

// Get All Notes
app.get("/get-all-notes/", authenticationToken, async (req, res) => {
    const user = req.user;
    try {
        const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });
        return res.json({
            error: false,
            notes,
            message: "All notes fetched successfully",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});

// Delete Note
app.delete("/delete-note/:noteId", authenticationToken, async (req, res) => {
    const noteId = req.params.noteId;
    const user = req.user;
    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });
        if (!note) {
            return res
                .status(404)
                .json({ error: true, message: "Note not found" });
        }

        await Note.deleteOne({ _id: noteId, userId: user._id });
        return res.json({
            error: false,
            message: "Note deleted successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});

// Update IsPinned Value
app.put("/update-note-pinned/:noteId", authenticationToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { isPinned } = req.body;
    const user = req.user;

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });

        if (!note) {
            return res
                .status(404)
                .json({ error: true, message: "Note not found" });
        }

        note.isPinned = isPinned;

        await note.save();

        return res.json({
            error: false,
            note,
            message: "Note updated successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});

// Search Notes
app.get("/search-notes/", authenticationToken, async (req, res) => {
    const user = req.user;
    const query = req.query.query && req.query.query.trim();

    if (!query) {
        return res.status(400).json({
            error: true,
            message: "Search query is required",
        });
    }
    try {
        const matchingNotes = await Note.find({
            userId: user._id,
            $or: [
                { title: { $regex: new RegExp(query, "i") } },
                { content: { $regex: new RegExp(query, "i") } },
            ],
        });
        return res.json({
            error: false,
            notes: matchingNotes,
            message: "Notes matching the search query retrieved successfully",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});

app.listen(8000);

module.exports = app;
