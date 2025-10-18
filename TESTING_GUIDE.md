# 🧪 IvyCore Testing Guide

## 🚀 Quick Start

1. **Open Xcode**: The project should now be open in Xcode
2. **Select Simulator**: Choose iPhone 15 or iPad from the device dropdown
3. **Build & Run**: Press ▶️ or `Cmd+R`
4. **Wait**: Let Xcode build the project (may take 1-2 minutes first time)

## 📱 What You'll See

### **1. Onboarding Flow**
- Welcome screen with app introduction
- Goal setting (target date, daily minutes)
- Topic selection (Accounting, Valuation, DCF, etc.)
- Notification permissions

### **2. Home Screen**
- **🔥 Streak counter** (starts at 0)
- **⭐ XP & Level** (Level 1, 0 XP)
- **📊 Daily goal progress** (0/X minutes)
- **▶️ Continue Lesson button** (main CTA)
- **⚡ Quick Sessions** (5, 10, 15 minutes)

### **3. Lesson Flow**
1. **📚 TEACH Phase**:
   - Block title (e.g., "The 3 Financial Statements")
   - Numbered teaching bullets (1. 2. 3. 4.)
   - Real examples with numbers
   - 60-second timer
   - "Start Quiz" button

2. **🧠 QUIZ Phase**:
   - **Multiple Choice**: 4 options, select one
   - **Cloze**: Fill in the blank
   - **Ordering**: Arrange steps in sequence
   - **Free Response**: Write short explanation
   - Immediate feedback (correct/incorrect)

3. **📈 REVIEW Phase**:
   - Self-assessment: "Wrong", "Unsure", "Got it!"
   - XP earned display
   - Accuracy percentage
   - Continue to next question

### **4. Progress Tracking**
- XP points earned per correct answer
- Level progression (500 XP per level)
- Streak maintenance
- Accuracy tracking
- Time spent studying

## 🎯 Key Features to Test

### **Learning Content**
- ✅ **100+ blocks** with comprehensive teaching material
- ✅ **Real examples** with concrete numbers
- ✅ **Progressive difficulty** (Beginner → Advanced)
- ✅ **Concept tagging** for targeted review

### **Question Types**
- ✅ **MCQ**: "Which statement shows profitability over a period?"
- ✅ **Cloze**: "Assets = Liabilities + ______"
- ✅ **Ordering**: "Place end-to-end reporting flow in order"
- ✅ **Free Response**: "Explain why cash is subtracted in EV calculation"

### **Gamification**
- ✅ **XP System**: Earn points for correct answers
- ✅ **Leveling**: Unlock content as you progress
- ✅ **Streaks**: Daily study motivation
- ✅ **Haptic Feedback**: Tactile engagement

### **Smart Features**
- ✅ **SRS Scheduling**: Cards appear when due
- ✅ **Follow-up Questions**: Wrong answer recovery
- ✅ **Offline Operation**: Works without internet
- ✅ **ChatGPT Integration**: AI-generated questions

## 🐛 Troubleshooting

### **Build Errors**
```bash
# Clean build folder
Cmd+Shift+K

# Clear derived data
rm -rf ~/Library/Developer/Xcode/DerivedData

# Restart Xcode
# Try building again
```

### **Common Issues**
1. **Missing files**: Ensure all Sources files are in Xcode
2. **Import errors**: Check that all imports are correct
3. **Simulator issues**: Try different simulator or restart
4. **Performance**: Close other apps, restart simulator

### **If App Crashes**
1. Check Xcode console for error messages
2. Look for missing dependencies
3. Verify all source files are included
4. Try clean build

## 📊 Expected Behavior

### **First Launch**
- Onboarding flow appears
- User sets goals and preferences
- Home screen shows with 0 streak, Level 1

### **First Lesson**
- "Continue Lesson" button starts session
- Teach phase shows numbered bullets
- Quiz phase presents questions
- Review phase shows results

### **Progress Tracking**
- XP increases with correct answers
- Streak builds with daily use
- Level increases every 500 XP
- Accuracy improves over time

## 🎓 Curriculum Coverage

### **Topics Available**
1. **Accounting** (Basic & Advanced) - 24 blocks
2. **Enterprise Value** - 16 blocks
3. **Valuation** - 12 blocks
4. **DCF** - 9 blocks
5. **M&A** - 10 blocks
6. **LBO** - 10 blocks
7. **Brain Teasers** - 6 blocks

### **Sample Content**
- **Block A1**: "The 3 Financial Statements (what/why)"
- **Block A7**: "$10 Depreciation Walk-Through (IS→CF→BS)"
- **Block V1**: "Core Methods: Comps, Precedents, DCF"
- **Block D1**: "Unlevered vs Levered FCF"

## 🚀 Next Steps

1. **Test all question types** in a single session
2. **Complete multiple lessons** to see progression
3. **Test offline mode** (airplane mode)
4. **Check notifications** (if enabled)
5. **Explore settings** and customization options

## 📱 Simulator Tips

- **Rotate device**: Test landscape mode
- **Different sizes**: Try iPhone SE, iPhone 15 Pro Max
- **Accessibility**: Test VoiceOver and Dynamic Type
- **Performance**: Monitor memory usage and battery

Happy testing! 🎉
