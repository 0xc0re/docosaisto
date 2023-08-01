const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { generateAudio, generateVideo } = require('./generate');

const app = express();
app.use(bodyParser.json());

// Enable CORS for all routes and all origins
app.use(cors());

// Endpoint for generating audio
app.post('/generate/audio', async (req, res) => {
    const text = req.body.text;
    if (!text) {
        return res.status(400).send('Text is required');
    }

    try {
        const audioPath = await generateAudio(text);
        if (!audioPath) {
            return res.status(500).send('Failed to generate audio');
        }

        res.sendFile(audioPath); // Send the audio file directly in the response
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while generating the audio');
    }
});

// Endpoint for generating video
app.post('/generate/video', async (req, res) => {
    const text = req.body.text;
    if (!text) {
        return res.status(400).send('Text is required');
    }

    try {
        const videoPath = await generateVideo(text);
        if (!videoPath) {
            return res.status(500).send('Failed to generate video');
        }

        res.sendFile(videoPath); // Send the video file directly in the response
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while generating the video');
    }
});

app.use(express.static(path.join(__dirname, 'public')));

const port = 3000;
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
