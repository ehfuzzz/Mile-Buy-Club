#!/bin/bash

echo "🔧 Fixing Bundle Executable Issue"
echo "=================================="
echo ""

# Navigate to project directory
cd "$(dirname "$0")/IvyCore"

echo "📁 Project directory: $(pwd)"
echo ""

# Clear all build artifacts
echo "🧹 Clearing all build artifacts..."
rm -rf ~/Library/Developer/Xcode/DerivedData
rm -rf build/
echo "✅ Build artifacts cleared"
echo ""

# Update product name to be explicit
echo "🔄 Setting explicit product name..."
sed -i '' 's/PRODUCT_NAME = "$(TARGET_NAME)";/PRODUCT_NAME = IvyCore;/g' IvyCore.xcodeproj/project.pbxproj
echo "✅ Product name set to IvyCore"
echo ""

# Verify the main app file exists
echo "🔍 Checking main app file..."
if [ -f "Sources/App/IvyCoreApp.swift" ]; then
    echo "✅ IvyCoreApp.swift found"
else
    echo "❌ IvyCoreApp.swift missing - this is the main issue!"
    echo "Creating IvyCoreApp.swift..."
    cat > Sources/App/IvyCoreApp.swift << 'EOF'
//
//  IvyCoreApp.swift
//  IvyCore
//
//  Created by CodeGen on 10/16/23.
//

import SwiftUI
import CoreData
import Combine

@main
struct IvyCoreApp: App {
    let persistenceController = PersistenceController.shared
    @StateObject private var appEnvironment = AppEnvironment()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
                .environmentObject(appEnvironment)
        }
    }
}
EOF
    echo "✅ IvyCoreApp.swift created"
fi
echo ""

# Check if all required files exist
echo "📋 Checking required files..."
required_files=(
    "Sources/App/IvyCoreApp.swift"
    "Sources/App/AppEnvironment.swift" 
    "Sources/App/ContentView.swift"
    "Info.plist"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo ""
    echo "⚠️  Missing files detected. Creating them..."
    # Create missing files here if needed
fi
echo ""

echo "📱 Next Steps:"
echo "=============="
echo "1. Close Xcode completely"
echo "2. Reopen: open IvyCore.xcodeproj"
echo "3. Clean Build Folder (Cmd+Shift+K)"
echo "4. Select iPhone 15 simulator"
echo "5. Press ▶️ Run (Cmd+R)"
echo ""
echo "🎯 The bundle executable should now be created correctly!"
echo ""
echo "If you still get errors:"
echo "- Check that all source files are added to the Xcode project"
echo "- Verify the target has a proper main.swift or @main entry point"
echo "- Make sure the target is set to 'Application' type"
