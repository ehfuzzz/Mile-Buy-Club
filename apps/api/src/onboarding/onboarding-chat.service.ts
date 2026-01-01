import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  applyStatePatch,
  computeMissingFields,
  constraintsToRules,
  createLogger,
  onboardingLLMResultSchema,
  OnboardingState,
  StatePatch,
} from '@mile/shared';
import { PrismaService } from '../common/prisma/prisma.service';
import { LlamaClientService } from './llama-client.service';

@Injectable()
export class OnboardingChatService {
  private readonly logger = new Logger(OnboardingChatService.name);
  private readonly structuredLogger = createLogger('OnboardingChatService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly llama: LlamaClientService,
  ) {}

  async createSession(dto: { sessionId?: string; userId?: string }) {
    const existing = dto.sessionId
      ? await this.prisma.onboardingChatSession.findUnique({ where: { id: dto.sessionId } })
      : null;

    if (existing) {
      return this.toResponse(existing);
    }

    const created = await this.prisma.onboardingChatSession.create({
      data: { state: {}, messages: [], userId: dto.userId ?? null },
    });
    return this.toResponse(created);
  }

  async appendMessage(dto: { sessionId: string; message: string }) {
    const session = await this.prisma.onboardingChatSession.findUnique({ where: { id: dto.sessionId } });
    if (!session) {
      throw new HttpException({ message: 'Session not found' }, HttpStatus.NOT_FOUND);
    }

    const messages = [...((session.messages as Prisma.JsonValue as any[]) ?? []), this.buildMessage('user', dto.message)];

    const lastMessages = messages.slice(-12);
    const prompt = this.buildPrompt(session.state as Prisma.JsonValue, lastMessages);

    let llmResult: unknown;
    try {
      llmResult = await this.llama.chat(prompt);
    } catch (error) {
      this.structuredLogger.error('LLM unreachable', {
        sessionId: this.tail(session.id),
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }

    const parsed = onboardingLLMResultSchema.safeParse(llmResult);
    if (!parsed.success) {
      this.structuredLogger.warn('LLM parse failed', {
        sessionId: this.tail(session.id),
        errors: parsed.error.issues,
      });
      const updated = await this.prisma.onboardingChatSession.update({
        where: { id: session.id },
        data: { messages },
      });
      return {
        ...this.toResponse(updated),
        assistantMessage: 'I had trouble understanding that. Can you restate your request?',
        questions: [],
      };
    }

    const result = parsed.data;
    let state = session.state as OnboardingState;
    let applied = false;

    if (result.state_patch) {
      try {
        state = applyStatePatch(state, result.state_patch as StatePatch);
        applied = true;
      } catch (error) {
        this.structuredLogger.warn('State patch validation failed', {
          sessionId: this.tail(session.id),
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const rules = constraintsToRules(state);
    const missingFields = computeMissingFields(state);

    const assistantMessage = result.assistant_message;
    const questions = result.questions;

    const updated = await this.prisma.onboardingChatSession.update({
      where: { id: session.id },
      data: {
        state: applied ? (state as Prisma.JsonValue) : session.state,
        messages: [
          ...messages,
          this.buildMessage('assistant', assistantMessage),
        ] as Prisma.JsonValue,
      },
    });

    this.structuredLogger.info(applied ? 'onboarding_state_patch_applied' : 'onboarding_llm_parse_failed', {
      sessionIdSuffix: this.tail(session.id),
      missingFieldsCount: missingFields.length,
      ruleCount: rules.length,
    });

    return {
      ...this.toResponse(updated, applied ? state : (session.state as OnboardingState)),
      assistantMessage,
      questions,
      missingFields,
      rules,
      done: missingFields.length === 0,
    };
  }

  private toResponse(session: { id: string; state: Prisma.JsonValue }, state?: OnboardingState) {
    const safeState = (state ?? (session.state as OnboardingState)) ?? {};
    return {
      sessionId: session.id,
      state: safeState,
      missingFields: computeMissingFields(safeState),
      rules: constraintsToRules(safeState),
    };
  }

  private buildPrompt(state: Prisma.JsonValue, messages: any[]) {
    const system = `You are an onboarding assistant. Respond with STRICT JSON only matching OnboardingLLMResult.
Do not invent airport codes or dates. Use only provided information.`;

    return [
      { role: 'system', content: system },
      { role: 'system', content: `Current state: ${JSON.stringify(state ?? {})}` },
      ...messages,
    ];
  }

  private buildMessage(role: 'user' | 'assistant', content: string) {
    return { role, content, ts: new Date().toISOString() };
  }

  private tail(id: string) {
    return id.slice(-6);
  }
}
