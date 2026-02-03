def text_to_score(polarity):
    if polarity <= -0.6:
        return 1
    elif polarity <= -0.2:
        return 2
    elif polarity <= 0.2:
        return 3
    elif polarity <= 0.6:
        return 4
    else:
        return 5
