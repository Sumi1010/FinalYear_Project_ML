import pandas as pd

# Load dataset (absolute path is OK)
df = pd.read_csv(r"D:\my folder\Personalized_App\data\kaggle_raw.csv", encoding="latin1")

# Drop unwanted columns
df = df.drop(columns=[
    "textID",
    "Population -2020",
    "Land Area (Km²)",
    "Density (P/Km²)"
])

# Rename columns
df = df.rename(columns={
    "Time of Tweet": "tweet_time",
    "Age of User": "age",
    "Country": "country"
})

# Drop rows with missing text or sentiment
df = df.dropna(subset=["text", "sentiment"])

# 🔹 Convert age ranges to numeric values
age_mapping = {
    "0-20": 10,
    "21-30": 25,
    "31-45": 38,
    "46-60": 53,
    "60-70": 65,
    "70-100": 85
}

df["age"] = df["age"].map(age_mapping)

# Fill missing age values
df["age"] = df["age"].fillna(df["age"].median())

# Normalize sentiment text
df["sentiment"] = df["sentiment"].str.lower()

# Save cleaned data
df.to_csv(r"D:\my folder\Personalized_App\data\kaggle_cleaned.csv", index=False)

print("✅ Dataset cleaned successfully")
print(df.head())
print(df.isnull().sum())
print(df.shape)
