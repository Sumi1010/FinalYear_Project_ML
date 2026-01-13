import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
import joblib

DATA_PATH = r"D:\my folder\Personalized_App\data\user_daily_inputs.csv"
MODEL_PATH = r"D:\my folder\Personalized_App\models\sleep_model.pkl"

df = pd.read_csv(
    DATA_PATH,
    header=None,
    names=["mood", "stress", "sleep_quality", "screen_time", "text"]
)

X = df[["mood", "stress", "screen_time"]]
y = df["sleep_quality"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

predictions = model.predict(X_test)
mae = mean_absolute_error(y_test, predictions)

print("Sleep Model trained successfully")
print("Mean Absolute Error:", mae)

joblib.dump(model, MODEL_PATH)
print("Model saved as sleep_model.pkl")
