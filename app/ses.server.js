import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: process.env.AWS_SES_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Send a support email via AWS SES.
 */
export async function sendSupportEmail({ email, shopName, subject, message }) {
  const toAddress = process.env.SUPPORT_EMAIL_TO;
  const fromAddress = process.env.SUPPORT_EMAIL_FROM;

  if (!toAddress || !fromAddress) {
    throw new Error(
      "Missing SUPPORT_EMAIL_TO or SUPPORT_EMAIL_FROM environment variables.",
    );
  }

  const params = {
    Source: fromAddress,
    Destination: {
      ToAddresses: [toAddress],
    },
    ReplyToAddresses: [email],
    Message: {
      Subject: {
        Data: `[Support] ${subject} — ${shopName}`,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">New Support Request</h2>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; width: 120px;"><strong>Shop</strong></td>
                  <td style="padding: 8px 0; color: #111827;">${shopName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;"><strong>Email</strong></td>
                  <td style="padding: 8px 0; color: #111827;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;"><strong>Subject</strong></td>
                  <td style="padding: 8px 0; color: #111827;">${subject}</td>
                </tr>
              </table>
              <div style="background: #f9fafb; border-radius: 8px; padding: 16px; border: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px;"><strong>Message</strong></p>
                <p style="margin: 0; color: #111827; white-space: pre-wrap; line-height: 1.6;">${message}</p>
              </div>
            </div>
          `,
          Charset: "UTF-8",
        },
        Text: {
          Data: `Support Request\n\nShop: ${shopName}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
          Charset: "UTF-8",
        },
      },
    },
  };

  const command = new SendEmailCommand(params);
  return await sesClient.send(command);
}

/**
 * Send an automatic acknowledgement reply to the merchant.
 */
export async function sendAutoReplyEmail({ email, shopName, subject, message }) {
  const fromAddress = process.env.SUPPORT_EMAIL_FROM;

  if (!fromAddress) {
    throw new Error("Missing SUPPORT_EMAIL_FROM environment variable.");
  }

  const currentYear = new Date().getFullYear();

  const params = {
    Source: fromAddress,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: `We've received your request — "${subject}"`,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <!-- Header -->
              <div style="background-color: #1a1a1a; padding: 32px 24px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px;">Glamovix</h1>
                <p style="margin: 6px 0 0; font-size: 13px; color: #a1a1aa;">Virtual Try-On for Shopify</p>
              </div>

              <!-- Body -->
              <div style="padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
                <p style="margin: 0 0 8px; font-size: 15px; color: #111827; font-weight: 600;">Hi ${shopName},</p>
                <p style="margin: 0 0 20px; font-size: 14px; color: #374151; line-height: 1.6;">
                  Thanks for reaching out! We've received your support request and our team will get back to you within <strong>24 hours</strong>.
                </p>

                <!-- Request summary -->
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                  <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Your Request</p>
                  <p style="margin: 0 0 12px; font-size: 14px; color: #111827; font-weight: 600;">${subject}</p>
                  <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.5; white-space: pre-wrap;">${message}</p>
                </div>

                <p style="margin: 0 0 6px; font-size: 13px; color: #6b7280; line-height: 1.5;">
                  In the meantime, you can reply directly to this email if you have any additional details to share.
                </p>

                <!-- Divider -->
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

                <p style="margin: 0; font-size: 13px; color: #374151;">
                  Cheers,<br />
                  <strong>The Glamovix Team</strong>
                </p>
              </div>

              <!-- Footer -->
              <div style="padding: 16px 24px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; background-color: #fafafa;">
                <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                  © ${currentYear} Glamovix. This is an automated confirmation — no action is required.
                </p>
              </div>
            </div>
          `,
          Charset: "UTF-8",
        },
        Text: {
          Data: `Hi ${shopName},\n\nThanks for reaching out! We've received your support request and our team will get back to you within 24 hours.\n\nYour Request:\nSubject: ${subject}\nMessage: ${message}\n\nYou can reply directly to this email if you have any additional details to share.\n\nCheers,\nThe Glamovix Team`,
          Charset: "UTF-8",
        },
      },
    },
  };

  const command = new SendEmailCommand(params);
  return await sesClient.send(command);
}
