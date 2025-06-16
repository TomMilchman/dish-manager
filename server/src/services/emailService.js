const { transporter } = require("../config/smtp");

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
    const mailOptions = {
        from: `"Dish Manager" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.info("Email sent:", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

module.exports = { sendEmail };
