import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
// import { v4 as uuid } from "uuid";
import crypto from "crypto";
import { withLogging } from "@/lib/withLogging";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const POST = withLogging(async (request: NextRequest) => {
  try {
    await dbConnect();

    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return NextResponse.json(
        { status: "error", message: "Email and password are required" },
        { status: 400 },
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { status: "error", message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { status: "error", message: "Invalid credentials" },
        { status: 401 },
      );
    }
    // Create NEW session every login
    const sessionId = crypto.randomUUID();
    user.sessionId = sessionId;
    await user.save();

    const token = jwt.sign(
      {
        userId: user._id,
        sessionId,
      },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    const response = NextResponse.json({
      status: "success",
      data: { id: user._id, firstName: user.firstName, email: user.email },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 1,
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    console.error("❌ Login error:", message);
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
});
