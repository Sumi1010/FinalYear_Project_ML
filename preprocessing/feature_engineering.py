import os
import pandas as pd
from sklearn.preprocessing import LabelEncoder

INPUT_PATH = "D:\my folder\Personalized_App\data\kaggle_cleaned.csv"
OUTPUT_PATH = "D:\my folder\Personalized_App\data\hybrid_feature.csv"

df = pd.read_csv(INPUT_PATH)

sentiment_map = {
    "negative": 0,
    "neutral": 1,
    "positive": 2
}
df["sentiment"] = df["sentiment"].map(sentiment_map)

time_map = {
    "morning": 0,
    "noon": 1,
    "night": 2
}
df["tweet_time"] = df["tweet_time"].map(time_map)

le = LabelEncoder()
df["country"] = le.fit_transform(df["country"])

df["age"] = df["age"] / df["age"].max()

final_df = df[["sentiment", "tweet_time", "age", "country"]]

os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
final_df.to_csv(OUTPUT_PATH, index=False)

print(final_df.head())
print(final_df.shape)
