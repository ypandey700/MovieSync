from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import ast
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from React frontend

# === Load & prepare model ===

movies_df = pd.read_csv("movies_metadata (5).csv", low_memory=False)

def extract_genres(genre_str):
    try:
        genres = ast.literal_eval(genre_str)
        return " ".join([g['name'] for g in genres])
    except:
        return ""

movies_df['clean_genres'] = movies_df['genres'].apply(extract_genres)
movies_df['description'] = movies_df['overview'].fillna('') + " " + movies_df['clean_genres']

mood_keywords = {
    "Relaxed": "calm soothing peaceful mellow gentle serene light-hearted",
    "Excited": "thrilling action-packed intense wild energetic fast-paced explosive",
    "Focused": "serious intellectual thoughtful deep cerebral complex intricate",
    "Adventurous": "adventure journey explore daring bold risky expedition",
    "Curious": "mystery investigation secrets unknown twist puzzle reveal",
    "Happy": "funny joyful cheerful heartwarming delightful amusing uplifting",
    "Nostalgic": "classic retro vintage memory emotional sentimental past",
    "Inspired": "motivational uplifting brave triumph perseverance heroic courageous"
}

tfidf = TfidfVectorizer(stop_words='english')
movie_tfidf_matrix = tfidf.fit_transform(movies_df['description'])
mood_vectors = {mood: tfidf.transform([keywords]) for mood, keywords in mood_keywords.items()}

# === Flask API Endpoint ===

@app.route('/recommend', methods=['POST'])
def recommend():
    mood = request.json.get('mood')
    if mood not in mood_vectors:
        return jsonify({"error": "Invalid mood"}), 400

    mood_vector = mood_vectors[mood]
    similarity_scores = cosine_similarity(mood_vector, movie_tfidf_matrix).flatten()
    top_indices = similarity_scores.argsort()[-10:][::-1]

    results = []
    for idx in top_indices:
        row = movies_df.iloc[idx]
        results.append({
            "title": row.get("title", ""),
            "overview": row.get("overview", ""),
            "genres": row.get("clean_genres", ""),
        })

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)
