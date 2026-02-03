def generate_catchy_recommendations(
    mood_pred,
    sleep_pred,
    stress,
    screen_time,
    text_score,
    sentiment_label
):
    recs = []

    # TEXT‑BASED (VERY IMPORTANT)
    if sentiment_label == "negative":
        recs.append("You sound a bit drained 💭 — let’s slow things down today.")
        recs.append("Take 3 deep breaths… in through the nose, out through the mouth 🌬️")

    if text_score <= 2:
        recs.append("Today seems heavy — a short break can reset your mind 🔄")
        recs.append("Try a 5‑minute focus game to regain clarity 🎯")

    if sentiment_label == "positive":
        recs.append("Love your energy today ✨ keep riding that wave!")
        recs.append("Channel this positivity into something you enjoy 🌈")

    # ML‑BASED
    if mood_pred < 3:
        recs.append("Your mood dipped slightly — gentle music might help 🎵")

    if sleep_pred < 3:
        recs.append("Your body needs rest 😴 try winding down earlier tonight")

    if stress > 3:
        recs.append("Stress detected ⚠️ pause and stretch for 2 minutes")

    if screen_time > 5:
        recs.append("Too much screen time 📱 your eyes deserve a break")

    if not recs:
        recs.append("You're balanced today 🌿 keep following your routine")

    return recs
