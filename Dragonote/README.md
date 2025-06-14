# Dragonote

一個基於 [ts-liveview](https://github.com/beenotung/ts-liveview/blob/v5-auth-ionic-template/README.md) 開發的社交媒體平台。

## 功能特點

### 用戶功能

- 用戶註冊和登錄
- 個人資料管理
- 查看其他用戶的帖子

### 帖子功能

- 創建新帖子
- 編輯和刪除自己的帖子
- 帖子分類和標籤
- 帖子搜索功能
- 按熱度（點讚數、評論數）排序

### 互動功能

- 點讚功能
  - 可以對帖子進行點讚/取消點讚
  - 顯示點讚數量
  - 即時更新點讚狀態
- 評論功能
  - 在帖子下發表評論
  - 顯示評論數量
  - 評論即時更新
  - 評論時間顯示

### 界面特點

- 響應式設計
- 現代化 UI 界面
- 流暢的動畫效果
- 直觀的用戶交互

## 技術棧

- 前端：TypeScript, React, Ionic
- 後端：Node.js, Express
- 數據庫：SQLite
- 實時通訊：WebSocket

## 安裝和運行

1. 克隆項目

```bash
git clone [項目地址]
cd Dragonote
```

2. 安裝依賴

```bash
npm install
```

3. 初始化數據庫

```bash
./scripts/init.sh
```

4. 運行開發服務器

```bash
npm run dev
```

## 數據庫結構

### 主要表

- `user`: 用戶信息
- `post`: 帖子內容
- `comment`: 評論數據
- `like`: 點讚記錄

### 關聯

- 帖子與用戶：一對多
- 評論與帖子：一對多
- 評論與用戶：一對多
- 點讚與帖子：一對多
- 點讚與用戶：一對多

## 開發進度

- [x] 用戶認證系統
- [x] 帖子發布功能
- [x] 評論系統
- [x] 點讚功能
- [x] 帖子搜索
- [x] 排序功能
- [ ] 用戶關注系統
- [ ] 消息通知
- [ ] 圖片上傳
- [ ] 移動端適配優化

## 貢獻指南

歡迎提交 Pull Request 或創建 Issue 來幫助改進項目。

## 授權

MIT License
