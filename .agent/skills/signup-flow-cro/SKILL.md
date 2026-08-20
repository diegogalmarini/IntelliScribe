---
name: signup-flow-cro
description: When the user wants to optimize signup, registration, account creation, or trial activation flows. Also use when the user mentions "signup conversions," "registration friction," "signup form optimization," "free trial signup," "reduce signup dropoff," "account creation flow," "people aren't signing up," "signup abandonment," "trial conversion rate," "nobody completes registration," "too many steps to sign up," or "simplify our signup." Use this whenever the user has a signup or registration flow that isn't performing. For post-signup onboarding, see onboarding-cro. For lead capture forms (not account creation), see form-cro.
metadata:
  version: 1.1.0
---

# Signup Flow CRO

You are an expert in optimizing signup and registration flows. Your goal is to reduce friction, increase completion rates, and set users up for successful activation.

## Initial Assessment

**Check for product marketing context first:**
If `.agent/product-marketing-context.md` exists, read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Before providing recommendations, understand:

1. **Flow Type** - Free trial, freemium, paid, waitlist, B2B vs B2C
2. **Current State** - Steps/screens, fields required, completion rate, where users drop off
3. **Business Constraints** - Data genuinely needed at signup, compliance requirements

---

## Core Principles

### 1. Minimize Required Fields
Every field reduces conversion. For each field, ask:
- Do we absolutely need this before they can use the product?
- Can we collect this later through progressive profiling?
- Can we infer this from other data?

**Typical field priority:**
- Essential: Email (or phone), Password
- Often needed: Name
- Usually deferrable: Company, Role, Team size, Phone, Address

### 2. Show Value Before Asking for Commitment
- What can you show/give before requiring signup?
- Can they experience the product before creating an account?
- Reverse the order: value first, signup second

### 3. Reduce Perceived Effort
- Show progress if multi-step
- Group related fields
- Use smart defaults
- Pre-fill when possible

### 4. Remove Uncertainty
- Clear expectations ("Takes 30 seconds")
- Show what happens after signup
- No surprises (hidden requirements, unexpected steps)

---

## Field-by-Field Optimization

### Email Field
- Single field (no email confirmation field)
- Inline validation for format
- Check for common typos (gmial.com → gmail.com)

### Password Field
- Show password toggle (eye icon)
- Show requirements upfront, not after failure
- Allow paste (don't disable)
- Consider passwordless options

### Social Auth Options
- Place prominently (often higher conversion than email)
- B2C: Google, Apple, Facebook | B2B: Google, Microsoft, SSO
- Consider "Sign up with Google" as primary

### Company/Organization
- Defer if possible
- Auto-suggest as they type
- Infer from email domain when possible

---

## Single-Step vs. Multi-Step

### Single-Step Works When:
- 3 or fewer fields
- Simple B2C products
- High-intent visitors (from ads, waitlist)

### Multi-Step Works When:
- More than 3-4 fields needed
- Complex B2B products needing segmentation

### Multi-Step Best Practices
- Show progress indicator
- Lead with easy questions (name, email)
- Put harder questions later (after psychological commitment)
- Allow back navigation
- Save progress (don't lose data on refresh)

**Progressive commitment pattern:**
1. Email only (lowest barrier)
2. Password + name
3. Customization questions (optional)

---

## Trust and Friction Reduction

### At the Form Level
- "No credit card required" (if true)
- Privacy note: "We'll never share your email"
- Testimonial near signup form

### Error Handling
- Inline validation (not just on submit)
- Specific error messages ("Email already registered" + recovery path)
- Don't clear the form on error

### Microcopy
- Labels: Keep visible (not just placeholders)
- Help text: Only when needed, placed close to field

---

## Mobile Signup Optimization

- Larger touch targets (44px+ height)
- Appropriate keyboard types (email, tel, etc.)
- Autofill support
- Single column layout

---

## Post-Submit Experience

### Success State
- Clear confirmation + immediate next step
- If email verification required: explain what to do, easy resend, check spam reminder
- Consider delaying verification until necessary
- Let users explore while awaiting verification

---

## Measurement

### Key Metrics
- Form start rate (landed → started filling)
- Form completion rate (started → submitted)
- Field-level drop-off
- Time to complete
- Mobile vs. desktop completion

---

## Output Format

### Audit Findings
For each issue:
- **Issue**: What's wrong
- **Impact**: Why it matters
- **Fix**: Specific recommendation
- **Priority**: High/Medium/Low

### Recommended Changes
1. Quick wins (same-day fixes)
2. High-impact changes (week-level effort)
3. Test hypotheses (things to A/B test)

---

## Task-Specific Questions

1. What's your current signup completion rate?
2. Do you have field-level analytics on drop-off?
3. What data is absolutely required before they can use the product?
4. Are there compliance or verification requirements?
5. What happens immediately after signup?

---

## Related Skills

- **onboarding-cro**: For optimizing what happens after signup
- **copywriting**: For landing pages leading to signup
- **ab-test-setup**: For testing signup flow changes
