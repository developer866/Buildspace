import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { withLogging } from '@/lib/withLogging';

export const POST = withLogging(async (request: NextRequest) => {
  try {
    await dbConnect();

    const body = await request.json();
    const { firstName, lastName } = body;

    const newUser = await User.create({ firstName, lastName });

    return NextResponse.json({ status: 'success', data: newUser }, { status: 201 });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('❌ Error creating user:', error.message);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
)
export const GET = withLogging(async () => {
  try {
    await dbConnect();
    const users = await User.find();
    return NextResponse.json({ status: 'success', data: users });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('❌ Error fetching users:', error.message);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
})