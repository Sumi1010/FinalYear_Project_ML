from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import csv
import os
import joblib
import re
from datetime import datetime, timedelta
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
PHYSICAL_FILE = os.path.join(DATA_DIR, "physical_inputs.csv")
NUTRITION_FILE = os.path.join(DATA_DIR, "nutrition_inputs.csv")
STREAKS_FILE = os.path.join(DATA_DIR, "streaks.csv")


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
create_file(PHYSICAL_FILE, [
    "username", "exercise_minutes", "water_intake",
    "steps", "energy_level", "note"
])
create_file(NUTRITION_FILE, [
    "username", "meal_type", "water_intake", 
    "fruit_veg_servings", "junk_food", "energy_level"
])
create_file(STREAKS_FILE, [
    "username", "streak", "last_login", "activity_dates"
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

class PhysicalInputModel(BaseModel):
    username: str
    exercise_minutes: int
    water_intake: float
    steps: int
    energy_level: int
    note: Optional[str] = ""

class NutritionInputModel(BaseModel):
    username: str
    meal_type: str
    water_intake: int
    fruit_veg_servings: int
    junk_food: str
    energy_level: str


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

# ================= SAVE PHYSICAL INPUT =================
@app.post("/physical")
def save_physical(data: PhysicalInputModel):
    with open(PHYSICAL_FILE, "a", newline="") as f:
        csv.writer(f).writerow([
            data.username,
            data.exercise_minutes,
            data.water_intake,
            data.steps,
            data.energy_level,
            data.note
        ])
    return {"message": "Physical input saved"}

# ================= SAVE NUTRITION INPUT =================
@app.post("/nutrition")
def save_nutrition(data: NutritionInputModel):
    with open(NUTRITION_FILE, "a", newline="") as f:
        csv.writer(f).writerow([
            data.username,
            data.meal_type,
            data.water_intake,
            data.fruit_veg_servings,
            data.junk_food,
            data.energy_level
        ])
    return {"message": "Nutrition input saved"}

# ================= STREAK SYSTEM =================
def get_streak_badge(streak: int) -> str:
    if streak >= 30:
        return "Wellness Master 🥇"
    elif streak >= 14:
        return "Consistent 🥈"
    elif streak >= 7:
        return "Beginner 🏅"
    else:
        return "Getting Started"

@app.get("/streak/{username}")
def get_streak(username: str):
    today = datetime.now().date()
    yesterday = today - timedelta(days=1)
    
    streak_data = {}
    if os.path.exists(STREAKS_FILE):
        with open(STREAKS_FILE, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                streak_data[row["username"]] = row
                
    if username in streak_data:
        user_streak = streak_data[username]
        last_login_str = user_streak["last_login"]
        streak_count = int(user_streak["streak"])
        activity_dates = user_streak["activity_dates"].split("|") if user_streak["activity_dates"] else []
        
        last_login_date = datetime.strptime(last_login_str, "%Y-%m-%d").date() if last_login_str else None
        
        if last_login_date == yesterday:
            streak_count += 1
        elif last_login_date == today:
            pass
        else:
            streak_count = 1
            
        if str(today) not in activity_dates:
            activity_dates.append(str(today))
            
    else:
        streak_count = 1
        activity_dates = [str(today)]
        
    badge = get_streak_badge(streak_count)
    
    streak_data[username] = {
        "username": username,
        "streak": str(streak_count),
        "last_login": str(today),
        "activity_dates": "|".join(activity_dates)
    }
    
    with open(STREAKS_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["username", "streak", "last_login", "activity_dates"])
        writer.writeheader()
        for row in streak_data.values():
            writer.writerow(row)
            
    return {
        "username": username,
        "streak": streak_count,
        "badge": badge,
        "activity_dates": activity_dates
    }


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