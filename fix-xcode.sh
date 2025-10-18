#!/bin/bash

echo "🔧 Fixing Xcode Project Issues"
echo "=============================="
echo ""

# Navigate to project directory
cd "$(dirname "$0")/IvyCore"

echo "📁 Project directory: $(pwd)"
echo ""

# Clear derived data
echo "🧹 Clearing Xcode derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData
echo "✅ Derived data cleared"
echo ""

# Update project file references
echo "🔄 Updating project references..."
sed -i '' 's/IBLingo/IvyCore/g' IvyCore.xcodeproj/project.pbxproj
echo "✅ Project file updated"
echo ""

# Verify changes
echo "🔍 Verifying changes..."
if grep -q "IvyCore" IvyCore.xcodeproj/project.pbxproj; then
    echo "✅ IvyCore references found in project file"
else
    echo "❌ No IvyCore references found"
fi
echo ""

echo "📱 Next Steps:"
echo "=============="
echo "1. Close Xcode if it's open"
echo "2. Reopen the project: open IvyCore.xcodeproj"
echo "3. Clean Build Folder (Cmd+Shift+K)"
echo "4. Select iPhone 15 simulator"
echo "5. Press ▶️ Run (Cmd+R)"
echo ""
echo "🎯 The app should now build and run as IvyCore!"
echo ""
echo "If you still get errors:"
echo "- Try Product → Clean Build Folder"
echo "- Restart Xcode completely"
echo "- Check that all source files are included in the project"
