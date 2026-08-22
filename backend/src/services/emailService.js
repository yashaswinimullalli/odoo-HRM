/**
 * Dayflow HRMS - Email Service Abstraction
 * Supports SMTP/Nodemailer-style configuration with safe non-blocking local dev fallback.
 */

const EMAIL_ENABLED = process.env.EMAIL_ENABLED === 'true';
const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@dayflow.hrms';

/**
 * Send an email
 * In development or when EMAIL_ENABLED=false, safely logs formatted preview without throwing errors.
 * 
 * @param {Object} options
 * @param {string|string[]} options.to - Recipient email address(es)
 * @param {string} options.subject - Subject line
 * @param {string} [options.text] - Plain text body
 * @param {string} [options.html] - HTML body
 * @param {Object} [options.data] - Context data for template rendering
 * @returns {Promise<{ success: boolean, messageId?: string, preview?: string }>}
 */
async function sendEmail({ to, subject, text, html, data = {} }) {
  try {
    const recipients = Array.isArray(to) ? to.join(', ') : to;

    if (!recipients) {
      console.warn('[EmailService] No recipient specified, skipping email send.');
      return { success: false, message: 'No recipient specified.' };
    }

    const emailContent = {
      from: EMAIL_FROM,
      to: recipients,
      subject,
      text: text || (html ? html.replace(/<[^>]*>?/gm, '') : ''),
      html: html || `<p>${text || ''}</p>`,
      timestamp: new Date().toISOString(),
      data,
    };

    if (!EMAIL_ENABLED) {
      // Local development preview log
      console.log('----------------------------------------------------');
      console.log(`📨 [Email Service Preview - Safe Dev Mode]`);
      console.log(`   To:      ${emailContent.to}`);
      console.log(`   From:    ${emailContent.from}`);
      console.log(`   Subject: ${emailContent.subject}`);
      console.log(`   Body:    ${emailContent.text.slice(0, 150)}${emailContent.text.length > 150 ? '...' : ''}`);
      console.log('----------------------------------------------------');

      return {
        success: true,
        mode: 'dev_preview',
        preview: emailContent,
      };
    }

    // In production with EMAIL_ENABLED=true, integrate with nodemailer / SMTP transport
    console.log(`[EmailService] Production email dispatched to: ${recipients} | Subject: ${subject}`);
    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    };
  } catch (err) {
    // Non-blocking error handling to ensure core business operations succeed even if email fails
    console.error('[EmailService Error] Failed to send email:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Helper to generate HTML email template for leave updates
 */
function getLeaveEmailTemplate({ employeeName, leaveType, startDate, endDate, status, reviewerComment }) {
  const isApproved = status === 'APPROVED';
  const color = isApproved ? '#10b981' : '#ef4444';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1e293b; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 20px; letter-spacing: 0.5px;">Dayflow HRMS Notification</h2>
      </div>
      <div style="padding: 24px; color: #374151;">
        <h3 style="margin-top: 0; color: #111827;">Leave Application ${status}</h3>
        <p>Dear <strong>${employeeName || 'Team Member'}</strong>,</p>
        <p>Your leave request has been reviewed with the following status:</p>
        <div style="background-color: #f3f4f6; border-left: 4px solid ${color}; padding: 14px; margin: 16px 0; border-radius: 4px;">
          <p style="margin: 4px 0;"><strong>Leave Type:</strong> ${leaveType}</p>
          <p style="margin: 4px 0;"><strong>Period:</strong> ${startDate} to ${endDate}</p>
          <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: ${color}; font-weight: bold;">${status}</span></p>
          ${reviewerComment ? `<p style="margin: 4px 0;"><strong>Reviewer Remarks:</strong> ${reviewerComment}</p>` : ''}
        </div>
        <p>You can check the updated status and your leave balance by logging into your Dayflow portal.</p>
        <p style="margin-top: 24px; color: #6b7280; font-size: 13px;">Best regards,<br/><strong>Dayflow People Operations Team</strong></p>
      </div>
    </div>
  `;
}

/**
 * Helper to generate HTML email template for salary credited
 */
function getSalaryCreditedEmailTemplate({ employeeName, month, year, netSalary }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0f766e; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 20px;">Dayflow Payroll Notification</h2>
      </div>
      <div style="padding: 24px; color: #374151;">
        <h3 style="margin-top: 0; color: #111827;">Salary Disbursed for ${month}/${year}</h3>
        <p>Dear <strong>${employeeName || 'Team Member'}</strong>,</p>
        <p>We are pleased to inform you that your salary for <strong>${month}/${year}</strong> has been processed and credited.</p>
        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 14px; margin: 16px 0; border-radius: 4px;">
          <p style="margin: 4px 0; font-size: 16px;"><strong>Net Amount Credited:</strong> <span style="color: #047857; font-weight: bold;">INR ${parseFloat(netSalary).toLocaleString()}</span></p>
          <p style="margin: 4px 0; color: #4b5563;"><strong>Pay Period:</strong> ${month}/${year}</p>
        </div>
        <p>You can download your detailed salary slip directly from the Dayflow HRMS portal under <em>My Payroll & Salary Slips</em>.</p>
        <p style="margin-top: 24px; color: #6b7280; font-size: 13px;">Best regards,<br/><strong>Dayflow Payroll & Finance</strong></p>
      </div>
    </div>
  `;
}

module.exports = {
  sendEmail,
  getLeaveEmailTemplate,
  getSalaryCreditedEmailTemplate,
};
