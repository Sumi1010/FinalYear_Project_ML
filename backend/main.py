from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import csv
import os
import joblib
import re
from nlp_utils import analyze_text_sentiment
from scoring import text_to_score
from recommendations import generate_catchy_recommendations
# ================= ML (TEXT → GAME) =================


# ================= APP =================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= FILE SETUP =================
DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)

USERS_FILE = os.path.join(DATA_DIR, "users.csv")
PROFILE_FILE = os.path.join(DATA_DIR, "profiles.csv")
DAILY_FILE = os.path.join(DATA_DIR, "daily_inputs.csv")

def create_file(path, headers):
    if not os.path.exists(path):
        with open(path, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(headers)

create_file(USERS_FILE, ["username", "password"])
create_file(PROFILE_FILE, [
    "username", "age_category", "gender",
    "wakeup_time", "sleep_time", "interests"
])
create_file(DAILY_FILE, [
    "username", "mood", "stress", "sleep_quality",
    "screen_time", "physical_activity", "water_intake", "note"
])

# ================= MODELS =================
class User(BaseModel):
    username: str
    password: str

class Profile(BaseModel):
    username: str
    age_category: str
    gender: str
    wakeup_time: str
    sleep_time: str
    interests: List[str] = []   # IMPORTANT → avoids 422

class DailyInput(BaseModel):
    username: str
    mood: int
    stress: int
    sleep_quality: int
    screen_time: float
    physical_activity: Optional[str] = ""
    water_intake: int
    note: Optional[str] = ""

# ================= ROUTES =================
@app.get("/")
def root():
    return {"status": "Backend running"}

# ---------- AUTH ----------
@app.post("/signup")
def signup(user: User):
    with open(USERS_FILE, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row["username"] == user.username:
                raise HTTPException(400, "User already exists")

    with open(USERS_FILE, "a", newline="") as f:
        csv.writer(f).writerow([user.username, user.password])

    return {"message": "Signup successful"}

@app.post("/login")
def login(user: User):
    with open(USERS_FILE, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row["username"] == user.username and row["password"] == user.password:
                return {"message": "Login successful"}

    raise HTTPException(401, "Invalid credentials")

# ---------- PROFILE ----------
@app.post("/profile")
def save_profile(profile: Profile):
    with open(PROFILE_FILE, "a", newline="") as f:
        csv.writer(f).writerow([
            profile.username,
            profile.age_category,
            profile.gender,
            profile.wakeup_time,
            profile.sleep_time,
            "|".join(profile.interests)
        ])
    return {"message": "Profile saved"}

# ---------- DAILY INPUT ----------
@app.post("/daily")
def save_daily(data: DailyInput):
    with open(DAILY_FILE, "a", newline="") as f:
        csv.writer(f).writerow([
            data.username,
            data.mood,
            data.stress,
            data.sleep_quality,
            data.screen_time,
            data.physical_activity,
            data.water_intake,
            data.note
        ])
    return {"message": "Daily input saved"}
@app.post("/predict")
def predict_and_recommend(data: DailyInput):

    # NLP
    polarity, sentiment_label = analyze_text_sentiment(data.note)
    text_score = text_to_score(polarity)

    # ML
    X = [[data.mood, data.stress, data.screen_time]]
    mood_pred = float(mood_model.predict(X)[0])
    sleep_pred = float(sleep_model.predict(X)[0])

    # Recommendations
    recommendations = generate_catchy_recommendations(
        mood_pred,
        sleep_pred,
        data.stress,
        data.screen_time,
        text_score,
        sentiment_label
    )

    return {
        "sentiment": sentiment_label,
        "text_score": text_score,
        "predicted_mood": round(mood_pred, 2),
        "predicted_sleep": round(sleep_pred, 2),
        "recommendations": recommendations
    }
text_model = joblib.load("ml/mood_model.pkl")
text_vectorizer = joblib.load("ml/vectorizer.pkl")
def clean_text(text: str):
    text = text.lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"@\w+", "", text)
    text = re.sub(r"#\w+", "", text)
    text = re.sub(r"[^a-z\s]", "", text)
    return text.strip()
GAME_MAP = {
    "stressed": ("Your mind feels overloaded 🌿", "breathing"),
    "anxious": ("Let’s ground your thoughts 🌱", "breathing"),
    "low_focus": ("Let’s sharpen your focus 🎯", "focus"),
    "emotionally_overwhelmed": ("Express what you feel 💙", "scribble"),
    "tired": ("Slow down and relax 🌙", "breathing"),
    "positive": ("Stay in the flow ✨", "focus"),
}
@app.post("/recommend-game")
def recommend_game(data: DailyInput):
    """
    ML‑based game recommendation from user's free‑text note
    """

    clean = clean_text(data.note)
    vec = text_vectorizer.transform([clean])

    emotion = text_model.predict(vec)[0]
    confidence = float(max(text_model.predict_proba(vec)[0]))

    rec_text, game = GAME_MAP.get(
        emotion,
        ("Relax and breathe 🌿", "breathing")
    )

    return {
        "emotion": emotion,
        "confidence": round(confidence, 2),
        "text": rec_text,
        "game": game
    }




