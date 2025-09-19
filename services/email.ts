export const createConfirmationEmailHtml = (name: string, appUrl: string): string => {
  const socialLinks = {
    twitter: `https://twitter.com/intent/tweet?text=I've%20just%20applied%20for%20the%20Global%20Internship%20Initiative%20with%2059club%20Academy!%20Find%20out%20more%20here:%20${encodeURIComponent(appUrl)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(appUrl)}&title=Global%20Internship%20Initiative&summary=I've%20just%20applied%20for%20the%20Global%20Internship%20Initiative%20with%2059club%20Academy!`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`,
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Confirmation</title>
        <style>
            body { font-family: 'Poppins', sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
            .header { background: linear-gradient(to right, #f472b6, #8b5cf6); padding: 40px; text-align: center; }
            .header h1 { margin: 0; color: #ffffff; font-size: 24px; }
            .content { padding: 30px; color: #334155; line-height: 1.6; }
            .content p { margin: 0 0 15px; }
            .button { display: inline-block; background-color: #ec4899; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; }
            .socials { text-align: center; padding: 20px; border-top: 1px solid #e2e8f0; }
            .socials a { margin: 0 10px; display: inline-block; }
            .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>59club Academy</h1>
            </div>
            <div class="content">
                <h2>Thank you for your application, ${name}!</h2>
                <p>We've successfully received your expression of interest for the Global Internship Initiative.</p>
                <p>The next step is a short video interview, which you should have been redirected to after submitting the form. If not, please check your email for a direct link from Hireflix.</p>
                <p>We're excited to learn more about you and will be in touch soon after reviewing your submission.</p>
                <p>Best regards,<br>The 59club Academy Team</p>
            </div>
            <div class="socials">
                <p style="margin-bottom: 15px; font-weight: bold; color: #475569;">Share your journey:</p>
                <a href="${socialLinks.twitter}" target="_blank">Twitter</a> |
                <a href="${socialLinks.linkedin}" target="_blank">LinkedIn</a> |
                <a href="${socialLinks.facebook}" target="_blank">Facebook</a>
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} 59club Academy & Global Talent Solutions.
            </div>
        </div>
    </body>
    </html>
  `;
};

export const createInterviewCompleteEmailHtml = (name: string, appUrl: string): string => {
  const socialLinks = {
    twitter: `https://twitter.com/intent/tweet?text=I've%20just%20completed%20my%20video%20interview%20for%20the%20Global%20Internship%20Initiative%20with%2059club%20Academy!%20Excited%20about%20this%20opportunity.%20Find%20out%20more:%20${encodeURIComponent(appUrl)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(appUrl)}&title=Global%20Internship%20Initiative%20Interview%20Complete&summary=I've%20just%20completed%20my%20video%20interview%20for%20the%20Global%20Internship%20Initiative%20with%2059club%20Academy!%20Excited%20about%20this%20international%20opportunity.`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`,
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Interview Received</title>
        <style>
            body { font-family: 'Poppins', sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
            .header { background: linear-gradient(to right, #a855f7, #4f46e5); padding: 40px; text-align: center; }
            .header h1 { margin: 0; color: #ffffff; font-size: 24px; }
            .content { padding: 30px; color: #334155; line-height: 1.6; }
            .content p { margin: 0 0 15px; }
            .socials { text-align: center; padding: 20px; border-top: 1px solid #e2e8f0; }
            .socials a { margin: 0 10px; display: inline-block; }
            .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Interview Received!</h1>
            </div>
            <div class="content">
                <h2>Thank you for completing your video interview, ${name}!</h2>
                <p>We have successfully received your submission. Your application is now under review by our team.</p>
                <p>We appreciate you taking the time to share more about yourself. We will get back to you with the next steps as soon as possible.</p>
                <p><strong>Help us spread the word!</strong> Share your journey with friends and colleagues who might be interested in this amazing opportunity.</p>
                <p>Best regards,<br>The Global Internship Initiative Team</p>
            </div>
            <div class="socials">
                <p style="margin-bottom: 15px; font-weight: bold; color: #475569;">Share your achievement:</p>
                <a href="${socialLinks.twitter}" target="_blank" style="margin: 0 10px; display: inline-block; background-color: #1da1f2; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px;">Twitter</a>
                <a href="${socialLinks.linkedin}" target="_blank" style="margin: 0 10px; display: inline-block; background-color: #0077b5; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px;">LinkedIn</a>
                <a href="${socialLinks.facebook}" target="_blank" style="margin: 0 10px; display: inline-block; background-color: #1877f2; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px;">Facebook</a>
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} Global Internship Initiative & 59club Academy.
            </div>
        </div>
    </body>
    </html>
  `;
};