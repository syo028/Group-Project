import pandas as pd
from sklearn.cluster import KMeans
import numpy as np

# 假資料：用戶行為
np.random.seed(42)
user_count = 20
users = [f'user_{i+1}' for i in range(user_count)]
data = {
    'user': users,
    'like_count': np.random.randint(0, 50, user_count),
    'comment_count': np.random.randint(0, 30, user_count),
    'view_count': np.random.randint(10, 200, user_count),
}
df = pd.DataFrame(data)

# K-means 分群
features = ['like_count', 'comment_count', 'view_count']
k = 3  # 分3群
kmeans = KMeans(n_clusters=k, random_state=42)
df['cluster'] = kmeans.fit_predict(df[features])

# 輸出每個用戶所屬群組
print(df[['user', 'like_count', 'comment_count', 'view_count', 'cluster']]) 