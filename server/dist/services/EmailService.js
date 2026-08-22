"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class EmailService {
    static transporter = null;
    static getTransporter() {
        if (!this.transporter) {
            if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
                this.transporter = nodemailer_1.default.createTransport({
                    host: process.env.SMTP_HOST,
                    port: Number(process.env.SMTP_PORT) || 587,
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    },
                });
            }
            else {
                // Fallback test transporter (mock/local logging)
                this.transporter = nodemailer_1.default.createTransport({
                    jsonTransport: true,
                });
            }
        }
        return this.transporter;
    }
    /**
     * Dispatches an email strictly to the user's verified registered email address.
     */
    static async sendEmail(params) {
        try {
            // 1. Retrieve the user's official registered email from the database
            const user = await prisma.user.findUnique({
                where: { id: params.userId },
                select: { email: true, name: true },
            });
            if (!user || !user.email) {
                console.warn(`⚠️ [EmailService] Cannot send email: User ${params.userId} not found.`);
                return false;
            }
            const recipientEmail = user.email;
            const fromAddress = process.env.EMAIL_FROM || 'HackTracker <notifications@hacktracker.io>';
            // 2. Wrap content in a branded HackTracker HTML email template
            const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${params.subject}</title>
        </head>
        <body style="margin:0; padding:0; background-color:#07090e; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#f3f4f6;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#07090e; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; background-color:#0f172a; border-radius:16px; border:1px solid #1e293b; overflow:hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 28px 32px; background: linear-gradient(135deg, #0d9488 0%, #4f46e5 100%);">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td>
                            <h1 style="margin:0; font-size:24px; font-weight:800; color:#ffffff; letter-spacing: -0.5px;">HACKTRACKER</h1>
                            <p style="margin:4px 0 0 0; font-size:13px; color:#ccfbf1; font-weight: 500;">Discover. Track. Build Your Legacy.</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 32px; font-size: 15px; line-height: 1.6; color: #e2e8f0;">
                      ${params.htmlContent}
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 32px; background-color: #0b0f19; border-top: 1px solid #1e293b; text-align: center;">
                      <p style="margin:0; font-size:12px; color:#64748b;">
                        This official notification was sent to your registered account: <strong style="color: #94a3b8;">${recipientEmail}</strong>.
                      </p>
                      <p style="margin:8px 0 0 0; font-size:12px; color:#64748b;">
                        Manage your email preferences in <a href="http://localhost:5173/settings/notifications" style="color: #14b8a6; text-decoration: none; font-weight: 600;">Notification Settings</a>.
                      </p>
                      <p style="margin:12px 0 0 0; font-size:11px; color:#475569;">
                        &copy; 2026 HackTracker Inc. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
            // 3. Send using Nodemailer
            const transporter = this.getTransporter();
            await transporter.sendMail({
                from: fromAddress,
                to: recipientEmail,
                subject: params.subject,
                html: fullHtml,
            });
            // 4. Log to EmailNotification table in the database for tracking & in-app viewer
            await prisma.emailNotification.create({
                data: {
                    userId: params.userId,
                    recipientEmail,
                    subject: params.subject,
                    templateType: params.templateType,
                    contentHtml: fullHtml,
                    status: 'SENT',
                },
            });
            console.log(`📧 [EmailService] Successfully sent & logged email to ${recipientEmail} [${params.subject}]`);
            return true;
        }
        catch (err) {
            console.error('❌ [EmailService Error]:', err);
            return false;
        }
    }
}
exports.EmailService = EmailService;
