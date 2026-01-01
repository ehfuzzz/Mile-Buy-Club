# Web app notes

## Onboarding chat

- The “Get started free” CTA routes to `/onboarding/chat`, launching the chat-based onboarding experience.
- The page expects `apps/api` to be running locally (default at `http://localhost:3001` via `NEXT_PUBLIC_API_BASE_URL`/`NEXT_PUBLIC_API_URL`).
- For AI responses, start a local `llama.cpp` server (example):

  ```bash
  ./llama-server -m /path/to/qwen2.5-7b-instruct.gguf -ngl 99 -c 8192 --host 127.0.0.1 --port 8080
  ```
