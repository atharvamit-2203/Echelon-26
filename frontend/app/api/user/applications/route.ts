import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Try to fetch from backend, if it fails, return empty array
    try {
      const response = await fetch(`http://localhost:8000/api/v1/user/applications/${encodeURIComponent(userId)}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const applications = await response.json();
        return NextResponse.json({ applications: Array.isArray(applications) ? applications : [] });
      }
    } catch (backendError) {
      console.error('Backend not available:', backendError);
    }

    // Fallback to legacy endpoint
    try {
      const legacyResponse = await fetch(`http://localhost:8000/api/user/applications?userId=${encodeURIComponent(userId)}`);
      if (legacyResponse.ok) {
        const data = await legacyResponse.json();
        return NextResponse.json({ applications: Array.isArray(data?.applications) ? data.applications : [] });
      }
    } catch (legacyError) {
      console.error('Legacy applications endpoint unavailable:', legacyError);
    }

    // Fallback: return empty array if backend is not available
    return NextResponse.json({ applications: [] });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ applications: [] });
  }
}
