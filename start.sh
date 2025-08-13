#!/bin/bash

echo "🚀 Starting Team Task Tracker..."
echo "📦 Installing dependencies..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    npm install
fi

echo "🌟 Starting development server..."
echo "🔗 Open http://localhost:3000 in your browser"
echo "🛑 Press Ctrl+C to stop the server"

npm run dev