#!/bin/bash

echo "🚀 IvyCore Testing Guide"
echo "========================"
echo ""

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode not found. Please install Xcode from the App Store."
    exit 1
fi

echo "✅ Xcode found"
echo ""

# Navigate to project directory
cd "$(dirname "$0")/IvyCore"

echo "📁 Project directory: $(pwd)"
echo ""

# Check if project file exists
if [ ! -f "IvyCore.xcodeproj/project.pbxproj" ]; then
    echo "❌ Xcode project not found!"
    exit 1
fi

echo "✅ Xcode project found"
echo ""

# Open in Xcode
echo "🔧 Opening IvyCore in Xcode..."
open IvyCore.xcodeproj

echo ""
echo "📱 Testing Instructions:"
echo "========================"
echo ""
echo "1. Wait for Xcode to open the project"
echo "2. Select a simulator (iPhone 15 or iPad)"
echo "3. Click the ▶️ Run button (or press Cmd+R)"
echo "4. The app will build and launch in the simulator"
echo ""
echo "🎯 What to Test:"
echo "==============="
echo ""
echo "✅ Onboarding flow"
echo "✅ Home screen with streak/XP"
echo "✅ Lesson flow (Teach → Quiz → Review)"
echo "✅ Different question types (MCQ, Cloze, Ordering, Free Response)"
echo "✅ Progress tracking"
echo "✅ Settings and notifications"
echo ""
echo "🐛 If you encounter errors:"
echo "==========================="
echo "1. Clean Build Folder (Cmd+Shift+K)"
echo "2. Clear DerivedData: rm -rf ~/Library/Developer/Xcode/DerivedData"
echo "3. Restart Xcode"
echo "4. Try building again"
echo ""
echo "📚 The app includes:"
echo "==================="
echo "• 100+ learning blocks with teaching content"
echo "• 4 question types with immediate feedback"
echo "• Spaced repetition system (SRS)"
echo "• Gamification (XP, levels, streaks)"
echo "• Offline-first architecture"
echo "• ChatGPT integration for question generation"
echo ""
echo "Happy testing! 🎉"
