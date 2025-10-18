import React from 'react';

interface WeeklyDigestEmailProps {
  userName: string;
  week: {
    startDate: string;
    endDate: string;
  };
  stats: {
    dealsFound: number;
    topDeals: number;
    savings: number;
    watchers: number;
  };
  topDeals: Array<{
    route: string;
    airline: string;
    price: number;
    miles: number;
    cpp: number;
    value: number;
    bookingUrl: string;
  }>;
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    actionUrl: string;
  }>;
}

export function WeeklyDigestEmail({ 
  userName, 
  week, 
  stats, 
  topDeals, 
  recommendations 
}: WeeklyDigestEmailProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Weekly Deal Digest - {week.startDate} to {week.endDate}</title>
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
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 20px 0;
          }
          .stat-card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          }
          .stat-number {
            font-size: 28px;
            font-weight: 700;
            color: #1e40af;
            margin: 0;
          }
          .stat-label {
            font-size: 14px;
            color: #6b7280;
            margin: 4px 0 0 0;
          }
          .section {
            margin: 30px 0;
          }
          .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 16px 0;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
          }
          .deal-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
            margin: 12px 0;
            background: #f9fafb;
          }
          .deal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }
          .route {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
          }
          .value-badge {
            background: #10b981;
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
          }
          .deal-details {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 12px;
          }
          .detail-item {
            text-align: center;
          }
          .detail-label {
            font-size: 11px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
          }
          .detail-value {
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
          }
          .price {
            color: #059669;
          }
          .cpp {
            color: #dc2626;
          }
          .deal-button {
            display: inline-block;
            background: #1e40af;
            color: white;
            padding: 8px 16px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 12px;
            text-align: center;
            margin-top: 8px;
          }
          .recommendation {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 16px;
            margin: 12px 0;
          }
          .recommendation-title {
            font-size: 16px;
            font-weight: 600;
            color: #0c4a6e;
            margin: 0 0 8px 0;
          }
          .recommendation-description {
            font-size: 14px;
            color: #0c4a6e;
            margin: 0 0 12px 0;
          }
          .recommendation-button {
            display: inline-block;
            background: #0ea5e9;
            color: white;
            padding: 8px 16px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 12px;
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
          @media (max-width: 600px) {
            .stats-grid {
              grid-template-columns: 1fr;
            }
            .deal-details {
              grid-template-columns: 1fr;
            }
            .deal-header {
              flex-direction: column;
              gap: 8px;
              text-align: center;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1>📊 Your Weekly Deal Digest</h1>
            <p>{week.startDate} - {week.endDate}</p>
          </div>
          
          <div className="content">
            <p>Hi {userName},</p>
            <p>Here&apos;s your weekly summary of the best deals we found for you. We&apos;ve been busy monitoring your watchers and found some incredible opportunities!</p>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{stats.dealsFound}</div>
                <div className="stat-label">Deals Found</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.topDeals}</div>
                <div className="stat-label">Top Deals</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">${stats.savings.toLocaleString()}</div>
                <div className="stat-label">Potential Savings</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.watchers}</div>
                <div className="stat-label">Active Watchers</div>
              </div>
            </div>
            
            <div className="section">
              <h2 className="section-title">🔥 This Week&apos;s Top Deals</h2>
              {topDeals.map((deal, index) => (
                <div key={index} className="deal-card">
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
                      <div className="detail-label">Price</div>
                      <div className="detail-value price">${deal.price.toLocaleString()}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">CPP</div>
                      <div className="detail-value cpp">{deal.cpp}</div>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <a href={deal.bookingUrl} className="deal-button">
                      View Deal
                    </a>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="section">
              <h2 className="section-title">💡 Recommendations for You</h2>
              {recommendations.map((rec, index) => (
                <div key={index} className="recommendation">
                  <div className="recommendation-title">{rec.title}</div>
                  <div className="recommendation-description">{rec.description}</div>
                  <a href={rec.actionUrl} className="recommendation-button">
                    {rec.type === 'watcher' ? 'Create Watcher' : 
                     rec.type === 'card' ? 'View Cards' : 'Learn More'}
                  </a>
                </div>
              ))}
            </div>
            
            <p>Keep an eye on your inbox for instant alerts when we find deals that match your criteria. Happy deal hunting!</p>
            
            <p>Best regards,<br />The Mile Buy Club Team</p>
          </div>
          
          <div className="footer">
            <p>
              You&apos;re receiving this because you have active watchers.<br />
              <a href="#" style={{ color: '#6b7280' }}>Manage your preferences</a> | 
              <a href="#" style={{ color: '#6b7280' }}> Unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
