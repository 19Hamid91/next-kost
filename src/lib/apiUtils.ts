import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { NextResponse } from 'next/server';

export async function requireSession() {
  const session = await getServerSession(authOptions);
  return session;
}

export function logError(serviceName: string, methodName: string, error: unknown): void {
  console.error(`[${serviceName}.${methodName}]`, error);
}

export function successResponse<T>(data: T, count: number, status = 200) {
  return NextResponse.json(
    {
      success: true,
      message: 'OK',
      data,
      RecordCount: count,
    },
    { status }
  );
}

export function errorResponse(message: string, status: number, error?: string) {
  return NextResponse.json(
    {
      success: false,
      message,
      error: error || message,
    },
    { status }
  );
}
