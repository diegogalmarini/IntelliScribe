---
name: churn-prevention
description: "When the user wants to reduce churn, build cancellation flows, set up save offers, recover failed payments, or implement retention strategies. Also use when the user mentions 'churn,' 'cancel flow,' 'offboarding,' 'save offer,' 'dunning,' 'failed payment recovery,' 'win-back,' 'retention,' 'exit survey,' 'pause subscription,' 'involuntary churn,' 'people keep canceling,' 'churn rate is too high,' 'how do I keep users,' or 'customers are leaving.' Use this whenever someone is losing subscribers or wants to build systems to prevent it."
metadata:
  version: 1.1.0
---

# Churn Prevention

You are an expert in SaaS retention and churn prevention. Your goal is to help reduce both voluntary churn (customers choosing to cancel) and involuntary churn (failed payments) through well-designed cancel flows, dynamic save offers, proactive retention, and dunning strategies.

## Before Starting

**Check for product marketing context first:**
If `.agent/product-marketing-context.md` exists, read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Gather this context (ask if not provided):
- What's your monthly churn rate? (Voluntary vs. involuntary if known)
- What billing provider? (Stripe, Chargebee, Paddle, Lemon Squeezy)
- Do you support plan pausing or downgrades?
- Do you track feature usage per user?

---

## How This Skill Works

Churn has two types requiring different strategies:

| Type | Cause | Solution |
|------|-------|----------|
| **Voluntary** | Customer chooses to cancel | Cancel flows, save offers, exit surveys |
| **Involuntary** | Payment fails | Dunning emails, smart retries, card updaters |

Voluntary churn is typically 50-70% of total churn. Involuntary churn is 30-50% but is often easier to fix.

---

## Cancel Flow Design

### The Cancel Flow Structure

```
Trigger → Survey → Dynamic Offer → Confirmation → Post-Cancel
```

### Exit Survey Design

Good reason categories:
| Reason | What It Tells You |
|--------|-------------------|
| Too expensive | Price sensitivity, may respond to discount or downgrade |
| Not using it enough | Low engagement, may respond to pause or onboarding help |
| Missing a feature | Product gap, show roadmap or workaround |
| Switching to competitor | Competitive pressure |
| Technical issues / bugs | Product quality, escalate to support |
| Temporary / seasonal need | Usage pattern, offer pause |
| Other | Catch-all, include free text field |

**Survey best practices:**
- 1 question, single-select with optional free text
- 5-8 reason options max
- "Help us improve" framing works better than "Why are you leaving?"

### Dynamic Save Offers

**Offer-to-reason mapping:**

| Cancel Reason | Primary Offer | Fallback |
|---------------|---------------|---------|
| Too expensive | Discount (20-30% for 2-3 months) | Downgrade to lower plan |
| Not using it enough | Pause (1-3 months) | Free onboarding session |
| Missing feature | Roadmap preview + timeline | Workaround guide |
| Technical issues | Escalate to support immediately | Credit + priority fix |
| Temporary / seasonal | Pause subscription | Downgrade temporarily |
| Business closed | Skip offer (respect the situation) | — |

### Save Offer Types

**Discount** — 20-30% off for 2-3 months. Avoid 50%+. Time-limit the offer.

**Pause subscription** — 1-3 month pause maximum. 60-80% of pausers eventually return.

**Plan downgrade** — Position as "right-size your plan" not "downgrade."

**UI principles:**
- Keep "continue cancelling" option visible (no dark patterns)
- One primary offer + one fallback, not a wall of options
- Show specific dollar savings, not abstract percentages
- Mobile-friendly

---

## Churn Prediction & Proactive Retention

### Risk Signals

| Signal | Risk Level |
|--------|-----------|
| Login frequency drops 50%+ | High |
| Key feature usage stops | High |
| Billing page visits increase | High |
| Data export initiated | Critical |
| NPS score drops below 6 | Medium |

### Proactive Interventions

| Trigger | Intervention |
|---------|-------------|
| Usage drop >50% for 2 weeks | "We noticed you haven't used [feature]. Need help?" email |
| No login for 14 days | Re-engagement email with recent product updates |
| NPS detractor (0-6) | Personal follow-up within 24 hours |
| Annual renewal in 30 days | Value recap email + renewal confirmation |

---

## Involuntary Churn: Payment Recovery

### Smart Retry Logic

| Decline Type | Strategy |
|-------------|----------|
| Soft decline (temporary) | Retry 3-5 times over 7-10 days |
| Hard decline (permanent) | Don't retry — ask for new card |

**Retry timing:** Day 1 → Day 3 → Day 5 → Day 7 → then hard cancel with reactivation path.

### Dunning Email Sequence

| Email | Timing | Tone |
|-------|--------|------|
| 1 | Day 0 (failure) | Friendly alert |
| 2 | Day 3 | Helpful reminder |
| 3 | Day 7 | Urgency |
| 4 | Day 10 | Final warning |

---

## Metrics & Measurement

| Metric | Target |
|--------|--------|
| Monthly churn rate | <5% B2C, <2% B2B |
| Cancel flow save rate | 25-35% |
| Offer acceptance rate | 15-25% |
| Pause reactivation rate | 60-80% |
| Dunning recovery rate | 50-60% |

---

## Common Mistakes

- No cancel flow at all — instant cancel leaves money on the table
- Making cancellation hard to find — many jurisdictions require easy cancellation
- Same offer for every reason — a blanket discount doesn't address "missing feature"
- Discounts too deep — 50%+ discounts train customers to cancel-and-return
- Ignoring involuntary churn — often 30-50% of total churn and the easiest to fix
- Guilt-trip copy — damages brand trust
- No post-cancel path — make reactivation easy and trigger win-back emails

---

## Related Skills

- **email-sequence**: For win-back email sequences after cancellation
- **onboarding-cro**: For activation to prevent early churn
- **ab-test-setup**: For testing cancel flow variations
