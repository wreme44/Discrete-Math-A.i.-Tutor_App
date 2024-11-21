#!/bin/bash
# Start Node.js server in the background
node server/server.mjs &

# Start Nginx
bin/start-nginx-solo