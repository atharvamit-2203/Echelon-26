import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { credential } = await request.json();
    
    // Decode JWT token (in production, verify with Google)
    const base64Url = credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
    
    const user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    };
    
    return NextResponse.json({
      success: true,
      user,
      token: `token_${payload.sub}`
    });
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}
