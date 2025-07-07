#!/bin/bash

# Image Labeler AI - Quick Setup Script for Linux
# This script sets up convenient shortcuts for the image labeler tool

echo "🤖 Image Labeler AI - Setting up shortcuts..."
echo "=============================================="

# Detect shell
SHELL_RC=""
if [ -n "$ZSH_VERSION" ]; then
    SHELL_RC="$HOME/.zshrc"
    SHELL_NAME="zsh"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_RC="$HOME/.bashrc"
    SHELL_NAME="bash"
else
    echo "⚠️  Could not detect shell. Defaulting to ~/.bashrc"
    SHELL_RC="$HOME/.bashrc"
    SHELL_NAME="bash"
fi

echo "📝 Detected shell: $SHELL_NAME"
echo "📁 Shell config: $SHELL_RC"

# Check if aliases already exist
if grep -q "alias quick=" "$SHELL_RC" 2>/dev/null; then
    echo "⚠️  Shortcuts already exist in $SHELL_RC"
    read -p "Do you want to update them? (y/N): " UPDATE
    if [[ ! $UPDATE =~ ^[Yy]$ ]]; then
        echo "❌ Skipping alias setup"
        exit 0
    fi
    
    # Remove existing aliases
    sed -i '/# Image Labeler AI shortcuts/,/# End Image Labeler AI shortcuts/d' "$SHELL_RC"
fi

# Add aliases to shell config
echo "" >> "$SHELL_RC"
echo "# Image Labeler AI shortcuts" >> "$SHELL_RC"
echo "alias quick='image-labeler rename . --webp'" >> "$SHELL_RC"
echo "alias quickjpg='image-labeler rename .'" >> "$SHELL_RC"
echo "alias preview='image-labeler rename . --dry-run --webp'" >> "$SHELL_RC"
echo "alias quickjpeg=\"image-labeler rename '*.jpg' --webp\"" >> "$SHELL_RC"
echo "alias quickpng=\"image-labeler rename '*.png' --webp\"" >> "$SHELL_RC"
echo "# End Image Labeler AI shortcuts" >> "$SHELL_RC"

echo "✅ Added shortcuts to $SHELL_RC"

# Create desktop integration (optional)
echo ""
read -p "🖥️  Do you want to create desktop integration (right-click in file manager)? (Y/n): " DESKTOP
if [[ ! $DESKTOP =~ ^[Nn]$ ]]; then
    
    # Create applications directory if it doesn't exist
    mkdir -p ~/.local/share/applications/
    
    # Create desktop entry
    cat > ~/.local/share/applications/image-labeler.desktop << 'EOF'
[Desktop Entry]
Name=Image Labeler AI
Comment=Rename images with AI in current folder
Exec=bash -c 'cd "%f" && gnome-terminal -- bash -c "echo \"🤖 Image Labeler AI - Processing images...\"; echo \"Directory: $(pwd)\"; echo \"\"; image-labeler rename . --webp; echo \"\"; echo \"✅ Processing complete!\"; echo \"Press Enter to close...\"; read"'
Icon=image-x-generic
Terminal=false
Type=Application
MimeType=inode/directory;
Categories=Graphics;Photography;
EOF
    
    # Update desktop database if available
    if command -v update-desktop-database >/dev/null 2>&1; then
        update-desktop-database ~/.local/share/applications/ 2>/dev/null
        echo "✅ Desktop integration created"
    else
        echo "⚠️  Desktop integration created (update-desktop-database not found)"
    fi
fi

# Create a quick setup function
echo ""
echo "# Quick setup function for new directories" >> "$SHELL_RC"
echo "quicksetup() {" >> "$SHELL_RC"
echo "    echo \"🤖 Image Labeler AI - Quick Setup\"" >> "$SHELL_RC"
echo "    echo \"Current directory: \$(pwd)\"" >> "$SHELL_RC"
echo "    echo \"\"" >> "$SHELL_RC"
echo "    ls -la *.{jpg,jpeg,png,gif,webp,bmp} 2>/dev/null | wc -l | xargs echo \"Images found:\"" >> "$SHELL_RC"
echo "    echo \"\"" >> "$SHELL_RC"
echo "    echo \"Available commands:\"" >> "$SHELL_RC"
echo "    echo \"  quick      - Rename all images (with WebP conversion)\"" >> "$SHELL_RC"
echo "    echo \"  quickjpg   - Rename all images (keep original format)\"" >> "$SHELL_RC"
echo "    echo \"  preview    - Preview changes without applying\"" >> "$SHELL_RC"
echo "    echo \"  quickjpeg  - Rename only JPG files\"" >> "$SHELL_RC"
echo "    echo \"  quickpng   - Rename only PNG files\"" >> "$SHELL_RC"
echo "}" >> "$SHELL_RC"

echo "✅ Added quicksetup function"

# Source the config file to make aliases available immediately
echo ""
echo "🔄 Applying changes..."
source "$SHELL_RC" 2>/dev/null || true

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📚 Available commands:"
echo "  quick      - Rename all images in current folder (with WebP)"
echo "  quickjpg   - Rename all images (keep original format)"
echo "  preview    - Preview changes without applying"
echo "  quickjpeg  - Rename only JPG files"
echo "  quickpng   - Rename only PNG files"
echo "  quicksetup - Show this help in any directory"
echo ""
echo "🚀 Usage:"
echo "  cd /path/to/images/"
echo "  quick"
echo ""
echo "💡 Tips:"
echo "  - Use 'preview' first to see what changes would be made"
echo "  - WebP conversion saves 25-35% file size"
echo "  - All original files are safely replaced with renamed versions"
echo ""
echo "🔧 To apply changes to current terminal session, run:"
echo "  source $SHELL_RC"
echo ""
echo "✨ Happy organizing!"