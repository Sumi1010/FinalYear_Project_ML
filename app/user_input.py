import pandas as pd
import os
from datetime import datetime

# Correct path to CSV file
DATA_PATH = r"D:\my folder\Personalized_App\data\user_daily_inputs.csv"

def get_user_input():
    print("\n----- Daily User Input -----")

    mood = int(input("Enter mood level (1-5): "))
    stress = int(input("Enter stress level (1-5): "))
    sleep = int(input("Enter sleep quality (1-5): "))
    screen_time = float(input("Enter screen time (in hours): "))
    text_input = input("Optional text (how do you feel today?): ")

    date = datetime.now().strftime("%Y-%m-%d")

    data = {
        "date": [date],
        "mood_level": [mood],
        "stress_level": [stress],
        "sleep_quality": [sleep],
        "screen_time": [screen_time],
        "text_input": [text_input]
    }

    return pd.DataFrame(data)


def save_to_csv(df):
    # If file exists, append
    if os.path.exists(DATA_PATH):
        df.to_csv(DATA_PATH, mode="a", header=False, index=False)
    else:
        # First time → create file with header
        df.to_csv(DATA_PATH, index=False)

    print("\n✅ User input saved successfully!")


if __name__ == "__main__":
    df = get_user_input()
    save_to_csv(df)
