# 推薦系統使用說明

## 功能概述

這個推薦系統基於用戶的點讚行為，使用標籤相似度和內容相似度來推薦相關的貼文。

## 核心功能

### 1. 個人化推薦

- 基於用戶點讚的貼文進行推薦
- 使用標籤相似度 (60% 權重) 和內容相似度 (40% 權重)
- 如果用戶沒有點讚記錄，則推薦熱門貼文

### 2. 相似度算法

- **標籤相似度**: 使用 Jaccard 相似度計算標籤的重疊程度
- **內容相似度**: 基於關鍵字匹配的 Jaccard 相似度
- **綜合分數**: 標籤相似度 × 0.6 + 內容相似度 × 0.4

### 3. 點讚歷史記錄

- 記錄用戶的所有點讚行為
- 包含點讚時間和貼文詳情

## 使用方法

### 1. 啟動服務器

```bash
npm start
```

### 2. 註冊/登入用戶

- 訪問 `/register` 註冊新用戶
- 或訪問 `/login` 登入現有用戶

### 3. 創建貼文

- 訪問 `/create-post/add` 創建新貼文
- 記得添加相關的標籤，例如：`科技,程式設計,JavaScript`

### 4. 點讚貼文

- 在貼文詳情頁面點擊心形圖標進行點讚
- 點讚記錄會自動保存到數據庫

### 5. 查看推薦

- 訪問 `/recommendations` 查看個人化推薦
- 頁面會顯示推薦的貼文和推薦原因

## API 端點

### 1. 獲取用戶推薦

```
GET /api/recommendations/user?limit=10
```

**參數:**

- `limit`: 推薦數量 (預設: 10)

**回應:**

```json
{
  "success": true,
  "data": [
    {
      "post_id": 1,
      "score": 0.75,
      "reason": "標籤相似度: 66.7%, 內容相似度: 25.0%"
    }
  ],
  "user_id": 1
}
```

### 2. 獲取相似貼文

```
GET /api/recommendations/similar/1?limit=5
```

**參數:**

- `postId`: 貼文 ID
- `limit`: 推薦數量 (預設: 5)

### 3. 獲取點讚歷史

```
GET /api/recommendations/like-history
```

**回應:**

```json
{
  "success": true,
  "data": [
    {
      "like_id": 1,
      "post_id": 1,
      "created_at": 1640995200,
      "post": {
        "id": 1,
        "title": "JavaScript 基礎教學",
        "content": "...",
        "tags": "科技,程式設計,JavaScript",
        "like_count": 10,
        "user": { "username": "user1" }
      }
    }
  ],
  "user_id": 1,
  "total_likes": 1
}
```

### 4. 獲取熱門貼文

```
GET /api/recommendations/popular?limit=10
```

## 推薦算法詳解

### 標籤相似度計算

```javascript
// 將標籤字符串轉換為集合
const tags1Set = new Set(
  tags1
    .toLowerCase()
    .split(',')
    .map(t => t.trim()),
)
const tags2Set = new Set(
  tags2
    .toLowerCase()
    .split(',')
    .map(t => t.trim()),
)

// 計算 Jaccard 相似度
const intersection = new Set([...tags1Set].filter(tag => tags2Set.has(tag)))
const union = new Set([...tags1Set, ...tags2Set])
const similarity = intersection.size / union.size
```

### 內容相似度計算

```javascript
// 提取關鍵字（長度 > 2 的單詞）
const words1 = new Set(
  content1
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2),
)
const words2 = new Set(
  content2
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2),
)

// 計算 Jaccard 相似度
const intersection = new Set([...words1].filter(word => words2.has(word)))
const union = new Set([...words1, ...words2])
const similarity = intersection.size / union.size
```

## 數據庫結構

### like 表

- `id`: 主鍵
- `post_id`: 貼文 ID
- `user_id`: 用戶 ID
- `created_at`: 點讚時間

### post 表

- `id`: 主鍵
- `user_id`: 作者 ID
- `tags`: 標籤 (逗號分隔)
- `title`: 標題
- `content`: 內容
- `like_count`: 點讚數
- `comment_count`: 評論數

## 性能優化建議

1. **索引優化**: 在 `like` 表的 `user_id` 和 `post_id` 上建立索引
2. **緩存**: 對於熱門推薦結果可以加入緩存
3. **分頁**: 大量數據時使用分頁加載
4. **異步處理**: 推薦計算可以放在後台任務中

## 擴展功能

### 可能的改進方向

1. **協同過濾**: 基於相似用戶的推薦
2. **深度學習**: 使用神經網絡進行內容理解
3. **實時推薦**: 基於用戶當前行為的即時推薦
4. **多維度評分**: 考慮時間衰減、用戶權重等因素
5. **A/B 測試**: 測試不同推薦算法的效果

### 添加新推薦策略

1. 在 `RecommendationEngine` 類中添加新的方法
2. 在推薦計算中整合新的策略
3. 調整權重分配
4. 更新 API 端點以支持新的參數

## 故障排除

### 常見問題

1. **沒有推薦結果**: 檢查用戶是否有點讚記錄
2. **推薦不準確**: 檢查貼文標籤是否正確設置
3. **API 錯誤**: 確認用戶已登入且參數正確

### 調試方法

1. 檢查瀏覽器開發者工具的 Network 標籤
2. 查看服務器日誌
3. 使用 API 端點直接測試
4. 檢查數據庫中的點讚記錄
