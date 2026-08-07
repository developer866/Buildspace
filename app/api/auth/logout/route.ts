import { NextResponse,NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { withLogging } from '@/lib/withLogging';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export const POST = withLogging(async (request: NextRequest) => {
  const token = request.cookies.get('token')?.value;
    if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      const { userId } = payload as { userId: string };
      await dbConnect();
      await User.findByIdAndUpdate(userId, { sessionId: null });
    }  catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    console.error("❌ Logout error:", message); 
  }}
  const response = NextResponse.json({ status: 'success' });
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
})