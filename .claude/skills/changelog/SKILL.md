---
name: changelog
description: Generate a daily.dev changelog post for a new feature or update. Use when a team member needs to write a changelog announcement.
---

# Changelog Writer

Help daily.dev team members write engaging changelog posts for new features and updates.

## Style Guide

Based on real daily.dev changelogs, follow these patterns:

### Titles
- Catchy, conversational, sometimes playful
- Use "we" to speak as the team
- Good examples:
  - "We finally gave your posts what they deserve"
  - "New search filters just dropped"
  - "Now your boss can pay for daily.dev Plus!"
  - "We improved readability on daily.dev"
- Can be dramatic when warranted: "Our most powerful tool to stay informed. Ever."

### Structure
1. **Title** - Catchy, benefit-focused headline
2. **Hero image note** - `[Hero image: brief description for designer]`
3. **Intro paragraph** - Set context, acknowledge the problem/need (1-3 sentences)
4. **"Here's what's new:"** or similar - Bullet points of key features/changes
5. **Optional deeper sections** - "Why you'll love it", "How it works", "One more thing"
6. **Closing CTA** - Invite feedback, encourage trying the feature

### Tone
- Conversational and friendly, like talking to a fellow developer
- Light humor sprinkled naturally ("yes... it's sick. We know", "(hopefully hehe)")
- User-focused benefits, NOT technical implementation details
- Acknowledge pain points before presenting solutions
- Concise - respect the reader's time

### Formatting
- Use **bold** for key terms and feature names
- Bullet points for lists of features/benefits
- Short paragraphs (2-3 sentences max)
- Before/after comparisons when showing improvements
- Practical elements when helpful (templates, examples, tips)

### What NOT to do
- Don't use em dashes (—). Use periods, commas, or rewrite the sentence instead
- Don't be overly formal or corporate
- Don't list technical implementation details
- Don't use jargon without explanation
- Don't write walls of text
- Don't forget the human element

## Workflow

When the user invokes `/changelog`:

1. **Ask what they're announcing**
   - "What feature or update would you like to announce?"

2. **Gather context** (ask as needed, use the AskUserQuestionTool)
   - What problem does this solve?
   - Who benefits most from this?
   - What can users actually DO with it?

3. **Find the relevant code yourself**
   - Search recent git history for related commits: `git log --oneline -20`
   - Check recent PRs if the user mentions one or if you can infer it
   - Use the feature description to search the codebase with Grep/Glob
   - Look for related components, hooks, or API changes
   - Only ask the user for specific files if you genuinely can't find them

4. **Review implementation**
   - Read the relevant code to understand concrete capabilities
   - Extract real examples and use cases
   - Note any limitations or requirements
   - Understand the user-facing behavior, not just the code

5. **Draft the changelog**
   - Follow the style guide above
   - Focus on USER BENEFITS
   - Adapt the structure to fit the feature (see "Flexible Structure" below)

6. **Save the draft**
   - Save to `.claude/drafts/changelog-[feature-name].md`
   - Use kebab-case for the feature name
   - Tell the user where to find it

## Flexible Structure

Don't force every changelog into the same template. Adapt the structure to fit the feature:

### For multi-part features (new major capability)
- Title → Hero image → Intro → "Here's what's new" bullets → Deeper sections → How to try it → Closing

### For single focused improvements
- Title → Hero image → Problem/solution intro → What changed → Closing

### For quality-of-life updates
- Title → Hero image → Quick explanation → Before/after comparison → Closing

### For complex features
- Title → Hero image → Intro → Overview → Multiple sections explaining each part → Tips/best practices → Closing

### Common elements (use as needed, not required)
- **Hero image note**: `[Hero image: brief description for designer]`
- **Bullet lists**: For multiple related changes
- **Before/after**: When showing improvements
- **"How to try it"**: When the feature isn't obvious to find
- **Tips section**: For power-user features
- **"One more thing"**: For bonus announcements

### Example: Simple improvement
```markdown
# We improved readability on daily.dev

[Hero image: side-by-side comparison of old vs new typography]

Reading articles should feel effortless. We noticed some font sizes and spacing were making longer posts harder to read, so we fixed it.

We bumped up body text size, improved line spacing, and tweaked heading hierarchy. The result? Less squinting, more reading.

---

Let us know how it feels!
```

### Example: Multi-part feature
```markdown
# Our most powerful tool to stay informed. Ever.

[Hero image: the new feature in action]

Staying on top of tech news shouldn't feel like a full-time job. That's why we built something new.

## Here's what you get

- **Smart summaries**: Get the key points without reading everything
- **Custom alerts**: Know immediately when topics you care about trend
- **Weekly digests**: Curated highlights delivered to your inbox

## Why you'll love it

[Deeper explanation of the value prop]

## How to try it

Head to Settings → Notifications to set it up.

---

We're excited to hear what you think!
```

## Tips for Great Changelogs

1. **Lead with the benefit** - "You can now..." not "We added..."
2. **Be specific** - "Save 3 clicks" beats "Improved workflow"
3. **Show, don't tell** - Screenshots, before/after, examples
4. **Keep it scannable** - Headers, bullets, bold key terms
5. **End with action** - Tell them how to try it
