/**
 * getAIRecommendation - Fetches AI-powered movie recommendations
 * 
 * @param {string} promptString - The prompt describing user preferences
 * @returns {Promise<Array>} Array of recommended movies
 */
export const getAIRecommendation = async (promptString) => {
  try {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    const userId = user?.userId || user?._id;

    // Import BACKEND_URL
    const { BACKEND_URL } = await import('./confg');
    
    // Call the AI suggestions API
    const response = await fetch(`${BACKEND_URL}/ai/suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        prompt: promptString,
        userId: userId || null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get AI recommendations');
    }

    if (data.success && data.recommendations) {
      return data.recommendations;
    }

    return [];
  } catch (error) {
    console.error('getAIRecommendation error:', error);
    throw error;
  }
};

