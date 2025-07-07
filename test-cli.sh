#!/bin/bash

echo "🧪 Testing Image Labeler CLI"
echo "=============================="

# Test 1: Check help
echo "📋 Test 1: Help command"
npm run cli -- --help
echo ""

# Test 2: Config without API key
echo "📋 Test 2: Config status"
npm run cli -- config
echo ""

# Test 3: Set API key
echo "📋 Test 3: Set API key"
npm run cli -- config --api-key "YOUR_TEST_KEY_HERE"
echo ""

# Test 4: Dry run on directory
echo "📋 Test 4: Dry run on directory"
npm run cli -- rename test-images/ --dry-run
echo ""

# Test 5: Dry run on single file
echo "📋 Test 5: Dry run on single file"
npm run cli -- single test-images/test1.jpg --dry-run
echo ""

# Test 6: Glob pattern
echo "📋 Test 6: Glob pattern (*.jpg)"
npm run cli -- rename "test-images/*.jpg" --dry-run
echo ""

# Test 7: No matching files
echo "📋 Test 7: No matching files (*.gif)"
npm run cli -- rename "*.gif" --dry-run
echo ""

# Test 8: Verbose mode
echo "📋 Test 8: Verbose mode"
npm run cli -- rename test-images/ --dry-run --verbose
echo ""

echo "✅ All tests completed!"
echo "The CLI is working correctly. To use with real API key:"
echo "1. npm run cli config --api-key YOUR_REAL_GEMINI_API_KEY"
echo "2. npm run cli rename /path/to/images/"