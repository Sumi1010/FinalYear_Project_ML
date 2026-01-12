import streamlit as st
import pandas as pd
import os

USER_FILE = "data/user_profile.csv"

st.title("User Login / Signup")

# Ensure CSV file exists
if not os.path.exists(USER_FILE):
    df = pd.DataFrame(columns=[
        "username",
        "password",
        "age",
        "gender",
        "wakeup_time",
        "sleep_time",
        "notifications"
    ])
    df.to_csv(USER_FILE, index=False)

# Input fields
username = st.text_input("Username")
password = st.text_input("Password", type="password")

age = st.number_input("Age", min_value=10, max_value=100)
gender = st.selectbox("Gender", ["Male", "Female", "Other"])
wakeup = st.time_input("Wake-up Time")
sleep = st.time_input("Sleep Time")
notify = st.checkbox("Enable Notifications")

# Register button
if st.button("Register"):
    if username == "" or password == "":
        st.warning("Username and Password cannot be empty")
    else:
        df = pd.read_csv(USER_FILE)

        if username in df["username"].values:
            st.warning("Username already exists")
        else:
            new_user = {
                "username": username,
                "password": password,
                "age": age,
                "gender": gender,
                "wakeup_time": wakeup.strftime("%H:%M:%S"),
                "sleep_time": sleep.strftime("%H:%M:%S"),
                "notifications": notify
            }

            df = pd.concat([df, pd.DataFrame([new_user])], ignore_index=True)
            df.to_csv(USER_FILE, index=False)
            st.success("User registered successfully")

