import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  CardRecommender,
  UserProfile,
  GapAnalyzer,
  CreditCard,
} from '@mile/shared/src/card-engine';
import { createLogger } from '@mile/shared/src/logger';

const logger = createLogger('CardsService');

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get card recommendations for a user
   */
  async getRecommendations(userId: string, limit: number = 3): Promise<any> {
    try {
      // TODO: Fetch user's actual cards and programs from database
      // const userCards = await this.prisma.userCard.findMany({
      //   where: { userId },
      // });

      // const userPrograms = await this.prisma.loyaltyProgram.findMany({
      //   where: { userId },
      // });

      // Mock user profile for now
      const userProfile: UserProfile = {
        cards: [
          {
            cardId: 'chase-sapphire-reserve',
            acquiredDate: new Date('2023-01-15'),
            closed: false,
          },
        ],
        programs: ['Chase Ultimate Rewards', 'United MileagePlus'],
        spendingPatterns: {
          travel: 8000,
          dining: 4000,
          hotels: 3000,
          other: 15000,
        },
        preferences: {
          maxAnnualFee: 500,
          valuationFocus: 'cpp',
        },
      };

      // Generate recommendations
      const recommendations = CardRecommender.recommend(userProfile, limit);

      logger.info('Card recommendations generated', {
        userId,
        count: recommendations.length,
      });

      return {
        recommendations,
        userProfile: {
          totalCards: userProfile.cards.filter((c) => !c.closed).length,
          programs: userProfile.programs,
        },
      };
    } catch (error) {
      logger.error('Failed to generate recommendations', {
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get portfolio analysis
   */
  async analyzePortfolio(userId: string): Promise<any> {
    try {
      // TODO: Fetch from database
      const userProfile: UserProfile = {
        cards: [
          {
            cardId: 'chase-sapphire-reserve',
            acquiredDate: new Date('2023-01-15'),
            closed: false,
          },
        ],
        programs: ['Chase Ultimate Rewards', 'United MileagePlus'],
      };

      const gaps = GapAnalyzer.identifyGaps(userProfile);
      const balance = GapAnalyzer.analyzeBalance(userProfile);

      return {
        gaps,
        balance,
        summary: {
          totalCards: userProfile.cards.filter((c) => !c.closed).length,
          programs: userProfile.programs.length,
          gapsIdentified: gaps.length,
          needsImprovement: balance.needsImprovement.length,
        },
      };
    } catch (error) {
      logger.error('Failed to analyze portfolio', {
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get all available cards
   */
  async getAllCards(): Promise<CreditCard[]> {
    const { default: cardDatabase } = await import('@mile/shared/src/card-engine');
    return (cardDatabase.cards as CreditCard[]).map((card) => ({
      ...card,
      id: card.cardId ?? card.id,
    }));
  }

  /**
   * Get card details by ID
   */
  async getCardById(cardId: string): Promise<CreditCard> {
    const { default: cardDatabase } = await import('@mile/shared/src/card-engine');
    const cards = cardDatabase.cards as CreditCard[];
    const card = cards.find((c) => (c.cardId ?? c.id) === cardId);

    if (!card) {
      throw new Error(`Card not found: ${cardId}`);
    }

    return { ...card, id: card.cardId ?? card.id };
  }
}
