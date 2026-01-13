import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib

DATA_PATH = "D:\my folder\Personalized_App\data\hybrid_feature.csv"
MODEL_PATH = "D:\my folder\Personalized_App\models\mood_model.pkl"

df = pd.read_csv(DATA_PATH)

X = df.drop("sentiment", axis=1)
y = df["sentiment"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

model.fit(X_train, y_train)

y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

os.makedirs("models", exist_ok=True)
joblib.dump(model, MODEL_PATH)

print("Model trained successfully")
print("Accuracy:", accuracy)
