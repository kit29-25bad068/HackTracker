"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const client_1 = require("@prisma/client");
const EmailService_1 = require("./EmailService");
const prisma = new client_1.PrismaClient();
class NotificationService {
    /**
     * Dispatch in-app notification and route email according to user preferences
     */
    static async sendNotification(params) {
        try {
            // 1. Create In-App Notification Record
            await prisma.notification.create({
                data: {
                    userId: params.userId,
                    type: params.type,
                    title: params.title,
                    message: params.message,
                    link: params.link || null,
                    isRead: false,
                },
            });
            // 2. Check User's Email Notification Preference
            if (params.emailCategory && params.emailSubject && params.emailHtml) {
                const pref = await prisma.notificationPreference.findUnique({
                    where: {
                        userId_category: {
                            userId: params.userId,
                            category: params.emailCategory,
                        },
                    },
                });
                // Default to INSTANT if no explicit preference set yet
                const emailMode = pref ? pref.emailMode : 'INSTANT';
                if (emailMode !== 'OFF') {
                    await EmailService_1.EmailService.sendEmail({
                        userId: params.userId,
                        templateType: params.type,
                        subject: params.emailSubject,
                        htmlContent: params.emailHtml,
                    });
                }
                else {
                    console.log(`🔕 [NotificationService] User ${params.userId} turned off email for category ${params.emailCategory}`);
                }
            }
        }
        catch (err) {
            console.error('❌ [NotificationService Error]:', err);
        }
    }
}
exports.NotificationService = NotificationService;
