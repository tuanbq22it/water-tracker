#!/bin/bash

# Script để mở Android Studio với project Water Tracker
export CAPACITOR_ANDROID_STUDIO_PATH="/home/qutuan/Downloads/android-studio-2025.2.1.7-linux/android-studio/bin/studio.sh"

echo "🚀 Opening Water Tracker in Android Studio..."
npx cap open android

echo "✅ Android Studio opened!"
echo ""
echo "📱 Để chạy app trên điện thoại:"
echo "1. Kết nối điện thoại qua USB"
echo "2. Bật Developer Options + USB Debugging"
echo "3. Trong Android Studio: Click Run (▶️) button"
echo ""
echo "📱 Để chạy trên emulator:"
echo "1. Trong Android Studio: Tools → Device Manager"
echo "2. Tạo Virtual Device"
echo "3. Click Run (▶️) button"