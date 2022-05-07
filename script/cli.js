#!/usr/bin/env node

const { spawn } = require('child_process')
const path = require("path");
const exe = path.resolve(__dirname, "../image-diff.exe");
const command = `${exe}`;

const subprocess = spawn(command, [], {
    detached: true,
    stdio: 'inherit' // ['ignore', process.stdout, process.stderr]
})

subprocess.unref()
process.exit()