import pandas as pd
import re
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# =========================
# 1. LOAD DATASET
# =========================
df = pd.read_csv(
    r"D:\my folder\Personalized_App\data\kaggle_raw.csv",
    encoding="latin1"
)

# =========================
# 2. KEEP ONLY REQUIRED COLUMNS
# =========================
df = df[["text", "sentiment"]]
df = df.dropna()

df["sentiment"] = df["sentiment"].str.lower()

# =========================
# 3. TEXT CLEANING
# =========================
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"@\w+", "", text)
    text = re.sub(r"#\w+", "", text)
    text = re.sub(r"[^a-z\s]", "", text)
    return text.strip()

df["clean_text"] = df["text"].apply(clean_text)

# =========================
# 4. EMOTION LABEL CREATION
# =========================
def assign_emotion(row):
    text = row["clean_text"]
    sent = row["sentiment"]

    if sent == "negative":
        if any(w in text for w in ["stress", "pressure", "burnout"]):
            return "stressed"
        if any(w in text for w in ["anxious", "worried", "panic"]):
            return "anxious"
        if any(w in text for w in ["tired", "sleepy", "exhausted"]):
            return "tired"
        return "emotionally_overwhelmed"

    if sent == "neutral":
        return "low_focus"

    if sent == "positive":
        return "positive"

    return "unknown"

df["emotion"] = df.apply(assign_emotion, axis=1)
df = df[df["emotion"] != "unknown"]

# =========================
# =========================
# 5. FINAL ML DATASET
# =========================
df_ml = df[["clean_text", "emotion"]]
df_ml = (
    df_ml
    .groupby("emotion", group_keys=False)
    .apply(lambda x: x.sample(min(len(x), 500)))
    .reset_index(drop=True)
)


df_ml.to_csv(
    r"D:\my folder\Personalized_App\data\wellbeing_ml_ready.csv",
    index=False
)

print("✅ ML dataset ready")
print(df_ml.columns)

# =========================
# 6. TF-IDF + LOGISTIC REGRESSION
# =========================
X = df_ml["clean_text"]
y = df_ml["emotion"]

vectorizer = TfidfVectorizer(
    stop_words="english",
    ngram_range=(1, 2),
    max_features=5000
)

X_vec = vectorizer.fit_transform(X)

model = LogisticRegression(max_iter=1000)
model.fit(X_vec, y)

joblib.dump(model, "ml/mood_model.pkl")
joblib.dump(vectorizer, "ml/vectorizer.pkl")

print("✅ Model trained & saved")

# =========================
# 7. GAME RECOMMENDATION
# =========================
GAME_MAP = {
    "stressed": ("Your mind feels overloaded 🌿", "breathing"),
    "anxious": ("Let’s ground your thoughts 🌱", "breathing"),
    "low_focus": ("Let’s sharpen your focus 🎯", "focus"),
    "emotionally_overwhelmed": ("Express what you feel 💙", "scribble"),
    "tired": ("Slow down and relax 🌙", "breathing"),
    "positive": ("Stay in the flow ✨", "focus")
}

def recommend_game(user_text):
    clean = clean_text(user_text)
    vec = vectorizer.transform([clean])
    emotion = model.predict(vec)[0]
    confidence = float(max(model.predict_proba(vec)[0]))


    text, game = GAME_MAP.get(emotion, ("Relax and breathe 🌿", "breathing"))

    return {
        "emotion": emotion,
        "confidence": round(confidence, 2),
        "recommendation_text": text,
        "game": game
    }

# =========================
# 8. TEST
# =========================
print(recommend_game("I feel very stressed and overwhelmed today"))
