import React from 'react';

interface WelcomeEmailProps {
  userName: string;
  userEmail: string;
  nextSteps: Array<{
    title: string;
    description: string;
    actionUrl: string;
    actionText: string;
  }>;
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

export function WelcomeEmail({ userName, nextSteps, features }: WelcomeEmailProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome to Mile Buy Club!</title>
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .header p {
            margin: 12px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
          }
          .content {
            padding: 40px 30px;
          }
          .welcome-message {
            text-align: center;
            margin-bottom: 30px;
          }
          .welcome-message h2 {
            font-size: 24px;
            color: #1f2937;
            margin: 0 0 12px 0;
          }
          .welcome-message p {
            font-size: 16px;
            color: #6b7280;
            margin: 0;
          }
          .features-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 30px 0;
          }
          .feature-card {
            text-align: center;
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: #f9fafb;
          }
          .feature-icon {
            font-size: 32px;
            margin-bottom: 12px;
          }
          .feature-title {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 8px 0;
          }
          .feature-description {
            font-size: 14px;
            color: #6b7280;
            margin: 0;
          }
          .next-steps {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 24px;
            margin: 30px 0;
          }
          .next-steps h3 {
            font-size: 18px;
            color: #0c4a6e;
            margin: 0 0 16px 0;
          }
          .step {
            margin: 16px 0;
            padding: 16px;
            background: white;
            border-radius: 6px;
            border: 1px solid #bae6fd;
          }
          .step-title {
            font-size: 16px;
            font-weight: 600;
            color: #0c4a6e;
            margin: 0 0 8px 0;
          }
          .step-description {
            font-size: 14px;
            color: #0c4a6e;
            margin: 0 0 12px 0;
          }
          .step-button {
            display: inline-block;
            background: #0ea5e9;
            color: white;
            padding: 8px 16px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
          }
          .cta-section {
            text-align: center;
            margin: 40px 0;
            padding: 30px;
            background: #f8f9fa;
            border-radius: 8px;
          }
          .cta-button {
            display: inline-block;
            background: #1e40af;
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 16px 8px;
          }
          .cta-button.secondary {
            background: #6b7280;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer p {
            margin: 0;
            font-size: 12px;
            color: #6b7280;
          }
          .social-links {
            margin: 16px 0;
          }
          .social-links a {
            display: inline-block;
            margin: 0 8px;
            color: #6b7280;
            text-decoration: none;
          }
          @media (max-width: 600px) {
            .features-grid {
              grid-template-columns: 1fr;
            }
            .cta-button {
              display: block;
              margin: 8px 0;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1>🎉 Welcome to Mile Buy Club!</h1>
            <p>Your journey to finding the best travel deals starts now</p>
          </div>
          
          <div className="content">
            <div className="welcome-message">
              <h2>Hi {userName}!</h2>
              <p>We&apos;re thrilled to have you join our community of savvy travelers. You&apos;re now part of an exclusive group that never pays full price for travel again!</p>
            </div>
            
            <div className="features-grid">
              {features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <div className="feature-title">{feature.title}</div>
                  <div className="feature-description">{feature.description}</div>
                </div>
              ))}
            </div>
            
            <div className="next-steps">
              <h3>🚀 Let&apos;s Get You Started</h3>
              {nextSteps.map((step, index) => (
                <div key={index} className="step">
                  <div className="step-title">{step.title}</div>
                  <div className="step-description">{step.description}</div>
                  <a href={step.actionUrl} className="step-button">
                    {step.actionText}
                  </a>
                </div>
              ))}
            </div>
            
            <div className="cta-section">
              <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>Ready to Start Saving?</h3>
              <p style={{ margin: '0 0 24px 0', color: '#6b7280' }}>
                Create your first watcher and start finding amazing deals today!
              </p>
              <a href="#" className="cta-button">Create Your First Watcher</a>
              <a href="#" className="cta-button secondary">Explore Features</a>
            </div>
            
            <p>If you have any questions, our support team is here to help. Just reply to this email or visit our help center.</p>
            
            <p>Happy travels!<br />The Mile Buy Club Team</p>
          </div>
          
          <div className="footer">
            <div className="social-links">
              <a href="#">Twitter</a>
              <a href="#">Facebook</a>
              <a href="#">Instagram</a>
              <a href="#">LinkedIn</a>
            </div>
            <p>
              Mile Buy Club - Never Pay Full Price for Travel Again<br />
              <a href="#" style={{ color: '#6b7280' }}>Unsubscribe</a> | 
              <a href="#" style={{ color: '#6b7280' }}> Privacy Policy</a> | 
              <a href="#" style={{ color: '#6b7280' }}> Terms of Service</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
