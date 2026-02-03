from textblob import TextBlob

def analyze_text_sentiment(text: str):
    if not text or text.strip() == "":
        return 0.0, "neutral"

    blob = TextBlob(text)
    polarity = blob.sentiment.polarity  # -1 to +1

    if polarity < -0.3:
        label = "negative"
    elif polarity > 0.3:
        label = "positive"
    else:
        label = "neutral"

    return polarity, label
    