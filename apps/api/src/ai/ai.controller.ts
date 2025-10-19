import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiOrchestratorService } from './ai-orchestrator.service';
import { PlanTripDto } from './dto/plan-trip.dto';
import { ChatDto } from './dto/chat.dto';
import { AnalyzeMediaDto } from './dto/analyze-media.dto';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly orchestrator: AiOrchestratorService) {}

  @Post('plan')
  @ApiOperation({
    summary: 'Create or update an AI-powered trip plan',
    description:
      'Uses the Mile Buy Club AI orchestrator to stitch user preferences, live deals, and loyalty data into a personalized itinerary.',
  })
  async planTrip(@Body() dto: PlanTripDto) {
    return this.orchestrator.planTrip(dto);
  }

  @Post('chat')
  @ApiOperation({
    summary: 'Continue a conversational planning session',
    description:
      'Maintains conversational memory across sessions to answer follow-up questions, adjust plans, and surface personalized suggestions.',
  })
  async chat(@Body() dto: ChatDto) {
    return this.orchestrator.continueConversation(dto);
  }

  @Post('media/analyze')
  @ApiOperation({
    summary: 'Analyze images or video frames for location-aware insights',
    description:
      'Leverages multimodal models to recognize landmarks, infer vibes, and enrich itineraries with context from traveler-submitted media.',
  })
  async analyzeMedia(@Body() dto: AnalyzeMediaDto) {
    return this.orchestrator.analyzeMedia(dto);
  }
}
