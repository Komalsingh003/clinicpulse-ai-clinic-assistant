// Runs your 6 expected outputs from Prompt 2 through the validator, plus bad-output checks.
import { validate } from "./validate.js";
const good = [
 {sentiment:"negative",topic:"wait_time",urgency:"medium",key_issue:"Long unexplained wait past appointment time",needs_human_review:false,draft_reply:"Thank you for your feedback, and we are sorry that your visit did not run on time or that you were left without an update. We understand how frustrating this can be. Please contact the clinic directly if you would like to discuss your experience."},
 {sentiment:"positive",topic:"staff",urgency:"low",key_issue:"Kind, caring reception and clinic team",needs_human_review:false,draft_reply:"Thank you so much for your kind words, we are delighted to hear you felt looked after. Positive feedback like this is greatly appreciated by our team. If you ever have any concerns, please contact the clinic directly."},
 {sentiment:"negative",topic:"staff",urgency:"high",key_issue:"Concern about urgency handling at reception",needs_human_review:true,draft_reply:"Thank you for raising this, and we are very sorry to hear about your experience. We appreciate you bringing this to our attention. Please contact the clinic directly to discuss your concerns."},
 {sentiment:"neutral",topic:"booking",urgency:"low",key_issue:"Friendly doctor but frustrating online booking system",needs_human_review:false,draft_reply:"Thank you for taking the time to share your feedback, including your kind comments about the doctor. We are sorry the online booking system was frustrating to use. Please contact the clinic directly if you would like to discuss your experience or have any concerns."},
 {sentiment:"neutral",topic:"other",urgency:"low",key_issue:"Unclear or no review content",needs_human_review:true,draft_reply:"Thank you for getting in touch with us. Your message was not clear to us, so we were unable to understand your feedback. Please contact the clinic directly if you have any feedback or concerns."},
 {sentiment:"positive",topic:"booking",urgency:"low",key_issue:"Easy online booking and short wait",needs_human_review:true,draft_reply:"Thank you for your positive feedback, we are glad your experience was a smooth one. Your comments are appreciated. Please contact the clinic directly if you have any concerns or would like to discuss your visit."},
];
let fail = 0;
good.forEach((g, i) => { const e = validate(g); if (e.length) { fail++; console.log(`FAIL example ${i+1}:`, e); } else console.log(`PASS example ${i+1}`); });
const bad = [
 [{...good[2], needs_human_review:false}, "high urgency without human review"],
 [{...good[0], draft_reply:"Sorry about that. We will look into this. Please contact us."}, "promise phrase"],
 [{...good[0], key_issue:"one two three four five six seven eight nine"}, "key_issue too long"],
 [{...good[0], urgency:"severe"}, "invalid enum"],
 [{...good[0], draft_reply:"Sorry about that."}, "only one sentence"],
];
bad.forEach(([o, why]) => { const e = validate(o); if (!e.length) { fail++; console.log(`FAIL (should reject): ${why}`); } else console.log(`PASS rejects: ${why}`); });
process.exit(fail ? 1 : 0);
