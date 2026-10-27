// Code-level safety net: never trust raw LLM output.
const KEYS = ["sentiment", "topic", "urgency", "key_issue", "needs_human_review", "draft_reply"];
const ENUMS = {
  sentiment: ["positive", "neutral", "negative"],
  topic: ["wait_time", "staff", "booking", "billing", "cleanliness", "other"],
  urgency: ["low", "medium", "high"],
};
const PROMISE = /\b(we will|we'll|we promise|we guarantee|rest assured|won't happen again|will be in touch|someone will)\b/i;
const CONTACT_INFO = /(\d{6,}|@|https?:\/\/|www\.)/i;

export function parseJson(text) {
  const clean = String(text).replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// Returns a list of problems (empty list = valid).
export function validate(o) {
  const errors = [];
  if (!o || typeof o !== "object" || Array.isArray(o)) return ["Output is not a JSON object"];
  const keys = Object.keys(o);
  if (keys.length !== KEYS.length || !KEYS.every((k) => keys.includes(k)))
    errors.push(`Keys must be exactly: ${KEYS.join(", ")}`);
  for (const [f, allowed] of Object.entries(ENUMS))
    if (!allowed.includes(o[f])) errors.push(`${f} must be one of: ${allowed.join(", ")}`);
  if (typeof o.needs_human_review !== "boolean") errors.push("needs_human_review must be a boolean");
  if (typeof o.key_issue !== "string" || !o.key_issue.trim() || o.key_issue.trim().split(/\s+/).length > 8)
    errors.push("key_issue must be a string of 8 words or fewer");
  if (o.urgency === "high" && o.needs_human_review !== true)
    errors.push("needs_human_review must be true when urgency is high");
  if (typeof o.draft_reply !== "string") errors.push("draft_reply must be a string");
  else {
    const n = o.draft_reply.split(/(?<=[.!?])\s+/).filter(Boolean).length;
    if (n < 2 || n > 3) errors.push("draft_reply must be 2 to 3 sentences");
    if (PROMISE.test(o.draft_reply)) errors.push("draft_reply must not contain promises");
    if (CONTACT_INFO.test(o.draft_reply)) errors.push("draft_reply must not contain contact details");
  }
  return errors;
}
