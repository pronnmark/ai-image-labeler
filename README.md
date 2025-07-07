# 🤖 Image Labeler AI

**Transform your messy image files into organized, searchable collections with AI-powered descriptive names.**

Turn `IMG_20231225_141532.jpg` into `family_christmas_dinner_table_with_candles_and_presents.webp` automatically!

---

## 🎯 What This Does

- **Analyzes your images** using Google's Gemini AI
- **Creates descriptive filenames** (20-100 characters) based on image content
- **Converts to WebP format** for 25-35% smaller file sizes
- **Works on entire folders** at once
- **Runs from anywhere** on your Linux system with one command: `quick`

**Example:**
```
Before: IMG_001.jpg, DSC_1234.jpg, photo.png
After:  golden_retriever_running_in_autumn_park.webp, 
        sunset_over_mountain_lake_with_reflection.webp,
        chocolate_birthday_cake_with_rainbow_sprinkles.webp
```

---

## 🚀 Complete Installation (Copy & Paste)

### Step 1: Install Node.js (if not installed)

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git
```

**Fedora/CentOS:**
```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install nodejs npm git
```

**Arch Linux:**
```bash
sudo pacman -S nodejs npm git
```

### Step 2: Install Image Labeler AI

```bash
# Clone the project
git clone https://github.com/your-username/image-labeler-ai.git
cd image-labeler-ai

# Install everything automatically
chmod +x install.sh
./install.sh
```

### Step 3: Get Your Free API Key

1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key
5. Run this command with your key:

```bash
image-labeler config --api-key YOUR_API_KEY_HERE
```

### Step 4: Test It Works

```bash
# Check installation
image-labeler --help

# Check API key
image-labeler config
```

You should see: `✓ API key is configured`

---

## 🎮 How to Use

### Quick Commands (Available Everywhere)

After installation, these commands work in any directory:

```bash
# Navigate to any folder with images
cd ~/Pictures/vacation-photos/

# See what images are in the folder
quicksetup

# Preview what would be renamed (doesn't change anything)
preview

# Rename all images with AI + convert to WebP
quick

# Rename without WebP conversion
quickjpg
```

### Command Reference

| Command | What It Does |
|---------|-------------|
| `quick` | Rename all images + convert to WebP (recommended) |
| `preview` | Show what would be renamed without changing anything |
| `quickjpg` | Rename images but keep original format |
| `quicksetup` | Show help and count images in current folder |

---

## 📱 Real Examples

### Family Photos
```bash
cd ~/Pictures/family-christmas-2023/
preview    # See what AI suggests
quick      # Apply the changes
```

**Result:**
- `IMG_001.jpg` → `family_opening_presents_christmas_tree_morning_light.webp`
- `IMG_002.jpg` → `grandmother_hugging_grandchildren_holiday_dinner_table.webp`

### Vacation Photos
```bash
cd ~/Pictures/europe-trip/
quick
```

**Result:**
- `DSC_1234.jpg` → `eiffel_tower_sunset_golden_hour_paris_skyline.webp`
- `photo.png` → `italian_pasta_restaurant_outdoor_dining_tuscany.webp`

### Work/Product Photos
```bash
cd ~/Work/product-photos/
preview    # Check first
quickjpg   # Keep original format for work
```

---

## 🌐 Web Interface (Bonus)

You also get a web interface for drag & drop use:

```bash
# Start web server
npm start

# Open browser to: http://localhost:8080
```

**Web Features:**
- Drag & drop images or folders
- Batch processing with progress bar
- Download renamed images as ZIP file
- Real-time preview

---

## 🔧 Advanced Options

### Command Line Options

```bash
# Rename only specific file types
image-labeler rename "*.jpg" --webp
image-labeler rename "*.png" --webp

# Process nested directories
image-labeler rename "photos/**/*.jpg" --webp

# Verbose output (see detailed progress)
image-labeler rename . --webp --verbose

# Just rename one file
image-labeler single photo.jpg --webp
```

### File Formats Supported

**Input:** JPG, PNG, GIF, WebP, BMP, TIFF  
**Output:** WebP (recommended) or original format

---

## 🚨 Troubleshooting

### "Command not found" 
```bash
# Reload shell configuration
source ~/.bashrc

# Or open a new terminal window
```

### "API key not valid"
```bash
# Get new key from: https://aistudio.google.com/app/apikey
image-labeler config --api-key YOUR_NEW_KEY
```

### "No images found"
```bash
# Check what's in the folder
ls *.{jpg,png,gif,webp}

# Make sure you're in the right directory
pwd
```

### Permission Issues
```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Then reinstall
cd image-labeler-ai
npm install -g .
```

---

## 💡 Tips & Best Practices

### Before You Start
- **Always test first**: Use `preview` on important photos
- **Backup originals**: Keep copies of irreplaceable images
- **Start small**: Test on a few photos before processing hundreds

### For Best Results
- **Group similar images**: Process photos from same event together
- **Use WebP**: Saves storage space (25-35% smaller files)
- **Check descriptions**: AI sometimes gets creative - preview first!

### Workflow Suggestions
```bash
# 1. Check what you have
quicksetup

# 2. Preview changes
preview

# 3. Apply if happy with results
quick

# 4. Check the results
ls -la *.webp
```

---

## 🔒 Privacy & Security

- **Your images stay on your computer** - only sent to Google's AI for analysis
- **No storage by Google** - images are analyzed and forgotten immediately
- **API key stored locally** in `~/.image-labeler-config`
- **No tracking or data collection**

---

## 🆘 Need Help?

### Quick Help Commands
```bash
image-labeler --help          # Full command help
quicksetup                    # Show commands for current folder
image-labeler config          # Check API key status
```

### Common Questions

**Q: Can I undo changes?**  
A: No - files are renamed permanently. Always use `preview` first or keep backups.

**Q: What if two images get the same name?**  
A: The tool automatically adds timestamps to prevent conflicts.

**Q: Does it work with RAW files?**  
A: No - only standard image formats (JPG, PNG, GIF, WebP, BMP).

**Q: Can I change the WebP quality?**  
A: Yes - edit `cli.js` line 136 to change quality setting.

---

## 🗑️ Uninstalling

To remove completely:

```bash
# Remove global installation
npm uninstall -g image-labeler-ai

# Remove shortcuts
nano ~/.bashrc
# Delete the "Image Labeler AI shortcuts" section and save

# Remove config file
rm ~/.image-labeler-config

# Remove project folder
rm -rf ~/path/to/image-labeler-ai/
```

---

## 🎉 That's It!

You now have AI-powered image organization! 

**Quick test:**
```bash
# Go to any folder with images
cd ~/Pictures/

# See the magic
quicksetup
preview
quick
```

**Transform thousands of images with just one word: `quick`** 📸✨

---

## 📋 Quick Reference Card

**Copy this to a text file for easy reference:**

```bash
# SETUP (one time)
git clone <repo> && cd image-labeler-ai && ./install.sh
image-labeler config --api-key YOUR_KEY

# DAILY USE
cd /folder/with/images/
quicksetup  # See what's there
preview     # Check what AI suggests  
quick       # Apply changes

# COMMANDS
quick       # Rename all + WebP
quickjpg    # Rename all, keep format
preview     # Show changes only
quicksetup  # Help for current folder
```

**API Key:** https://aistudio.google.com/app/apikey

**Happy organizing! 🚀**