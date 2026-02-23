// Fetch suggested followers from the API


const BINI_URL = import.meta.env.VITE_BINI_API_URL || 'http://localhost:4000/v1/bini';

export async function fetchSuggestedFollowers(token, limit = 10, offset = 0) {
  try {
    const url = new URL(`${BINI_URL}/follow/suggested-followers`);
    url.searchParams.set('limit', limit);
    url.searchParams.set('offset', offset);         

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        apikey: 'thread',
      },
    });

    if (!res.ok) throw new Error('Failed to fetch suggested followers');
    return await res.json();
  } catch (err) {
    console.error('Error fetching suggested followers:', err);
    throw err;
  }
}

export default fetchSuggestedFollowers;