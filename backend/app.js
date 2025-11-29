// app.js
const express = require("express");
const spotifyRouter = require('./spotify');
const forumsRouter = require('./forums');
const inboxRouter = require('./inbox');
const userRouter = require('./users');
const publicProfileRouter = require('./publicProfile');
const app = express();
const port = process.env.PORT || 5001;

app.use(express.json());

const db = require("./firebase");
const { collection, getDocs, updateDoc, doc, addDoc, deleteDoc } = require("firebase/firestore");

const cors = require("cors");
app.use(cors());

app.get('/test', async (req, res) => {
    try {
        const snapshot = await getDocs(collection(db, 'test'));
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        res.status(200).send(messages);
    } catch (error) {
        res.status(500).send({ error: 'Error fetching messages' });
    }
});

app.use("/spotify", spotifyRouter);

/* Implement later once decide how to organize */
// app.use("/users", usersRouter);
// app.use("/fourms", fourmsRouter);
// app.use("/messages", messagesRouter);

app.use("/forum", forumsRouter);
app.use("/inbox", inboxRouter);
app.use("/public-profile", publicProfileRouter);
app.use("/users", userRouter);

app.listen(port,"0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
});