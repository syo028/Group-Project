// 簡單的推薦系統測試腳本
// 運行方式: node test-recommendation.js

console.log('=== 推薦系統測試 ===')

console.log('\n推薦系統功能:')
console.log('✓ 標籤相似度計算 (Jaccard 相似度)')
console.log('✓ 內容相似度計算 (關鍵字匹配)')
console.log('✓ 熱門貼文推薦')
console.log('✓ 個人化推薦算法')
console.log('✓ 點讚歷史記錄')

console.log('\nAPI 端點:')
console.log('- GET /api/recommendations/user - 獲取用戶推薦')
console.log('- GET /api/recommendations/similar/:postId - 獲取相似貼文')
console.log('- GET /api/recommendations/like-history - 獲取點讚歷史')
console.log('- GET /api/recommendations/popular - 獲取熱門貼文')

console.log('\n頁面:')
console.log('- /recommendations - 推薦系統頁面')

console.log('\n=== 測試完成 ===')
console.log('\n使用方法:')
console.log('1. 啟動服務器: npm start')
console.log('2. 註冊/登入用戶')
console.log('3. 創建一些貼文並添加標籤')
console.log('4. 點讚一些貼文')
console.log('5. 訪問 /recommendations 查看推薦')
console.log('6. 使用 API 端點獲取 JSON 格式的推薦數據')
