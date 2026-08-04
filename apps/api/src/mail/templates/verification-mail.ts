interface VerificationEmailProps {
  productName: string;
  verificationLink: string;
}

export function getVerificationEmailTemplate({
  productName,
  verificationLink,
}: VerificationEmailProps): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your email address</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden; border-collapse: collapse;">
          <tr><td height="4" style="background-color: #0f172a; line-height: 4px; font-size: 0;">&nbsp;</td></tr>
          
          <tr>
            <td style="padding: 40px 32px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.025em;">
                    ${productName}
                  </td>
                </tr>
              </table>
              
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 32px;">
                <tr>
                  <td style="font-size: 24px; font-weight: 700; color: #0f172a; tracking: -0.025em; line-height: 32px;">
                    Welcome aboard 👋
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px; font-size: 14px; line-height: 24px; color: #4b5563;">
                    Thanks for creating an account with us. Please click the button below to verify your email address and activate your dashboard access.
                  </td>
                </tr>
              </table>
              
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 32px; text-align: center;">
                <tr>
                  <td>
                    <a href="${verificationLink}" target="_blank" style="display: inline-block; padding: 12px 28px; background-color: #0f172a; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; transition: background-color 0.2s ease;">
                      Verify Email
                    </a>
                  </td>
                </tr>
              </table>
              
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 36px; border-top: 1px solid #f3f4f6; padding-top: 24px;">
                <tr>
                  <td style="font-size: 12px; color: #6b7280; line-height: 18px;">
                    ⏳ This secure authentication link expires in <strong>10 minutes</strong>.
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px; font-size: 12px; color: #9ca3af; line-height: 18px;">
                    If the button above does not work copy and paste this URL directly into your browser window:<br>
                    <a href="${verificationLink}" target="_blank" style="color: #2563eb; text-decoration: underline; word-break: break-all;">${verificationLink}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 24px; font-size: 12px; color: #9ca3af; line-height: 18px;">
                    If you did not request or initiate this account registration procedure, you can safely ignore this automated message.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 32px 32px 32px; font-size: 11px; color: #9ca3af; text-align: center;">
              &copy; ${new Date().getFullYear()} ${productName}. All rights reserved.
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}
