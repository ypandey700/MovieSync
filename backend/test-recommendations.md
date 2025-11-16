# Testing Recommendations System

## Step 1: Seed Content (40 movies covering all moods)

```bash
# Add all content (40 movies)
POST http://localhost:3000/api/content/seed?force=true

# Or using curl:
curl -X POST "http://localhost:3000/api/content/seed?force=true"

# Or using fetch in browser console:
fetch('http://localhost:3000/api/content/seed?force=true', { method: 'POST' })
  .then(res => res.json())
  .then(data => console.log(data))
```

## Step 2: Check Content Count

```bash
GET http://localhost:3000/api/content/count

# Or:
fetch('http://localhost:3000/api/content/count')
  .then(res => res.json())
  .then(data => console.log('Content count:', data.count))
```

## Step 3: Test Recommendations for All Moods

```bash
GET http://localhost:3000/api/test/recommendations

# Or:
fetch('http://localhost:3000/api/test/recommendations')
  .then(res => res.json())
  .then(data => {
    console.log('Test Results:', data);
    // Check results for each mood
    Object.keys(data.results).forEach(mood => {
      console.log(`${mood}: ${data.results[mood].count} recommendations`);
    });
  })
```

## Step 4: Test Individual Moods via Frontend

1. Go to http://localhost:5173/suggestions
2. Sign in
3. Try different moods:
   - "happy"
   - "sad"
   - "excited"
   - "relaxed"
   - "stressed"
   - "bored"
   - "romantic"
   - "adventurous"
   - "thoughtful"
   - "energetic"
   - "melancholic"
   - "nostalgic"
   - "thrilled"
   - "peaceful"
   - "curious"

## Expected Results

Each mood should return 5-10 recommendations that match the mood:
- **Happy**: Comedy, Musical, Romance movies
- **Sad**: Drama, Romance, Melodrama
- **Excited**: Action, Adventure, Thriller
- **Relaxed**: Drama, Documentary, Nature
- **Stressed**: Comedy, Light Drama (to help)
- **Bored**: Action, Thriller, Mystery
- **Romantic**: Romance, Romantic Comedy
- **Adventurous**: Adventure, Action, Thriller
- **Thoughtful**: Drama, Documentary, Biography
- **Energetic**: Action, Sports, Musical
- **Melancholic**: Drama, Romance, Art House
- **Nostalgic**: Classic, Retro, Period Drama
- **Thrilled**: Thriller, Horror, Action
- **Peaceful**: Documentary, Nature, Meditation
- **Curious**: Mystery, Documentary, Sci-Fi

