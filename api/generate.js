const execa = require('execa');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const path = require('path');
const uuid = require('uuid');

async function generateAudio(text) {
    const requestId = uuid.v4(); // Unique ID for this request
    const requestPath = `/tmp/sbaitso/${requestId}`;
    const sinkName = `sink_${requestId}`; // Unique sink name for this request

    try {
        console.log(`Starting generation process for request ${requestId}...`);

        // Remove the out dir and make a new one specific to this request
        rimraf.sync(requestPath);
        mkdirp.sync(requestPath);
        
        // Create a new virtual sink for this request
        console.log(`Creating PulseAudio virtual sink: ${sinkName}`);
        await execa('pacmd', ['load-module', 'module-virtual-sink', `sink_name=${sinkName}`]);

        // Set the newly created virtual sink as the default
        console.log(`Setting ${sinkName} as the default PulseAudio sink`);
        await execa('pacmd', ['set-default-sink', sinkName]);

        console.log(`Starting DOSBox to run SAY.BAT with text: "${text}"...`);
        const dosbox = execa(
            'dosbox',
            ['-c', 'mount C sbaitso', '-c', 'C:', '-c', `SAY.BAT "${text}"`],
            {
                env: { TERM: 'xterm' },
            }
        );

        // Wait for DOSBox to start speaking
        console.log("Waiting for DOSBox to start speaking...");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Start the ffmpeg capture to an audio file from the specific sink
        const audioPath = path.join(requestPath, 'out.mp3');
        console.log("Starting the ffmpeg capture to an audio file...");
        const recording = execa('ffmpeg', [
            '-y',
            '-f',
            'pulse',
            '-i',
            `${sinkName}.monitor`, // Capture from the specific sink
            '-c:a',
            'libmp3lame',
            audioPath,
        ]);
        recording.catch(() => {});

        // Wait for DOSBox to finish and close the recording
        console.log("Waiting for DOSBox to finish...");
        await dosbox;
        recording.kill();

        // Apply a fade-in effect to reduce the pop
        const processedAudioPath = path.join(requestPath, 'processed.mp3');
        console.log("Applying a fade-in effect...");
        await execa('ffmpeg', [
            '-y',
            '-i',
            audioPath,
            '-af',
            'afade=in:st=0:d=0.1', // 0.1-second fade-in at the start
            processedAudioPath,
        ]);

        // Unload the virtual sink
        console.log(`Unloading PulseAudio virtual sink: ${sinkName}`);
        await execa('pacmd', ['unload-module', `module-virtual-sink`, `sink_name=${sinkName}`]);

        console.log(`Generated audio file: ${processedAudioPath}`);
        return processedAudioPath;
    } catch (err) {
        console.error("An error occurred:", err);
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
    const requestPath = `/tmp/sbaitso/${requestId}`;
    
    // Path to the sbaitso.png image (update as needed)
    const imagePath = path.join(__dirname, 'sbaitso.png');

    // Create a video with the sbaitso.png image and the generated audio
    const videoPath = path.join(requestPath, 'video.mp4');
    console.log("Creating a video with the image and audio...");
    const { stdout, stderr } = await execa('ffmpeg', [
        '-y',
        '-loop',
        '1',
        '-i',
        imagePath,
        '-i',
        audioPath,
        '-c:a',
        'aac',
        '-strict',
        '-2',
        '-b:a',
        '64k',
        '-c:v',
        'libx264',
        '-b:v',
        '768K',
        '-shortest',
        '-pix_fmt',
        'yuv420p',
        videoPath,
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
