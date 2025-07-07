#!/bin/bash

# Image Labeler AI - Complete Installation Script
# Run this script to install everything needed

set -e  # Exit on any error

echo "🤖 Image Labeler AI - Complete Installation"
echo "==========================================="
echo ""

# Check if Node.js is installed
if ! command -v node >/dev/null 2>&1; then
    echo "❌ Node.js is not installed!"
    echo ""
    echo "Please install Node.js first:"
    echo ""
    echo "Ubuntu/Debian:"
    echo "  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    echo "  sudo apt-get install -y nodejs"
    echo ""
    echo "Fedora/CentOS:"
    echo "  curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -"
    echo "  sudo dnf install nodejs npm"
    echo ""
    echo "Arch Linux:"
    echo "  sudo pacman -S nodejs npm"
    echo ""
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo "✅ npm found: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Install globally
echo "🌍 Installing globally..."
npm install -g .
echo "✅ Global installation complete"
echo ""

# Check if image-labeler command is available
if ! command -v image-labeler >/dev/null 2>&1; then
    echo "❌ Global installation failed. Trying to fix PATH..."
    
    # Try to fix npm global path
    NPM_PREFIX=$(npm config get prefix)
    if [[ ":$PATH:" != *":$NPM_PREFIX/bin:"* ]]; then
        echo "export PATH=\"$NPM_PREFIX/bin:\$PATH\"" >> ~/.bashrc
        export PATH="$NPM_PREFIX/bin:$PATH"
        echo "✅ Added npm global bin to PATH"
    fi
    
    if ! command -v image-labeler >/dev/null 2>&1; then
        echo "❌ Still cannot find image-labeler command"
        echo "Please check your npm global installation"
        exit 1
    fi
fi

echo "✅ image-labeler command available"
echo ""

# Check API key
echo "🔑 Checking API key configuration..."
if image-labeler config | grep -q "API key is configured"; then
    echo "✅ API key already configured"
else
    echo "⚠️  No API key configured"
    echo ""
    echo "You need a free Gemini API key from Google AI Studio:"
    echo "👉 https://aistudio.google.com/app/apikey"
    echo ""
    read -p "Enter your Gemini API key (or press Enter to skip): " API_KEY
    
    if [ ! -z "$API_KEY" ]; then
        image-labeler config --api-key "$API_KEY"
        echo "✅ API key configured"
    else
        echo "⚠️  Skipped API key setup. You can set it later with:"
        echo "   image-labeler config --api-key YOUR_KEY"
    fi
fi
echo ""

# Set up shortcuts
echo "⚡ Setting up shortcuts..."
./setup-shortcuts.sh
echo ""

# Final verification
echo "🧪 Testing installation..."
if image-labeler --help >/dev/null 2>&1; then
    echo "✅ Installation test passed"
else
    echo "❌ Installation test failed"
    exit 1
fi
echo ""

echo "🎉 Installation Complete!"
echo "========================"
echo ""
echo "🚀 Quick Start:"
echo "  1. Navigate to any folder with images:"
echo "     cd ~/Pictures/my-photos/"
echo ""
echo "  2. Run the quick command:"
echo "     quick"
echo ""
echo "📚 Available commands:"
echo "  quick      - Rename all images (with WebP conversion)"
echo "  quickjpg   - Rename all images (keep original format)"
echo "  preview    - Preview changes without applying"
echo "  quicksetup - Show help for any directory"
echo ""
echo "🔧 To use shortcuts in current terminal:"
echo "  source ~/.bashrc"
echo ""
echo "📖 Full documentation:"
echo "  cat README.md"
echo ""
echo "✨ Happy organizing!"