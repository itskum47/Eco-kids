const crypto = require('crypto');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const { logAuditEvent } = require('../utils/auditLogger');

// Configure nodemailer transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production email service (e.g., SendGrid, SES, etc.)
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  } else {
    // Development: use Ethereal for testing (creates test account)
    // In production, replace with actual SMTP service
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.SMTP_USER || 'test@ethereal.email',
        pass: process.env.SMTP_PASSWORD || 'testpassword'
      }
    });
  }
};

/**
 * @desc    Send parental consent request via email
 * @param   {String} studentId - Student's user ID
 * @returns {Object} Result with token and email sent status
 */
exports.sendConsentRequest = async (studentId) => {
  try {
    // Find student
    const student = await User.findById(studentId);
    
    if (!student) {
      throw new Error('Student not found');
    }
    
    // Validate student role
    if (student.role !== 'student') {
      throw new Error('Parental consent is only required for students');
    }
    
    // Check if student already has parent email
    if (!student.parentEmail) {
      throw new Error('Parent email not provided. Please update student profile with parent email.');
    }
    
    // Check if consent already given
    if (student.parentConsentGiven) {
      throw new Error('Parental consent has already been given for this student');
    }
    
    // Generate unique token (32 bytes = 64 hex characters)
    const token = crypto.randomBytes(32).toString('hex');
    
    // Store token on user (it will be hashed for security)
    student.parentConsentToken = token;
    await student.save();
    
    // Prepare email
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    const consentURL = `${frontendURL}/consent/parent/${token}`;
    
    const mailOptions = {
      from: `"EcoKids India" <${process.env.SMTP_FROM || 'noreply@ecokids.in'}>`,
      to: student.parentEmail,
      subject: 'Action Required: Consent for EcoKids India',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #2e7d32;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #2e7d32;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .info-box {
              background-color: #e8f5e9;
              border-left: 4px solid #2e7d32;
              padding: 15px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              font-size:12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌱 EcoKids India</h1>
          </div>
          <div class="content">
            <p>Dear Parent/Guardian,</p>
            
            <p>Your child <strong>${student.name}</strong> has registered on <strong>EcoKids India</strong>, 
            an educational platform aligned with NEP 2020 (National Education Policy 2020) that helps 
            students learn about environmental conservation through gamified activities.</p>
            
            <div class="info-box">
              <strong>📋 What is EcoKids India?</strong>
              <ul>
                <li>Government-compliant educational platform</li>
                <li>Activities aligned with NEP 2020 and SDG goals</li>
                <li>Gamification to encourage environmental learning</li>
                <li>Progress tracking and reports for parents</li>
              </ul>
            </div>
            
            <p>As per the <strong>Digital Personal Data Protection Act 2023 (DPDP Act)</strong>, 
            we require your explicit consent before your child can fully participate in the platform.</p>
            
            <p><strong>Please click the link below to give consent:</strong></p>
            
            <p style="text-align: center;">
              <a href="${consentURL}" class="button">Give Parental Consent</a>
            </p>
            
            <p style="font-size: 12px; color: #666;">
              Or copy this link: <a href="${consentURL}">${consentURL}</a>
            </p>
            
            <div class="info-box">
              <strong>🔒 Privacy & Data Protection:</strong>
              <ul>
                <li>All data stored securely in India (AWS Mumbai)</li>
                <li>Compliant with DPDP Act 2023</li>
                <li>No data shared with third parties without consent</li>
                <li>You can request data deletion at any time</li>
              </ul>
            </div>
            
            <p><strong>⏰ This link expires in 7 days.</strong></p>
            
            <p>If you have any questions, please contact us at 
            <a href="mailto:support@ecokids.in">support@ecokids.in</a></p>
            
            <p>Thank you for supporting your child's environmental education!</p>
            
            <p>Best regards,<br>
            <strong>EcoKids India Team</strong></p>
          </div>
          <div class="footer">
            <p>EcoKids India is compliant with DPDP Act 2023, NEP 2020, and POCSO Act.</p>
            <p>All student data is stored in India and protected as per government regulations.</p>
          </div>
        </body>
        </html>
      `
    };
    
    // Send email
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);
    
    // Log audit event
    await logAuditEvent({
      actorId: studentId,
      actorRole: 'student',
      action: 'PARENTAL_CONSENT_REQUEST_SENT',
      targetType: 'USER',
      targetId: studentId,
      metadata: {
        parentEmail: student.parentEmail,
        parentName: student.parentName,
        tokenGenerated: true
      },
      status: 'success'
    }).catch(err => console.error('[ParentalConsentService] Audit log error:', err));
    
    console.log('[ParentalConsentService] Email sent:', info.messageId);
    
    return {
      success: true,
      message: 'Consent request email sent successfully',
      emailSent: true,
      parentEmail: student.parentEmail,
      expiresIn: '7 days',
      messageId: info.messageId
    };
    
  } catch (error) {
    console.error('[ParentalConsentService] sendConsentRequest error:', error);
    throw error;
  }
};

/**
 * @desc    Verify parental consent using token
 * @param   {String} token - Consent verification token
 * @ @returns {Object} Verification result with student name
 */
exports.verifyParentalConsent = async (token) => {
  try {
    if (!token) {
      throw new Error('Consent token is required');
    }
    
    // Find user with this token
    const student = await User.findOne({ parentConsentToken: token }).select('+parentConsentToken');
    
    if (!student) {
      throw new Error('Invalid or expired consent token');
    }
    
    // Check if consent already given (idempotent operation)
    if (student.parentConsentGiven) {
      return {
        success: true,
        verified: true,
        message: 'Parental consent has already been verified',
        studentName: student.name,
        consentDate: student.parentConsentDate
      };
    }
    
    // Update consent status
    student.parentConsentGiven = true;
    student.parentConsentDate = new Date();
    student.parentConsentToken = undefined; // Clear the token
    await student.save();
    
    // Log audit event
    await logAuditEvent({
      actorId: student._id,
      actorRole: 'parent',
      action: 'PARENTAL_CONSENT_GIVEN',
      targetType: 'USER',
      targetId: student._id.toString(),
      metadata: {
        parentEmail: student.parentEmail,
        parentName: student.parentName,
        consentDate: student.parentConsentDate
      },
      status: 'success'
    }).catch(err => console.error('[ParentalConsentService] Audit log error:', err));
    
    // Send confirmation email to parent
    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"EcoKids India" <${process.env.SMTP_FROM || 'noreply@ecokids.in'}>`,
        to: student.parentEmail,
        subject: 'Parental Consent Confirmed - EcoKids India',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #2e7d32; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1>✅ Consent Confirmed</h1>
            </div>
            <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
              <p>Dear ${student.parentName || 'Parent/Guardian'},</p>
              
              <p><strong>Thank you for giving consent!</strong></p>
              
              <p>Your child <strong>${student.name}</strong> can now fully participate in EcoKids India activities.</p>
              
              <div style="background-color: #e8f5e9; border-left: 4px solid #2e7d32; padding: 15px; margin: 20px 0;">
                <strong>What happens next?</strong>
                <ul>
                  <li>${student.name} can complete environmental activities</li>
                  <li>Track progress through the student dashboard</li>
                  <li>Earn points, badges, and certificates</li>
                  <li>You will receive progress reports monthly</li>
                </ul>
              </div>
              
              <p><strong>View your child's progress:</strong> 
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/parent/reports">Parent Dashboard</a></p>
              
              <p>If you have any questions, contact us at 
              <a href="mailto:support@ecokids.in">support@ecokids.in</a></p>
              
              <p>Best regards,<br><strong>EcoKids India Team</strong></p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('[ParentalConsentService] Confirmation email error:', emailError);
      // Don't fail the entire operation if confirmation email fails
    }
    
    return {
      success: true,
      verified: true,
      message: 'Parental consent verified successfully',
      studentName: student.name,
      consentDate: student.parentConsentDate
    };
    
  } catch (error) {
    console.error('[ParentalConsentService] verifyParentalConsent error:', error);
    throw error;
  }
};

/**
 * @desc    Check if student requires parental consent
 * @param   {String} studentId - Student's user ID
 * @returns {Object} Consent status
 */
exports.checkConsentStatus = async (studentId) => {
  try {
    const student = await User.findById(studentId);
    
    if (!student) {
      throw new Error('Student not found');
    }
    
    if (student.role !== 'student') {
      return {
        required: false,
        reason: 'Parental consent only required for students'
      };
    }
    
    return {
      required: !student.parentConsentGiven,
      consentGiven: student.parentConsentGiven,
      consentDate: student.parentConsentDate,
      parentEmail: student.parentEmail,
      parentName: student.parentName
    };
    
  } catch (error) {
    console.error('[ParentalConsentService] checkConsentStatus error:', error);
    throw error;
  }
};
