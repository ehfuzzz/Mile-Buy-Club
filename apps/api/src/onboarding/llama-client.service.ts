import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { onboardingLLMResultSchema, OnboardingLLMResult } from '@mile/shared';

class LlamaUnreachableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LlamaUnreachableError';
  }
}

@Injectable()
export class LlamaClientService {
  private baseUrl = process.env.LLAMA_CPP_BASE_URL || 'http://127.0.0.1:8080/v1';
  private model = process.env.LLAMA_CPP_MODEL || 'local-qwen';
  private temperature = Number(process.env.LLAMA_CPP_TEMPERATURE ?? 0.2);
  private timeoutMs = 15000;

  async chat(messages: { role: string; content: string }[]): Promise<OnboardingLLMResult> {
    try {
      const content = await this.callWithRetry(messages);
      const parsed = this.extractJson(content);
      const validated = onboardingLLMResultSchema.safeParse(parsed);
      if (!validated.success) {
        throw new HttpException(
          { errorCode: 'LLM_PARSE_FAILED', message: 'Model returned invalid JSON' },
          HttpStatus.BAD_REQUEST,
        );
      }
      return validated.data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof LlamaUnreachableError) {
        throw new HttpException(
          {
            code: 'LLM_UNREACHABLE',
            message: 'Local AI not running',
            details: { baseUrl: this.baseUrl },
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      throw new HttpException(
        { errorCode: 'LLM_UNKNOWN_ERROR', message: (error as Error).message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async callWithRetry(messages: { role: string; content: string }[]) {
    try {
      return await this.call(messages);
    } catch (error) {
      if (error instanceof LlamaUnreachableError) {
        return await this.call(messages);
      }
      throw error;
    }
  }

  private async call(messages: { role: string; content: string }[]) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: this.temperature,
        }),
      });

      if (!response.ok) {
        throw new LlamaUnreachableError(`Bad response: ${response.status}`);
      }

      const json = (await response.json()) as { choices?: { message?: { content?: string } }[] };
      const content = json.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('LLM returned empty content');
      }
      return content;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new LlamaUnreachableError('LLM request timed out');
      }
      if (error instanceof LlamaUnreachableError) {
        throw error;
      }
      if (error instanceof Error && /fetch|network/i.test(error.message)) {
        throw new LlamaUnreachableError('Network error');
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private extractJson(content: string): unknown {
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    const candidate = firstBrace !== -1 && lastBrace !== -1 ? content.slice(firstBrace, lastBrace + 1) : content;
    return JSON.parse(candidate);
  }
}
