import { NextResponse } from "next/server";

export function apiError(error: unknown, fallback: string, status = 500) {
  return NextResponse.json(
    {
      message: error instanceof Error ? error.message : fallback,
    },
    { status },
  );
}
