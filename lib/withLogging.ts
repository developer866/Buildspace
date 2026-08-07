import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Log from '@/models/Log';

type RouteHandler = (request: NextRequest, context?: any) => Promise<NextResponse>;

export function withLogging(handler: RouteHandler): RouteHandler {
  return async (request: NextRequest, context?: any) => {
    const method = request.method;
    const path = request.nextUrl.pathname;

    // Clone the request before reading it — a request body stream can only
    // be read ONCE. If we consumed the original here, your actual route
    // handler would get an empty body when it tries to read it next.
    let requestBody: unknown = null;
    try {
      const clone = request.clone();
      const contentType = clone.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        requestBody = await clone.json();
      } else if (contentType.includes('form-data') || contentType.includes('x-www-form-urlencoded')) {
        const fd = await clone.formData();
        requestBody = Object.fromEntries(fd.entries());
      }
    } catch {
      requestBody = null;
    }

    // Never log plaintext passwords, even to your own database
    if (requestBody && typeof requestBody === 'object' && 'password' in requestBody) {
      requestBody = { ...requestBody, password: '[REDACTED]' };
    }

    // Run your actual route logic, untouched
    const response = await handler(request, context);

    // Same cloning problem on the way out — read a copy of the response
    // so the real response body still reaches the browser intact
    let responseData: unknown = null;
    try {
      responseData = await response.clone().json();
    } catch {
      responseData = null;
    }

    try {
      await dbConnect();
      await Log.create({
        method,
        path,
        requestBody,
        responseStatus: response.status,
        responseData,
      });
    } catch (err) {
      console.error('❌ Failed to save request log:', err);
      // deliberately NOT re-thrown — a logging failure should never break the actual request
    }

    return response;
  };
}