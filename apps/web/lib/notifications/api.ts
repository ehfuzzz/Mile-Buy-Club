const JSON_HEADERS = {
  "Content-Type": "application/json"
};

type Body = Record<string, unknown>;

async function post(endpoint: string, body: Body) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Request to ${endpoint} failed with status ${response.status}`);
  }

  return response.json().catch(() => ({}));
}

export function subscribeToNotifications(subscription: PushSubscriptionJSON) {
  return post("/api/notifications/subscribe", { subscription });
}

export function unsubscribeFromNotifications(subscription: PushSubscriptionJSON | null) {
  return post("/api/notifications/unsubscribe", { subscription });
}

export function markNotificationsRead() {
  return post("/api/notifications/mark-read", {});
}
