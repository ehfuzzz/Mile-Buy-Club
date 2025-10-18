import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CardsService } from './cards.service';

@ApiTags('cards')
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get('recommendations')
  @ApiOperation({ summary: 'Get card recommendations for a user' })
  @ApiQuery({ name: 'userId', required: true, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Card recommendations generated',
    schema: {
      example: {
        recommendations: [
          {
            card: {
              id: 'amex-platinum',
              name: 'American Express Platinum',
              annualFee: 695,
            },
            score: 85,
            reasons: [
              'Fills gap in Amex Membership Rewards coverage',
              'High signup bonus worth $1600',
              'Includes lounge access benefits',
            ],
            gapsFilled: ['Amex Membership Rewards', 'Delta SkyMiles'],
            estimatedAnnualValue: 1200,
            effectiveAnnualFee: 306,
          },
        ],
      },
    },
  })
  async getRecommendations(
    @Query('userId') userId: string,
    @Query('limit') limit?: number
  ) {
    return this.cardsService.getRecommendations(userId, limit ? +limit : 3);
  }

  @Get('portfolio/:userId')
  @ApiOperation({ summary: 'Analyze user card portfolio' })
  @ApiResponse({
    status: 200,
    description: 'Portfolio analysis',
    schema: {
      example: {
        gaps: [
          {
            program: 'Marriott Bonvoy',
            importance: 'medium',
            reason: 'Major hotel chain with global presence',
          },
        ],
        balance: {
          hasFlexiblePoints: true,
          hasAirlineCard: true,
          hasHotelCard: false,
          hasNoFeeCard: false,
          needsImprovement: ['Add a hotel card for status/benefits'],
        },
      },
    },
  })
  async analyzePortfolio(@Param('userId') userId: string) {
    return this.cardsService.analyzePortfolio(userId);
  }

  @Get('catalog')
  @ApiOperation({ summary: 'Get all available cards' })
  @ApiResponse({ status: 200, description: 'List of all cards' })
  async getAllCards() {
    return this.cardsService.getAllCards();
  }

  @Get(':cardId')
  @ApiOperation({ summary: 'Get card details by ID' })
  @ApiResponse({ status: 200, description: 'Card details' })
  @ApiResponse({ status: 404, description: 'Card not found' })
  async getCardById(@Param('cardId') cardId: string) {
    return this.cardsService.getCardById(cardId);
  }
}
