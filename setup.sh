#!/bin/bash

# Frames41 Full Setup Script
# Installs dependencies, builds all apps, and starts development servers

set -e

echo "🚀 Starting Frames41 full setup..."
echo ""

# Install dependencies for all workspaces
echo "📦 Installing dependencies..."
npm install

# Build all apps (frontend, backend, admin)
echo "🔨 Building all applications..."
npm run build:all

# Start all dev servers concurrently
echo "✨ Starting development servers..."
npm run dev:full

