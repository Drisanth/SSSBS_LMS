import nodemailer from 'nodemailer';

// SMTP Configuration
// Using Gmail service as standard. Use an App Password for secure connection.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your.email@gmail.com', // To be configured in .env
    pass: process.env.EMAIL_PASS || 'your-app-password'     // To be configured in .env
  }
});

/**
 * Sends a welcome email to newly created teachers, including a "How to Use" message.
 */
export const sendWelcomeEmail = async (
  toEmail: string, 
  name: string, 
  username: string, 
  subjects: string, 
  grades: string
) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #4F46E5; text-align: center;">Welcome to SSSBS LMS, ${name}! 🎉</h2>
      
      <p style="font-size: 16px;">We are thrilled to have you on board! The administration has successfully enrolled you into the learning portal.</p>
      
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #111827;">Your Assignment</h3>
        <p><strong>Classes:</strong> ${grades || 'Not assigned yet'}</p>
        <p><strong>Subjects:</strong> ${subjects || 'Not assigned yet'}</p>
      </div>

      <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1e40af;">Your Login Details</h3>
        <p><strong>Portal Link:</strong> <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="color: #4F46E5;">Click here to login</a></p>
        <p><strong>Username:</strong> ${username}</p>
        <p style="font-size: 14px; color: #ef4444;"><em>Note: For security reasons, you will be required to change your password immediately upon your first login.</em></p>
      </div>

      <p style="font-size: 16px; margin-top: 30px;">To help you get started quickly, please find the <strong>How to Use the Portal</strong> guide attached to this email.</p>
      
      <p style="font-size: 16px; margin-top: 30px; text-align: center; font-weight: bold; color: #4F46E5;">Happy Teaching!</p>
      
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
      <p style="font-size: 12px; color: #9ca3af; text-align: center;">SSSBS Learning Management System Team</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"SSSBS LMS" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `Welcome to SSSBS LMS! Your Teacher Account is Ready 🚀`,
      html: htmlContent,
      // You can generate or attach the PDF here later!
      /*
      attachments: [
        {
          filename: 'How_to_Use_Portal.pdf',
          path: './assets/How_to_Use_Portal.pdf' // Path to a physical PDF file
        }
      ]
      */
    });

    console.log('Welcome email sent successfully: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't throw error to prevent crashing the API if email fails
    return false;
  }
};
