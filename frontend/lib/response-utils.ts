import { NextResponse } from "next/server";

interface ApiResponse {
  message: string;
}

export const successResponse = (message: string, status: number = 200) => {
  return NextResponse.json({ message } as ApiResponse, { status });
};

export const errorResponse = (message: string, status: number = 400) => {
  return NextResponse.json({ message } as ApiResponse, { status });
};
