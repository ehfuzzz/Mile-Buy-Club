import React from 'react';

interface CardRecommendationEmailProps {
  userName: string;
  recommendations: Array<{
    name: string;
    issuer: string;
    annualFee: number;
    signupBonus: number;
    bonusValue: number;
    category: string;
    rating: number;
    recommendationScore: number;
    reason: string;
    benefits: string[];
    transferPartners: string[];
    applicationUrl: string;
  }>;
  portfolioAnalysis: {
    currentValue: number;
    potentialValue: number;
    gaps: string[];
    coverage: number;
  };
}

export function CardRecommendationEmail({ 
  userName, 
  recommendations, 
  portfolioAnalysis 
}: CardRecommendationEmailProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Credit Card Recommendations for {userName}</title>
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
          .analysis-section {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .analysis-title {
            font-size: 18px;
            font-weight: 600;
            color: #0c4a6e;
            margin: 0 0 16px 0;
          }
          .analysis-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin: 16px 0;
          }
          .analysis-item {
            text-align: center;
            padding: 12px;
            background: white;
            border-radius: 6px;
            border: 1px solid #bae6fd;
          }
          .analysis-number {
            font-size: 20px;
            font-weight: 700;
            color: #0c4a6e;
            margin: 0;
          }
          .analysis-label {
            font-size: 12px;
            color: #0c4a6e;
            margin: 4px 0 0 0;
          }
          .card-recommendation {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 16px 0;
            background: #f9fafb;
          }
          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }
          .card-name {
            font-size: 18px;
            font-weight: 700;
            color: #1f2937;
            margin: 0;
          }
          .card-issuer {
            font-size: 14px;
            color: #6b7280;
            margin: 4px 0 0 0;
          }
          .score-badge {
            background: #10b981;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
          }
          .card-metrics {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin: 16px 0;
          }
          .metric-item {
            text-align: center;
            padding: 12px;
            background: white;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
          }
          .metric-label {
            font-size: 11px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          .metric-value {
            font-size: 16px;
            font-weight: 700;
            color: #1f2937;
          }
          .price {
            color: #059669;
          }
          .rating {
            color: #f59e0b;
          }
          .card-reason {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 12px;
            margin: 16px 0;
          }
          .reason-text {
            color: #92400e;
            font-weight: 600;
            margin: 0;
          }
          .benefits-section {
            margin: 16px 0;
          }
          .benefits-title {
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 8px 0;
          }
          .benefits-list {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }
          .benefit-tag {
            background: #e5e7eb;
            color: #374151;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
          }
          .transfer-partners {
            margin: 16px 0;
          }
          .partners-title {
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 8px 0;
          }
          .partners-list {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }
          .partner-tag {
            background: #dbeafe;
            color: #1e40af;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
          }
          .apply-button {
            display: inline-block;
            background: #1e40af;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            text-align: center;
            margin: 16px 0;
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
            .analysis-grid {
              grid-template-columns: 1fr;
            }
            .card-metrics {
              grid-template-columns: 1fr;
            }
            .card-header {
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
            <h1>💳 Credit Card Recommendations</h1>
            <p>Optimize your travel rewards portfolio</p>
          </div>
          
          <div className="content">
            <p>Hi {userName},</p>
            <p>We&apos;ve analyzed your current credit card portfolio and found some excellent opportunities to maximize your travel rewards. Here are our top recommendations:</p>
            
            <div className="analysis-section">
              <h3 className="analysis-title">📊 Your Portfolio Analysis</h3>
              <div className="analysis-grid">
                <div className="analysis-item">
                  <div className="analysis-number">${portfolioAnalysis.currentValue.toLocaleString()}</div>
                  <div className="analysis-label">Current Value</div>
                </div>
                <div className="analysis-item">
                  <div className="analysis-number">${portfolioAnalysis.potentialValue.toLocaleString()}</div>
                  <div className="analysis-label">Potential Value</div>
                </div>
                <div className="analysis-item">
                  <div className="analysis-number">{portfolioAnalysis.coverage}%</div>
                  <div className="analysis-label">Program Coverage</div>
                </div>
                <div className="analysis-item">
                  <div className="analysis-number">{portfolioAnalysis.gaps.length}</div>
                  <div className="analysis-label">Gaps Identified</div>
                </div>
              </div>
            </div>
            
            {recommendations.map((card, index) => (
              <div key={index} className="card-recommendation">
                <div className="card-header">
                  <div>
                    <div className="card-name">{card.name}</div>
                    <div className="card-issuer">{card.issuer}</div>
                  </div>
                  <div className="score-badge">Score: {card.recommendationScore}/100</div>
                </div>
                
                <div className="card-metrics">
                  <div className="metric-item">
                    <div className="metric-label">Annual Fee</div>
                    <div className="metric-value price">${card.annualFee}</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-label">Signup Bonus</div>
                    <div className="metric-value">{card.signupBonus.toLocaleString()}</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-label">Value</div>
                    <div className="metric-value price">${card.bonusValue}</div>
                  </div>
                </div>
                
                <div className="card-reason">
                  <p className="reason-text">💡 {card.reason}</p>
                </div>
                
                <div className="benefits-section">
                  <div className="benefits-title">Key Benefits</div>
                  <div className="benefits-list">
                    {card.benefits.map((benefit, benefitIndex) => (
                      <span key={benefitIndex} className="benefit-tag">{benefit}</span>
                    ))}
                  </div>
                </div>
                
                <div className="transfer-partners">
                  <div className="partners-title">Transfer Partners</div>
                  <div className="partners-list">
                    {card.transferPartners.map((partner, partnerIndex) => (
                      <span key={partnerIndex} className="partner-tag">{partner}</span>
                    ))}
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <a href={card.applicationUrl} className="apply-button">
                    Apply for {card.name}
                  </a>
                </div>
              </div>
            ))}
            
            <p>These recommendations are based on your current portfolio, spending patterns, and travel goals. Each card has been carefully selected to fill gaps in your rewards strategy.</p>
            
            <p>Ready to optimize your travel rewards? Start with the highest-scoring card and work your way down the list!</p>
            
            <p>Happy travels!<br />The Mile Buy Club Team</p>
          </div>
          
          <div className="footer">
            <p>
              You received this because you have card recommendations enabled.<br />
              <a href="#" style={{ color: '#6b7280' }}>Manage your preferences</a> | 
              <a href="#" style={{ color: '#6b7280' }}> Unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
