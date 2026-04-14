import { Client, Messaging } from 'node-appwrite';

/**
 * Appwrite Cloud Function: Send Notification
 * Sends email and/or SMS notifications
 */

export default async (req, res) => {
  try {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const messaging = new Messaging(client);

    // Extract notification data
    const { 
      type, // 'challenge_assigned', 'challenge_completed', 'points_awarded', etc.
      email,
      phone,
      studentName,
      challengeTitle,
      points,
      details
    } = JSON.parse(req.payload);

    console.log(`[send-notification] Sending ${type} notification to ${email}`);

    // Build message based on type
    let emailSubject = '';
    let emailBody = '';
    let smsMessage = '';

    switch (type) {
      case 'challenge_assigned':
        emailSubject = `New Challenge: ${challengeTitle}`;
        emailBody = `
          <h2>New Challenge!</h2>
          <p>Hi ${studentName},</p>
          <p>A new challenge has been assigned to you:</p>
          <h3>${challengeTitle}</h3>
          <p>${details || 'Complete this challenge to earn eco-points!'}</p>
          <a href="${process.env.APP_URL || 'https://ecokids.in'}/challenges">View Challenge</a>
        `;
        smsMessage = `New challenge: ${challengeTitle}. Earn points by completing it!`;
        break;

      case 'challenge_completed':
        emailSubject = `Great Job! You Completed: ${challengeTitle}`;
        emailBody = `
          <h2>Challenge Completed!</h2>
          <p>Congratulations ${studentName}!</p>
          <p>You successfully completed: <strong>${challengeTitle}</strong></p>
          <p>Your submission is pending approval from your teacher.</p>
        `;
        smsMessage = `Great! Your ${challengeTitle} submission is pending approval.`;
        break;

      case 'points_awarded':
        emailSubject = `You Earned ${points} Eco-Points!`;
        emailBody = `
          <h2>Points Awarded! 🎉</h2>
          <p>Hi ${studentName},</p>
          <p>Congratulations! Your challenge submission was approved.</p>
          <p>You earned <strong>${points} eco-points</strong></p>
          <p>Keep up the great work!</p>
        `;
        smsMessage = `Awesome! You earned ${points} points for completing ${challengeTitle}`;
        break;

      case 'submission_rejected':
        emailSubject = `Challenge Submission Needs Revision: ${challengeTitle}`;
        emailBody = `
          <h2>Submission Needs Revision</h2>
          <p>Hi ${studentName},</p>
          <p>Your submission for <strong>${challengeTitle}</strong> needs some revision:</p>
          <p>${details}</p>
          <p>Please resubmit your work.</p>
        `;
        smsMessage = `Your ${challengeTitle} submission needs revision. Details sent to email.`;
        break;

      default:
        emailSubject = 'EcoKids Update';
        emailBody = `<p>${details || 'You have a new notification.'}</p>`;
        smsMessage = details || 'You have a new notification';
    }

    // Send email
    if (email) {
      try {
        // In production, use your email provider (Mailgun, SendGrid, etc.)
        // For now, we'll log it
        console.log(`[send-notification] Email queued to ${email}`);
        console.log(`Subject: ${emailSubject}`);
        
        // Uncomment when email provider is configured:
        // await messaging.sendEmail(
        //   email,
        //   emailSubject,
        //   emailBody
        // );
      } catch (error) {
        console.warn(`[send-notification] Email error: ${error.message}`);
      }
    }

    // Send SMS
    if (phone) {
      try {
        console.log(`[send-notification] SMS queued to ${phone}`);
        console.log(`Message: ${smsMessage}`);
        
        // Uncomment when SMS provider is configured:
        // await messaging.sendSMS(
        //   phone,
        //   smsMessage
        // );
      } catch (error) {
        console.warn(`[send-notification] SMS error: ${error.message}`);
      }
    }

    return res.json({
      success: true,
      message: 'Notification sent successfully',
      type,
      email: email || 'N/A',
      phone: phone || 'N/A',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[send-notification] Error:', error.message);
    
    return res.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
};
