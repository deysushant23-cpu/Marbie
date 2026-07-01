import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { action, email, password, name } = await request.json();
    
    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: 'Logged in successfully', user: { email } });
    } else if (action === 'signup') {
      if (!email || !password || !name) {
        return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: 'Account created successfully', user: { name, email } });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
