const execa = require('execa');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const path = require('path');
const uuid = require('uuid');
const os = require('os');

async function generateAudio(text) {
    if (typeof text !== 'string' || text.length > 2000) { // simple length check
        throw new Error("Invalid text input.");
    }

    const requestId = uuid.v4();
    const requestPath = path.join(os.tmpdir(), 'sbaitso', requestId);

    try {
        console.log(`Starting generation process for request ${requestId}...`);

        rimraf.sync(requestPath);
        mkdirp.sync(requestPath);

        console.log(`Starting DOSBox to run SAY.BAT with text: "${text}"...`);
        const dosbox = execa('dosbox', [
            '-c', 'mount C sbaitso', '-c', 'C:', '-c', `SAY.BAT "${text}"`
        ], { env: { TERM: 'xterm' } });

        console.log("Waiting for DOSBox to start speaking...");
        await new Promise(resolve => setTimeout(resolve, 1000));

        const audioPath = path.join(requestPath, 'out.mp3');
        console.log("Starting the ffmpeg capture to an audio file...");
        const recording = execa('ffmpeg', [
            '-y', '-f', 'pulse', '-i', 'v1.monitor', '-c:a', 'libmp3lame', audioPath
        ]);

        console.log("Waiting for DOSBox to finish...");
        await dosbox;
        recording.kill();

        const processedAudioPath = path.join(requestPath, 'processed.mp3');
        console.log("Applying a fade-in effect...");
        await execa('ffmpeg', [
            '-y', '-i', audioPath, '-af', 'afade=in:st=0:d=0.1', processedAudioPath
        ]);

        console.log(`Generated audio file: ${processedAudioPath}`);
        return processedAudioPath;

    } catch (err) {
        console.error("An error occurred:", err);
        rimraf.sync(requestPath);  // cleanup
        return null;
    }
}

async function generateVideo(text) {
    const audioPath = await generateAudio(text);
    if (!audioPath) {
        console.error("Failed to generate audio");
        return null;
    }

    const requestId = path.basename(path.dirname(audioPath));
    const requestPath = path.join(os.tmpdir(), 'sbaitso', requestId);

    const imagePath = path.join(__dirname, 'sbaitso.png');

    const videoPath = path.join(requestPath, 'video.mp4');
    console.log("Creating a video with the image and audio...");

    const { stdout, stderr } = await execa('ffmpeg', [
        '-y', '-loop', '1', '-i', imagePath, '-i', audioPath, '-c:a', 'aac', '-strict', 
        '-2', '-b:a', '64k', '-c:v', 'libx264', '-b:v', '768K', '-shortest', 
        '-pix_fmt', 'yuv420p', videoPath
    ], { all: true });

    console.log(stdout);
    console.error(stderr);

    console.log(`Generated video file: ${videoPath}`);
    return videoPath;
}

module.exports = {
    generateAudio,
    generateVideo
};
