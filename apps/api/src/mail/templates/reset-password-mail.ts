interface ResetPasswordTemplateInput {
  productName: string;
  resetLink: string;
}

export function getResetPasswordMailTemplate(
  input: ResetPasswordTemplateInput
): string {
  const { productName, resetLink } = input;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; color: #111827; margin: 0; padding: 0; }
          .container { max-width: 512px; margin: 40px auto; background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-radius: 8px; }
          .heading { font-size: 24px; font-weight: 600; color: #111827; margin-bottom: 16px; }
          .text { font-size: 14px; line-height: 1.5; color: #4b5563; margin-bottom: 24px; }
          .button { display: inline-block; background-color: #111827; color: #ffffff !important; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: 500; border-radius: 6px; margin-bottom: 24px; }
          .footer { font-size: 12px; color: #9ca3af; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="heading">Reset your password</h1>
          <p class="text">We received a request to reset the password for your account on <strong>${productName}</strong>. Click the button below to choose a new password. This link will expire in 10 minutes.</p>
          <a href="${resetLink}" class="button" target="_blank">Reset Password</a>
          <p class="text">If you did not make this request, you can safely ignore this email. Your password will remain completely secure.</p>
          <div class="footer">
            This is an automated security message from ${productName}. Please do not reply directly to this email.
          </div>
        </div>
      </body>
    </html>
  `.trim();
}
