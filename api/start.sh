#!/bin/bash

# Start the PulseAudio server
pulseaudio -D --exit-idle-time=-1

# Start your Node.js app
node server.js
