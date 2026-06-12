const nodemailer = require("nodemailer");

/**
 * Sends an email notification to the recruiter when a candidate applies for their job.
 * Falls back to console logging if SMTP credentials are not configured.
 */
const sendApplicationEmail = async ({
  recruiterEmail,
  recruiterName,
  candidateName,
  candidateEmail,
  candidatePhone,
  coverLetter,
  jobTitle,
}) => {
  try {
    const smtpHost = process.env.SMTP_HOST || "smtp.ethereal.email";
    const smtpPort = process.env.SMTP_PORT || 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    const mailOptions = {
      from: '"Stikbook Jobs" <noreply@stikbook.com>',
      to: recruiterEmail,
      subject: `New Job Application: ${jobTitle}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #0d9488 100%); padding: 24px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 24px;">New Application Alert</h2>
            <p style="margin: 4px 0 0 0; opacity: 0.9;">Someone is interested in your job post!</p>
          </div>
          <div style="padding: 24px; background-color: #ffffff;">
            <p style="font-size: 16px; margin-top: 0;">Hello <strong>${recruiterName}</strong>,</p>
            <p>You have received a new application for your listing: <strong style="color: #4f46e5;">${jobTitle}</strong>.</p>
            
            <h3 style="border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-top: 24px; color: #0f172a;">Applicant Information</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; font-weight: 600; width: 120px; color: #64748b;">Name:</td>
                <td style="padding: 8px 0; color: #0f172a;">${candidateName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Email:</td>
                <td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${candidateEmail}" style="color: #4f46e5; text-decoration: none;">${candidateEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Phone:</td>
                <td style="padding: 8px 0; color: #0f172a;">${candidatePhone}</td>
              </tr>
            </table>

            <h3 style="border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; color: #0f172a;">Cover Letter</h3>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; font-style: italic; color: #334155; white-space: pre-wrap;">
              ${coverLetter || "No cover letter provided."}
            </div>

            <div style="margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 14px; text-align: center; color: #64748b;">
              <p style="margin: 0;">You can view all applications in your Recruiter Dashboard.</p>
              <p style="margin: 4px 0 0 0;">&copy; 2026 Stikbook Jobs. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    };

    // If SMTP credentials aren't defined, mock sending and log detail in the console.
    if (!smtpUser || !smtpPass) {
      console.log("\n==================================================");
      console.log("📨  EMAIL SERVICE MOCK NOTIFICATION");
      console.log("--------------------------------------------------");
      console.log(`FROM: "Stikbook Jobs" <noreply@stikbook.com>`);
      console.log(`TO: ${recruiterEmail} (${recruiterName})`);
      console.log(`SUBJECT: ${mailOptions.subject}`);
      console.log(`APPLICANT: ${candidateName} (${candidateEmail})`);
      console.log(`PHONE: ${candidatePhone}`);
      console.log(`COVER LETTER:\n${coverLetter || "None"}`);
      console.log("==================================================\n");
      return true;
    }

    // Configure SMTP Transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort == 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const info = await transporter.sendMail(mailOptions);
    console.log(`Message sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("Error sending application email:", error.message);
    // Return true anyway so application submission doesn't fail due to notification glitches
    return false;
  }
};

module.exports = { sendApplicationEmail };
