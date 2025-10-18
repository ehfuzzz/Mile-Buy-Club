import React from 'react';

interface DealAlertEmailProps {
  userName: string;
  deal: {
    route: string;
    airline: string;
    cabin: string;
    price: number;
    miles: number;
    cpp: number;
    value: number;
    expiresAt: string;
    bookingUrl: string;
  };
  watcherName: string;
}

export function DealAlertEmail({ userName, deal, watcherName }: DealAlertEmailProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Hot Deal Alert - {deal.route}</title>
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
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .header p {
            margin: 8px 0 0 0;
            opacity: 0.9;
          }
          .content {
            padding: 30px;
          }
          .deal-card {
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 24px;
            margin: 20px 0;
            background: #f9fafb;
          }
          .deal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }
          .route {
            font-size: 20px;
            font-weight: 700;
            color: #1f2937;
          }
          .value-badge {
            background: #10b981;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
          }
          .deal-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 20px;
          }
          .detail-item {
            text-align: center;
          }
          .detail-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          .detail-value {
            font-size: 18px;
            font-weight: 700;
            color: #1f2937;
          }
          .price {
            color: #059669;
          }
          .cpp {
            color: #dc2626;
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
            text-align: center;
            margin: 20px 0;
            transition: background-color 0.2s;
          }
          .cta-button:hover {
            background: #1d4ed8;
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
          .urgency {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 12px;
            margin: 16px 0;
            text-align: center;
          }
          .urgency-text {
            color: #92400e;
            font-weight: 600;
            margin: 0;
          }
          @media (max-width: 600px) {
            .deal-details {
              grid-template-columns: 1fr;
            }
            .deal-header {
              flex-direction: column;
              gap: 12px;
              text-align: center;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1>🔥 Hot Deal Alert!</h1>
            <p>We found an amazing deal for your watcher: {watcherName}</p>
          </div>
          
          <div className="content">
            <p>Hi {userName},</p>
            <p>Great news! We found a fantastic deal that matches your watcher criteria. This deal has a high value score and won&apos;t last long!</p>
            
            <div className="deal-card">
              <div className="deal-header">
                <div className="route">{deal.route}</div>
                <div className="value-badge">Score: {deal.value}/100</div>
              </div>
              
              <div className="deal-details">
                <div className="detail-item">
                  <div className="detail-label">Airline</div>
                  <div className="detail-value">{deal.airline}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Cabin</div>
                  <div className="detail-value">{deal.cabin}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Cash Price</div>
                  <div className="detail-value price">${deal.price.toLocaleString()}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Miles Required</div>
                  <div className="detail-value">{deal.miles.toLocaleString()}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Cents per Point</div>
                  <div className="detail-value cpp">{deal.cpp}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Expires</div>
                  <div className="detail-value">{new Date(deal.expiresAt).toLocaleDateString()}</div>
                </div>
              </div>
              
              <div className="urgency">
                <p className="urgency-text">⏰ This deal expires soon - book now to secure your seats!</p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <a href={deal.bookingUrl} className="cta-button">
                  Book This Deal Now
                </a>
              </div>
            </div>
            
            <p>This deal was found by your watcher and has been automatically scored based on your preferences. Don&apos;t miss out!</p>
            
            <p>Happy travels!<br />The Mile Buy Club Team</p>
          </div>
          
          <div className="footer">
            <p>
              You received this email because you have an active watcher for this route.<br />
              <a href="#" style={{ color: '#6b7280' }}>Manage your watchers</a> | 
              <a href="#" style={{ color: '#6b7280' }}> Unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
