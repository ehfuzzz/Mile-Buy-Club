#!/bin/bash

echo "🔧 Final Fix for Bundle Executable"
echo "==================================="
echo ""

# Navigate to project directory
cd "$(dirname "$0")/IvyCore"

echo "📁 Project directory: $(pwd)"
echo ""

# Clear all build artifacts completely
echo "🧹 Clearing ALL build artifacts..."
rm -rf ~/Library/Developer/Xcode/DerivedData
rm -rf build/
rm -rf *.app
echo "✅ All build artifacts cleared"
echo ""

# Ensure EXECUTABLE_NAME is set correctly
echo "🔧 Setting EXECUTABLE_NAME..."
sed -i '' '/PRODUCT_NAME = IvyCore;/a\
                                EXECUTABLE_NAME = IvyCore;' IvyCore.xcodeproj/project.pbxproj
echo "✅ EXECUTABLE_NAME set to IvyCore"
echo ""

# Verify the main app file has @main
echo "🔍 Checking main app file..."
if grep -q "@main" Sources/App/IvyCoreApp.swift; then
    echo "✅ @main entry point found"
else
    echo "❌ @main entry point missing - fixing..."
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
    echo "✅ @main entry point added"
fi
echo ""

# Check build settings
echo "📋 Verifying build settings..."
if grep -q "EXECUTABLE_NAME = IvyCore" IvyCore.xcodeproj/project.pbxproj; then
    echo "✅ EXECUTABLE_NAME is set"
else
    echo "❌ EXECUTABLE_NAME not found"
fi

if grep -q "PRODUCT_NAME = IvyCore" IvyCore.xcodeproj/project.pbxproj; then
    echo "✅ PRODUCT_NAME is set"
else
    echo "❌ PRODUCT_NAME not found"
fi

if grep -q "com.apple.product-type.application" IvyCore.xcodeproj/project.pbxproj; then
    echo "✅ Product type is application"
else
    echo "❌ Product type not set correctly"
fi
echo ""

echo "📱 Final Steps:"
echo "=============="
echo "1. Close Xcode completely"
echo "2. Wait 5 seconds"
echo "3. Reopen: open IvyCore.xcodeproj"
echo "4. Clean Build Folder (Cmd+Shift+K)"
echo "5. Select iPhone 15 simulator"
echo "6. Press ▶️ Run (Cmd+R)"
echo ""
echo "🎯 This should create IvyCore.app/IvyCore executable correctly!"
echo ""
echo "If it still fails:"
echo "- Check Xcode console for compilation errors"
echo "- Verify all source files are added to the target"
echo "- Make sure no duplicate @main entry points exist"
