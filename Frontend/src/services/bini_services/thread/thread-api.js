import { BINI_API_URL } from '../../../config/bini-api.js';

export async function fetchThreads(token) {
  try {
    const authToken = token || localStorage.getItem('token') || localStorage.getItem('authToken') || '';
    const response = await fetch(`${BINI_API_URL}/posts/threads`, {
      method: 'GET',
      headers: {
        'apikey': 'thread',
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : ''
      },
    });

    if (!response.ok) {
      // try to read body for better error
      let body = null;
      try { body = await response.json(); } catch (e) { /* ignore */ }
      const err = new Error('Failed to fetch threads');
      err.status = response.status;
      err.body = body;
      throw err;
    }

    const data = await response.json();
    // support responses that are arrays or objects with `threads` property
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.threads)) return data.threads;
    return [];
  } catch (error) {
    console.error('Error fetching threads:', error);
    // Return mock data as fallback
    return getMockThreads();
  }
}

function getMockThreads() {
  return [
    {
      id: 1,
      title: 'Cloudstaff "ROAR" Year-end Party 2025',
      date: 'December 6, 2025',
      venue: 'Philippine Arena',
      author: 'Admin',
      commentCount: 0,
      isPinned: true
    },
    {
      id: 2,
      title: 'BINI Cosmetics Livestream',
      date: 'December 10, 2025',
      venue: 'BINI.Global Livestream',
      author: 'Admin',
      commentCount: 0,
      isPinned: true
    },
    {
      id: 3,
      title: 'Enervon Z+ X BINI',
      date: 'December 11, 2025',
      venue: 'Livestream',
      author: 'Admin',
      commentCount: 0,
      isPinned: false
    },
    {
      id: 4,
      title: 'Wish Bus 107.5 Guesting',
      date: 'December 15, 2025',
      venue: 'WISH Bus 107.5',
      author: 'Admin',
      commentCount: 0,
      isPinned: false
    },
    {
      id: 5,
      title: 'The Sterling X BINI Fan Meet',
      date: 'December 16, 2025',
      venue: 'New Performing Arts Theater',
      author: 'Admin',
      commentCount: 0,
      isPinned: false
    },
    {
      id: 6,
      title: 'Coachella Music Festival',
      date: 'April 10, 2026',
      venue: 'Indio, California',
      author: 'Admin',
      commentCount: 0,
      isPinned: false
    },
    {
      id: 7,
      title: 'Coachella Music Festival',
      date: 'April 17, 2026',
      venue: 'Indio, California',
      author: 'Admin',
      commentCount: 0,
      isPinned: false
    }
  ];
}

export default fetchThreads;

// export async function fetchThreads() {
//   try {


//     // MOCK DATA (from your BINI_EVENTS)
//     return [
//       {
//         id: 1,
//         title: 'Cloudstaff "ROAR" Year-end Party 2025',
//         date: 'December 6, 2025',
//         venue: 'Philippine Arena',
//         author: 'Admin',
//         commentCount: 0,
//         isPinned: true
//       },
//       {
//         id: 2,
//         title: 'BINI Cosmetics Livestream',
//         date: 'December 10, 2025',
//         venue: 'BINI.Global Livestream',
//         author: 'Admin',
//         commentCount: 0,
//         isPinned: true
//       },
//       {
//         id: 3,
//         title: 'Enervon Z+ X BINI',
//         date: 'December 11, 2025',
//         venue: 'Livestream',
//         author: 'Admin',
//         commentCount: 0,
//         isPinned: false
//       },
//       {
//         id: 4,
//         title: 'Wish Bus 107.5 Guesting',
//         date: 'December 15, 2025',
//         venue: 'WISH Bus 107.5',
//         author: 'Admin',
//         commentCount: 0,
//         isPinned: false
//       },
//       {
//         id: 5,
//         title: 'The Sterling X BINI Fan Meet',
//         date: 'December 16, 2025',
//         venue: 'New Performing Arts Theater',
//         author: 'Admin',
//         commentCount: 0,
//         isPinned: false
//       },
//       {
//         id: 6,
//         title: 'Coachella Music Festival',
//         date: 'April 10, 2026',
//         venue: 'Indio, California',
//         author: 'Admin',
//         commentCount: 0,
//         isPinned: false
//       },
//       {
//         id: 7,
//         title: 'Coachella Music Festival',
//         date: 'April 17, 2026',
//         venue: 'Indio, California',
//         author: 'Admin',
//         commentCount: 0,
//         isPinned: false
//       }
//     ];

//   } catch (error) {
//     console.error('Failed to fetch threads:', error);
//     throw error;
//   }
// }