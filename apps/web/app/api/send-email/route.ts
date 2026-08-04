import { env } from "@/lib/env";
import { logError } from "@repo/shared";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();

    const { to, subject, html } = body;

    if (!to || !subject || !html) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required payload fields parameters.",
        },
        { status: 400 }
      );
    }

    const transporterResponse = await transporter.sendMail({
      from: `"StarterX" <${env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log("transporterResponse is ", transporterResponse);

    return NextResponse.json({
      success: true,
      message: "Email sent successfully!",
    });
  } catch (error) {
    logError(error);

    return NextResponse.json(
      { success: false, error: "Internal Serverless Fault" },
      { status: 500 }
    );
  }
}
