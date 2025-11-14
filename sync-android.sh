#!/bin/bash

# Script để sync code đã sửa qua Android
echo "🔧 Building updated code..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📱 Syncing to Android..."
    npx cap sync android
    
    if [ $? -eq 0 ]; then
        echo "✅ Sync to Android successful!"
        echo ""
        echo "🚀 Bây giờ bạn có thể:"
        echo "1. Quay lại Android Studio"
        echo "2. Click Run (▶️) để test thay đổi"
        echo "3. Hoặc chạy: ./open-android.sh để mở lại Android Studio"
    else
        echo "❌ Sync failed!"
    fi
else
    echo "❌ Build failed! Check for errors above."
fi