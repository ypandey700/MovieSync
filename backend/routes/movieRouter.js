import  express  from 'express'; 
import  User  from '../models/User.js'; 

const  router = express.Router();

router.get('/viewing-history/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId, 'viewing_history');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ viewing_history: user.viewing_history });
  } catch (error) {
    console.error('Error fetching viewing history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/viewing-history/:userId', async (req, res) => {
  try {
    const { contentId, lastWatchPosition } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const historyItem = user.viewing_history.find(
      (item) => item.contentId === contentId
    );
    if (historyItem) {
      historyItem.lastWatchPosition = lastWatchPosition;
      historyItem.lastWatched = new Date();
    } else {
      user.viewing_history.push({
        contentId,
        lastWatchPosition,
        lastWatched: new Date(),
      });
    }

    await user.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving viewing history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/viewing-history/:userId', async (req, res) => {
  try {
    const { contentId, lastWatchPosition } = req.body;
 

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const historyItem = user.viewing_history.find(
      (item) => item.contentId === contentId
    );
    if (!historyItem) {
      return res.status(404).json({ error: 'Movie not in viewing history' });
    }

    historyItem.lastWatchPosition = lastWatchPosition;
    historyItem.lastWatched = new Date();
    await user.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating viewing history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;