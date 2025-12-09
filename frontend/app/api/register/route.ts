import { siteConfig } from "@/config/site";
import { getExpirationTime } from "@/lib/generate-reset-code";
import { logError } from "@/lib/log-error";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/response-utils";
import { transporter } from "@/lib/transporter";
import { signUpSchema } from "@/schema/auth";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Zod Validation
    const validationResult = signUpSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues[0].message;
      return errorResponse(errorMessage, 400);
    }
    const { email, password } = validationResult.data;

    // 2. Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return errorResponse("Email already in use", 409);
    }

    // 3. Hash Password and Create User
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // 4. Generate Verification Token
    const token = uuidv4();
    const expiresAt = getExpirationTime();

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: expiresAt,
      },
    });

    // 5. Send Email (USING GMAIL / NODEMAILER)
    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`;

    const mailOptions = {
      from: `${siteConfig.name} <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Verify your email address",
      html: `<p>Click here to verify: <a href="${verificationLink}">Verify Email</a></p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);

    // 6. Return structured success message
    return successResponse(
      "Registration successful! Check your email for verification.",
      201
    );
  } catch (error) {
    logError(error);
    return errorResponse("Internal server error. Please try again later.", 500);
  }
}
