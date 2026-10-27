# ClinicPulse – AI Clinic Growth Assistant

A web app that helps a GP clinic's front desk reply to patient reviews, write recall reminders, and spot what patients are saying. Built with AI tools for the Gokul Infocare *AI Growth & Automation Associate* assessment (Task 1, Automation + Healthcare).

**Live demo:** https://clinicpulse-ai-clinic-assistant.vercel.app
_Note: the backend runs on a free plan, so the first request after a pause can take up to a minute._

**Demo uses fake data only. Never enter real patient information.**

## What it does
- **Review Replier:** paste a patient review. The AI returns sentiment, topic, urgency, a short key issue, a "needs staff review" flag, and a polite draft reply.
- **Recall Messages:** generates short SMS or email reminders (flu shots, check-ups) without inventing appointments.
- **Insights dashboard:** summary cards, a sentiment donut, topic bars and the most common issues.

## How AI is used
- **In the app:** Groq API (`openai/gpt-oss-120b`) analyses reviews and writes messages.
- **To build it:** AI assistants were used to design the system prompt, write and test the code, and review the UI. All prompts and revisions are in the prompt documentation.

## Prompt engineering and reliability
- A strict system prompt with a fixed JSON schema, allowed values for every field, and explicit "must not" rules (no medical advice, no patient details, no promises).
- Review text is treated as **data, not instructions**, to resist prompt injection.
- **Validation layer in code:** checks keys, allowed values, key issue length, 2-3 sentence replies, promise phrases, and that high urgency always needs human review. If a response fails, the model is asked again with the errors, then falls back to a safe response for staff.
- Prompts were revised after testing (injection handling, recall wording).
- A human stays in the loop: replies are drafts for staff approval.

## Tech stack
React + Vite (frontend), Node.js + Express (backend), Groq API, hand-written SVG charts.

## Run locally
```bash
# backend
cd server
npm install
cp .env.example .env   # add your Groq key
npm test
npm start

# frontend (new terminal)
cd client
npm install
cp .env.example .env
npm run dev
```
Open http://localhost:5173

## Safety notes
Not medical advice. Do not use real patient data. Replying publicly to health reviews can reveal that someone is a patient, so every reply must be approved by staff.