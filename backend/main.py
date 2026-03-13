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
HABIT_FILE = os.path.join(DATA_DIR, "habit_inputs.csv")
SCORES_FILE = os.path.join(DATA_DIR, "scores.csv")


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
    "sleep_quality", "screen_time", "note", "date"
])
create_file(PHYSICAL_FILE, [
    "username", "exercise_minutes", "water_intake",
    "steps", "energy_level", "note", "date"
])
create_file(NUTRITION_FILE, [
    "username", "meal_type", "water_intake", 
    "fruit_veg_servings", "junk_food", "energy_level", "date"
])
create_file(STREAKS_FILE, [
    "username", "streak", "last_login", "activity_dates"
])
create_file(HABIT_FILE, [
    "username", "habit_id", "habit_name", "date"
])
create_file(SCORES_FILE, [
    "username", "date", "mental_score", "physical_score",
    "nutrition_score", "habit_score", "streak_score"
])

def update_daily_score(username: str, module: str, points: int = 20):
    today = str(datetime.now().date())
    scores = []
    updated = False
    
    if os.path.exists(SCORES_FILE):
        with open(SCORES_FILE, "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                scores.append(row)
                
    for row in scores:
        if row["username"] == username and row["date"] == today:
            row[module] = str(points)
            updated = True
            break
            
    if not updated:
        new_row = {
            "username": username,
            "date": today,
            "mental_score": "0",
            "physical_score": "0",
            "nutrition_score": "0",
            "habit_score": "0",
            "streak_score": "0"
        }
        new_row[module] = str(points)
        scores.append(new_row)
        
    with open(SCORES_FILE, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "username", "date", "mental_score", "physical_score", 
            "nutrition_score", "habit_score", "streak_score"
        ])
        writer.writeheader()
        writer.writerows(scores)

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

class HabitInput(BaseModel):
    username: str
    habit_id: str
    habit_name: str


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
            data.note,
            str(datetime.now().date())
        ])
    update_daily_score(data.username, "mental_score", 20)
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
            data.note,
            str(datetime.now().date())
        ])
    update_daily_score(data.username, "physical_score", 20)
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
            data.energy_level,
            str(datetime.now().date())
        ])
    update_daily_score(data.username, "nutrition_score", 20)
    return {"message": "Nutrition input saved"}

# ================= SAVE HABIT INPUT =================
@app.post("/habit")
def save_habit(data: HabitInput):
    with open(HABIT_FILE, "a", newline="") as f:
        csv.writer(f).writerow([
            data.username,
            data.habit_id,
            data.habit_name,
            str(datetime.now().date())
        ])
    update_daily_score(data.username, "habit_score", 20)
    return {"message": "Habit saved"}

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


# ================= WELLNESS SCORE =================
@app.get("/wellness-score/{username}")
def get_wellness_score(username: str):
    today = str(datetime.now().date())
    streak_score = 0
    
    if os.path.exists(STREAKS_FILE):
        with open(STREAKS_FILE, "r", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                if row.get("username") == username and int(row.get("streak", 0)) > 0:
                    streak_score = 20
                    break
                    
    update_daily_score(username, "streak_score", streak_score)

    ms, ps, ns, hs = 0, 0, 0, 0
    if os.path.exists(SCORES_FILE):
        with open(SCORES_FILE, "r") as f:
            for row in csv.DictReader(f):
                if row.get("username") == username and row.get("date") == today:
                    ms = int(row.get("mental_score", 0))
                    ps = int(row.get("physical_score", 0))
                    ns = int(row.get("nutrition_score", 0))
                    hs = int(row.get("habit_score", 0))
                    break
                    
    total = ms + ps + ns + hs + streak_score
    return {
        "mental_score": ms, "physical_score": ps, "nutrition_score": ns,
        "habit_score": hs, "streak_score": streak_score, "total": total
    }

# ================= DAILY MOTIVATION =================
@app.get("/daily-motivation/{username}")
def get_daily_motivation(username: str):
    yesterday = str(datetime.now().date() - timedelta(days=1))
    mood = None
    note = ""
    
    if os.path.exists(MENTAL_FILE):
        with open(MENTAL_FILE, "r") as f:
            for row in csv.DictReader(f):
                if row.get("username") == username and row.get("date") == yesterday:
                    mood = int(row.get("mood", 3))
                    note = row.get("note", "")
                    
    if mood is None:
        return {"message": "A new day is a fresh start! Keep up the great work and prioritize your wellness today! 🌟"}
        
    if "tired" in note.lower() or mood <= 2:
        return {"message": "You mentioned feeling a bit tired yesterday. Take short breaks today and stay hydrated. You are improving step by step! 💙"}
    elif mood >= 4:
        return {"message": "Great progress! Your mood improved yesterday. Keep maintaining your amazing routine! ✨"}
    else:
        return {"message": "Consistency is key! Every small step you take is building a healthier you. Keep it up! 🚀"}

# ================= WEEKLY REPORT =================
@app.get("/weekly-report/{username}")
def get_weekly_report(username: str):
    today = datetime.now().date()
    last_7_days = [str(today - timedelta(days=i)) for i in range(6, -1, -1)]
    
    def get_user_data(file_path):
        data = []
        if os.path.exists(file_path):
            with open(file_path, "r") as f:
                for row in csv.DictReader(f):
                    if row.get("username") == username and row.get("date") in last_7_days:
                        data.append(row)
        return data

    mental_data = get_user_data(MENTAL_FILE)
    physical_data = get_user_data(PHYSICAL_FILE)
    nutrition_data = get_user_data(NUTRITION_FILE)
    habit_data = get_user_data(HABIT_FILE)
    
    tired_days = sum(1 for m in mental_data if int(m.get("mood", 3)) <= 2 or "tired" in m.get("note", "").lower())
    user_summary = f"This week you reported feeling tired or down on {tired_days} days." if tired_days > 0 else "This week you had consistently positive or neutral energy!"
    
    avg_sleep = sum(int(m.get("sleep_quality", 3)) for m in mental_data) / max(len(mental_data), 1)
    suggestion = "Try sleeping earlier and reduce screen time." if avg_sleep < 3 else "You're getting good sleep. Keep up your healthy routines!"
    
    motivation = "Small improvements lead to big lifestyle changes."
    
    graph_data = []
    for d in last_7_days:
        dm = next((m for m in mental_data if m["date"] == d), None)
        dp = next((p for p in physical_data if p["date"] == d), None)
        dn = next((n for n in nutrition_data if n["date"] == d), None)
        dh = next((h for h in habit_data if h["date"] == d), None)
        
        n_score = 0
        if dn:
            n_score = 10 if dn.get("junk_food", "No") == "No" else 5
            n_score += int(dn.get("fruit_veg_servings", 0)) * 2
            n_score += min(5, int(dn.get("water_intake", 0)))
            
        graph_data.append({
            "date": d,
            "mood": int(dm["mood"]) * 20 if dm else 0,
            "activity_minutes": int(dp["exercise_minutes"]) if dp else 0,
            "nutrition_score": n_score * 5,
            "habits_completed": 1 if dh else 0
        })

    return {
        "user_summary": user_summary,
        "suggestion": suggestion,
        "motivation": motivation,
        "graph_data": graph_data
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