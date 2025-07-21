const { transporter } = require("../config/smtp");
const logger = require("../utils/logger");

/**
 * Sends an email using the configured SMTP transporter.
 *
 * @param {Object} options - Email options.
 * @param {string} options.to - Recipient email address.
 * @param {string} options.subject - Subject line of the email.
 * @param {string} options.text - Plain text content of the email.
 *
 * @throws Will throw an error if sending the email fails.
 * @returns {Promise<void>} Resolves when the email is sent successfully.
 */
async function sendEmail({ to, subject, text }) {
    if (process.env.NODE_ENV !== "production") {
        logger.logInfo(
            "send email (dev)",
            `Pretending to send email to ${to} - Subject: ${subject}`
        );
        logger.logInfo("send email (dev)", `Body: ${text}`);
        return;
    }

    const mailOptions = {
        from: `"Dish Manager" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.logInfo("send email", `Email sent to ${to}`);
    } catch (error) {
        logger.logError("send email", `Error sending email to ${to}: ${err}`);
        throw error;
    }
}

module.exports = { sendEmail };
