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

from typing import Optional

# ================= APP =================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= FILE SETUP =================
DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)

USERS_FILE = os.path.join(DATA_DIR, "users.csv")
PROFILE_FILE = os.path.join(DATA_DIR, "profiles.csv")
MENTAL_FILE = os.path.join(DATA_DIR, "mental_inputs.csv")

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
create_file(MENTAL_FILE, [
    "username", "mood", "stress",
    "sleep_quality", "screen_time", "note"
])

# ================= MODELS =================
class User(BaseModel):
    username: str
    password: str

class Profile(BaseModel):
    
    age_category: Optional[str] = ""
    gender: Optional[str] = ""
    wakeup_time: Optional[str] = ""
    sleep_time: Optional[str] = ""
    interests: List[str] = []

# ✅ Modified MentalInput
class MentalInput(BaseModel):
    username: str
    mood: int
    stress: int
    sleep_quality: int
    screen_time: float
    note: Optional[str] = ""

# ================= ROOT =================
@app.get("/")
def root():
    return {"status": "Backend running"}

# ================= AUTH =================
@app.post("/signup")
def signup(user: User):
    with open(USERS_FILE, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row["username"] == user.username:
                raise HTTPException(status_code=400, detail="User already exists")

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

    raise HTTPException(status_code=401, detail="Invalid credentials")

# ================= PROFILE =================
# ================= PROFILE =================

class Profile(BaseModel):
    age_category: str
    gender: str
    wakeup_time: str
    sleep_time: str
    interests: List[str] = []

@app.post("/profile/{username}")
def save_profile(username: str, profile: Profile):

    if not username:
        raise HTTPException(status_code=400, detail="Username required")

    with open(PROFILE_FILE, "a", newline="") as f:
        csv.writer(f).writerow([
            username,  # username from URL
            profile.age_category,
            profile.gender,
            profile.wakeup_time,
            profile.sleep_time,
            "|".join(profile.interests)
        ])

    return {"message": "Profile saved"}

# ================= SAVE MENTAL INPUT =================
@app.post("/mental")
def save_mental(data: MentalInput):
    with open(MENTAL_FILE, "a", newline="") as f:
        csv.writer(f).writerow([
            data.username,
            data.mood,
            data.stress,
            data.sleep_quality,
            data.screen_time,
            data.note
        ])
    return {"message": "Mental input saved"}

# ================= LOAD ML MODELS =================
mood_model = joblib.load("ml/mood_model.pkl")

text_model = joblib.load("ml/mood_model.pkl")
text_vectorizer = joblib.load("ml/vectorizer.pkl")

# ================= PREDICT =================
@app.post("/predict")
def predict_and_recommend(data: MentalInput):

    # NLP sentiment
    polarity, sentiment_label = analyze_text_sentiment(data.note)
    text_score = text_to_score(polarity)

    # ML prediction
    X = [[data.mood, data.stress, data.screen_time]]
    mood_pred = float(mood_model.predict(X)[0])
    sleep_pred = float(sleep_model.predict(X)[0])

    # Recommendation
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

# ================= GAME RECOMMENDATION =================
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
def recommend_game(data: MentalInput):

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