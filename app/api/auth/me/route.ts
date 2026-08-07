import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import {withLogging} from '@/lib/withLogging';

export  const GET = withLogging(async () => {
  try {
    const session = await getCurrentUser();

    if (!session) {
      return NextResponse.json({ status: 'error', user: null }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.userId).select('-password');

    if (!user) {
      return NextResponse.json({ status: 'error', user: null }, { status: 401 });
    }

    return NextResponse.json({
      status: 'success',
      user: { id: user._id, firstName: user.firstName, email: user.email },
    });
  } catch (err) {
    return NextResponse.json({ status: 'error', user: null }, { status: 401 });
  }
})