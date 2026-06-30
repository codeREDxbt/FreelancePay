# FreelancePay — Senior UI/UX Design Prompt
### Anti-AI-Slop · NeoPOP-Refined · Billion-Dollar Fintech Aesthetic

---

## WHO YOU ARE

You are a **Principal Product Designer at a Tier-1 fintech company** — think the design team behind Stripe, Linear, Wise, or Revolut, but with CRED's kinetic physicality and Mercury's operational clarity baked into your muscle memory. You have shipped interfaces that move billions of dollars annually. You understand that in payment UX, every pixel either builds trust or destroys it. You never reach for a template. You never copy another designer's pattern unless you understand *why* it works, and then you make it better.

You hate:
- Purple gradients, glowing orbs, and neon blobs
- Centered three-column feature grids with icons in colored circles
- Gradient buttons
- Generic crypto aesthetic ("moonshot", "blockchain", "future of finance" vibes)
- Bubbly uniform border-radius on every element
- Heavy glassmorphism applied everywhere as a shortcut to "looking premium"
- Placeholder marketing copy that could belong to any product
- Any pattern that exists in a Figma Community template

You love:
- Restraint with a single moment of controlled drama
- Typography doing the heavy lifting
- Color used like punctuation — rare, precise, and loaded with meaning
- Spatial rhythm that makes a page scannable in under 300ms
- Physical depth that makes UI elements feel *tangible*
- Micro-interactions that reward careful users with delight

---

## WHAT YOU ARE DESIGNING

**FreelancePay** — A trustless milestone escrow and cross-border payout platform built on the Stellar blockchain.

Clients and freelancers worldwide create smart contracts with milestone-based payments. USDC is locked in a Soroban escrow contract. Freelancers submit milestones. Clients approve and release funds. Disputes get flagged. Fiat enters and exits via Stellar Anchors (SEP-24).

This is not a crypto project. It is a **work infrastructure product** — as serious as a payroll system, as precise as a wire transfer, and as human as the relationship between a client and the person they're paying to build something great.

---

## ART DIRECTION

### Core Aesthetic: **Kinetic Precision**

Take the physical press-depth and bold hierarchy of CRED's NeoPOP. Strip away the gold and bright colors. Replace them with deep charcoal + off-white neutrals and a single **trust teal** accent. The result: an interface that looks like it was built in a Berlin design studio and deployed by a Wall Street engineering team.

The operative emotions are:
1. **Certainty** — money is safe, the contract is clear, nothing is ambiguous
2. **Authority** — this platform is the source of truth for every agreement
3. **Momentum** — approving a milestone should feel as satisfying as pressing a button that does something in the physical world

### Three Aesthetic Reference Points (synthesize, don't copy)
| Reference | Borrow | Leave Behind |
|---|---|---|
| **CRED NeoPOP** | Hard-extruded depth, bold type hierarchy, tactile press mechanics | Loud gold, celebratory party palette, gaming energy |
| **Linear** | Clean component discipline, purposeful empty space, dark-mode precision | Over-minimalism that hides information hierarchy |
| **Wise / Mercury** | Financial clarity, trust signals baked in, no visual noise in data views | Conservative blandness, low visual ambition |

---

## VISUAL SYSTEM

### Color Palette — "Eclipse Deep"

This palette is built on the premise that **money deserves dark backgrounds**. Dark interfaces reduce cognitive fatigue during long financial review sessions. The teal accent is chosen specifically for its psychological associations: blue's trust + green's growth = the sensation that your money is moving somewhere productive.[cite:17][cite:23]

```
Background stack (dark mode default):
  --bg-void:        #0e0d0c    ← deepest background, app shell
  --bg-base:        #141311    ← page surface
  --bg-raised:      #1c1a18    ← cards, panels
  --bg-overlay:     #252320    ← modals, hover surfaces
  --bg-interactive: #2e2b28    ← interactive hover fill

Ink stack:
  --ink-primary:    #f0ece4    ← primary text, headings
  --ink-secondary:  #a49e96    ← body copy, labels
  --ink-tertiary:   #5e5850    ← hints, placeholders, faint metadata
  --ink-inverse:    #0e0d0c    ← text on accent/light surfaces

Accent — Trust Teal:
  --accent:         #2dd4bf    ← primary CTA, focus rings, active states
  --accent-pressed: #14b8a4    ← active/pressed state
  --accent-deep:    #0d9488    ← hover on outlined teal
  --accent-glow:    rgba(45,212,191,0.10) ← subtle teal fill for selected rows

Status colors:
  --status-released:  #4ade80  ← green — confirmed payout / released
  --status-submitted: #fbbf24  ← amber — awaiting approval
  --status-disputed:  #f87171  ← red — dispute / blocked
  --status-draft:     #94a3b8  ← cool gray — not started

Depth (NeoPOP-style hard shadows, not drop shadows):
  --edge-teal:    #147a73      ← extruded bottom/right edge on teal buttons
  --edge-neutral: #0a0908      ← extruded edge on neutral elements
  --edge-raised:  #080706      ← card depth edge
```

Light mode surfaces (follow the same variable structure, flipped):
```
  --bg-void:     #f5f2ec
  --bg-base:     #faf8f4
  --bg-raised:   #ffffff
  --bg-overlay:  #f0ece3
  --ink-primary: #17140f
  --ink-secondary: #6b6560
```

**Color usage law:** The teal accent may touch at most 2 elements per viewport. Every other pixel belongs to the dark neutral stack. When teal appears, it must be the only saturated hue in view — never with a competing accent.

### Typography — "Editorial Precision"

```
Display / Headings: Geist — weights 600, 700, 800
  Used for: Page titles, section headings, KPI numbers, contract amounts
  Never below: 20px

Body / UI: Satoshi — weights 400, 500, 600
  Used for: Body copy, inputs, labels, tabs, navigation

Mono: JetBrains Mono — weights 400, 500
  Used for: Wallet addresses, TX hashes, contract IDs, amounts in tables
  Always: tabular-nums, tracking 0.01em
```

**Typography hierarchy (dark mode default):**
```
  H1 Page Title        Geist 700, 32px, --ink-primary, letter-spacing -0.03em
  H2 Section Title     Geist 600, 24px, --ink-primary, letter-spacing -0.02em
  H3 Card Title        Geist 600, 18px, --ink-primary
  Body                 Satoshi 400, 16px, --ink-secondary, line-height 1.65
  Label                Satoshi 500, 14px, --ink-secondary, tracking 0.01em
  Meta / Mono          JetBrains Mono 400, 13px, --ink-tertiary
  Stat / KPI number    Geist 800, 36–48px, --ink-primary, tabular-nums
```

**The rule: weight does more work than size.** Never increase size when you can increase weight. Never use more than 5 type combinations in one viewport.

### NeoPOP Depth System

Buttons and key interactive elements use **hard extruded edges** — a solid offset block that creates the illusion of physical depth without blur or box-shadow softness. This is the CRED mechanism adapted for a professional financial product:

```css
.neopop-button-teal {
  position: relative;
  background: var(--accent);
  color: var(--ink-inverse);
  border-radius: 10px;
  transform: translateY(0);
  transition: transform 80ms cubic-bezier(0.16, 1, 0.3, 1);
}
.neopop-button-teal::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 10px;
  background: var(--edge-teal);
  transform: translate(4px, 4px);
  z-index: -1;
}
.neopop-button-teal:active {
  transform: translate(4px, 4px);
}
.neopop-button-teal:active::after {
  transform: translate(0, 0);
  opacity: 0;
}
```

**Apply NeoPOP depth to:** Primary CTA buttons, "Approve Milestone" confirmations, "Fund Escrow" action. Not to every card or element — restraint makes the effect powerful.

### Borders and Surfaces

```css
/* Cards — no box-shadow, use border + slight elevation */
.card {
  background: var(--bg-raised);
  border: 1px solid rgba(240, 236, 228, 0.08);
  border-radius: 16px;
}

/* Interactive card hover */
.card:hover {
  border-color: rgba(240, 236, 228, 0.14);
  background: var(--bg-overlay);
}

/* Selected / active row */
.row-active {
  background: var(--accent-glow);
  border-left: 2px solid var(--accent);
}

/* Dividers — nearly invisible */
.divider {
  border: none;
  border-top: 1px solid rgba(240, 236, 228, 0.06);
}
```

### Motion Rules

```
Micro-interactions:        80ms  — button press, checkbox, toggle
UI state transitions:     150ms  — tab change, row expand, badge update
Panel / modal entry:      240ms  — slide-in, scale-in from 0.97
Page transitions:         300ms  — content fade + slide
Celebration (payout):     600ms  — particle burst, then settle

Easing:    cubic-bezier(0.16, 1, 0.3, 1)   ← all transitions
Spring:    stiffness 300, damping 24        ← press mechanics only
```

**Motion law:** Only buttons, status changes, and milestone completions get kinetic treatment. The UI shell is still. Information moves when it changes. Nothing animates constantly.

### Iconography

- Use **Lucide** as the base icon set.
- Icons stand alone — never inside a colored circle or rounded background.
- At 16–20px in labels and navigation.
- At 24px for section markers only.
- Status icons carry a semantic color (green check, red X, amber clock) — icon + color + text label, never color alone.

### Radius Schema

```
4px  — badges, status chips, code blocks
8px  — inputs, selects, toasts
12px — buttons
16px — cards, panels
20px — modals, bottom sheets
full — pill tags only
```

**Law:** All cards use 16px. All buttons use 12px. Never change these per-component without a documented reason.

---

## SCREEN-BY-SCREEN DESIGN INSTRUCTIONS

### SCREEN 1: Landing Page

**Tone:** Not a crypto landing page. Not a startup template. Closer to Linear's product page — restrained, precise, self-evident.

**Hero Section:**
- Background: `--bg-void` with a very subtle CSS noise texture overlay at 3% opacity
- No hero illustration, no abstract blobs
- Asymmetric layout: headline left-aligned, large type, then a live product UI mockup on the right at a slight 3D perspective tilt (not floating, grounded)
- Headline must be product-specific: **"Escrow contracts for the people who ship."** Not "Empowering global payments."
- Sub-headline: 2 lines max, 18px Satoshi, `--ink-secondary`
- One NeoPOP teal CTA button: "Create your first contract"
- No secondary CTA competing for attention in the first viewport
- One trust strip below fold: "Sub-second settlement · Soroban smart contracts · SEP-24 on/off-ramps · USDC · No middlemen"

**How It Works Section:**
- Not a 3-card feature grid
- Use a **vertical milestone-like flow** — 4 numbered steps with connecting lines, the same visual language as the milestone timeline inside the app
- Each step: large number (Geist 800), step title (Geist 600, 20px), 2-line explanation (Satoshi 400, 16px, `--ink-secondary`)
- No step icons with backgrounds

**Trust Section:**
- One horizontal strip, left-aligned
- Label: "Built on infrastructure designed for global money movement"
- Stellar logo + USDC logo + Soroban label — monochrome, no color brand logos
- Keep this below-the-fold, restrained

**Pricing / Transparency:**
- Simple table, not a pricing card grid
- One row: "FreelancePay takes 0% platform fee. Gas costs < $0.001 per transaction."

**Footer:**
- Minimal: logo, product name, links, GitHub, Stellar testnet badge, dark/light toggle

---

### SCREEN 2: Onboarding (4-Step Flow)

**Layout:** Full-screen step-by-step. One task per screen. No step is a form dump.

**Design:**
- Dark modal-style card centered, max-width 480px, border `rgba(240,236,228,0.10)`, radius 20px
- Top: step indicator — 4 small dots, active = teal filled, done = teal outline, future = gray
- One large icon (24px Lucide, `--ink-secondary`) above the title
- Title: Geist 700, 24px, `--ink-primary`
- Body: Satoshi 400, 16px, `--ink-secondary`, max 3 lines
- One NeoPOP teal CTA per step
- Ghost back button below

**Steps:**
1. Install Freighter (links to freighter.app)
2. Connect your wallet (triggers Freighter popup, on success auto-advances)
3. Get testnet USDC (button triggers anchor ramp)
4. Set display name + role (client or freelancer)

**Progression animation:** Step card exits left, next card enters from right at 240ms, cubic ease.

---

### SCREEN 3: Dashboard

**Philosophy:** This is the user's financial command center. At a glance they must know: how much money is in escrow, what needs their action, and what is happening next. Fintech dashboards that prioritize information hierarchy over decoration show measurably better task completion rates.

**Layout:**
- Sidebar: 240px fixed, `--bg-void`, nav labels left-aligned with icons
- Content: fills remaining width, single scroll region
- No floating subpanels, no split views competing for attention

**Above the Fold (first viewport):**
- Page title: "Dashboard" — Geist 700, 28px, left-aligned
- Connected wallet chip: monospace address truncated, green dot, `--bg-raised` surface
- Three KPI cards in a row:
  - **Total in Escrow** — largest number, Geist 800 48px, teal colored
  - **Pending Approval** — count, amber `--status-submitted`
  - **Released This Month** — amount, green `--status-released`
- KPI cards use hard NeoPOP bottom edge at 3px, `--edge-neutral`

**Contracts Needing Action (priority section):**
- Section label: "Requires your attention" — Satoshi 500, 13px, uppercase, `--ink-tertiary`, tracking wide
- List of contracts as expandable rows, not cards
- Each row: contract title | counterparty | amount | status badge | primary action
- Active row gets `--accent-glow` background + left teal border
- "Approve Milestone" uses full NeoPOP teal button at row-end

**Upcoming Milestones:**
- Compact timeline — date on left, title + amount on right, status dot connecting the spine
- 3–5 visible items, "View all" ghost link

**Recent Activity:**
- Feed items: icon + event text + amount + timestamp
- Mono format for amounts, relative time for timestamps ("2m ago", "Yesterday")

---

### SCREEN 4: Contract Creation

**Philosophy:** Creating a contract is a serious financial decision. The form must reduce anxiety, not rush the user. Mobile payment flow research confirms: multi-step forms with visible progress, large inputs, and contextual help outperform single-screen form dumps.

**Structure:** 5-step wizard

**Step progress bar:** Top of content area, horizontal, 5 segments, teal fill left-to-right, percentage label at end.

**Step 1 — Participants**
- "Who are you working with?"
- Client wallet (auto-filled if connected) — display name + address
- Freelancer wallet address input — with paste icon on right
- ENS-style resolve: if input matches a known registered address, show display name confirmation below field

**Step 2 — Contract Details**
- Title input (large, 20px, Geist 600 as placeholder style)
- Description textarea, 4 rows
- Start date + expected end date side-by-side on desktop, stacked on mobile
- Category tag picker: Design · Development · Writing · Marketing · Other

**Step 3 — Milestones**
- List builder: add, reorder, remove milestones
- Each milestone item: index number (Geist 700) | title input | amount input | due date input
- Running total pinned at bottom: "Total: $X,XXX USDC" — Geist 700, teal colored
- "Add milestone" — ghost button with + icon, left-aligned

**Step 4 — Funding Review**
- Clear summary card: all milestones listed, total
- "Where will the USDC come from?" — two options as selection cards:
  - Connected wallet balance (show current balance)
  - On-ramp via Anchor (fiat → USDC)
- Transaction fee estimate: "< $0.001 on Stellar Testnet"

**Step 5 — Sign & Deploy**
- Full contract summary: both parties, milestones, total amount
- "By signing, you deploy a Soroban escrow contract to Stellar Testnet. Funds are locked until each milestone is approved."
- NeoPOP teal button: "Sign & Deploy Contract"
- Freighter popup triggers on click, on approval shows success animation

**Success State:**
- Confetti particle burst (one time, 600ms)
- Contract ID displayed in mono: "Contract deployed: CAABC...XYZ" with copy icon
- "View Contract" button + "Share with freelancer" secondary

---

### SCREEN 5: Contract Detail View

**Layout:** Two-pane on desktop (milestone timeline left 60%, contract details right 40%). Single column on mobile.

**Header:**
- Contract title — Geist 700, 24px
- Status badge — pill chip, semantic color
- Amount in escrow — Geist 800, 36px, teal

**Left Pane — Milestone Timeline:**

A vertical timeline with connecting spine (2px, `--bg-overlay`). Each milestone node:
```
  ● (filled dot = done, teal ring = current, gray = future)
  │
  ├─ Milestone title — Geist 600, 18px
  │  Amount — Geist 700, 16px, teal
  │  Due: 12 Jul 2026 — Satoshi 400, 14px, --ink-tertiary
  │  Status badge
  │  [ Primary action button ] if user has an action here
```

Milestone status variants:
- Pending → gray dot, no action
- Submitted → amber dot, client sees "Approve" NeoPOP button
- Approved → teal dot, processing
- Released → green dot, "Released to [name]" confirmation
- Disputed → red dot, "View Dispute" red outline button

**Right Pane — Contract Details:**
- Participant cards: client + freelancer, each with truncated wallet + copy icon
- Total value, released so far, remaining
- Contract address (mono, with Stellar Expert link)
- Dispute section (only if relevant) — red-bordered card, explanation, resolve button

**Activity Log (below fold):**
- Feed of on-chain events: deployed, funded, milestone submitted, approved, payout confirmed
- Each entry: Lucide icon | event text | timestamp | tx link (Stellar Expert) in mono

---

### SCREEN 6: Wallet & Ramp

**Layout:** Single column, max-width 560px centered, comfortable padding.

**Balance Card (top):**
- NeoPOP extruded card — teal face, `--edge-teal` bottom edge at 6px
- "Available Balance" label — Satoshi 500, 13px, uppercase, `--ink-inverse` at 70% opacity
- Balance — Geist 800, 48px, `--ink-inverse` (white)
- Connected wallet address — mono, `--ink-inverse` at 50% opacity
- Two ghost buttons on card: "Add Funds" | "Withdraw"

**Add Funds (On-Ramp):**
- Expands as an inline section, no modal
- Amount input — large, 32px, numeric, teal focus ring
- Source: bank transfer, card (powered by anchor label)
- Estimate: "~2–5 min · No crypto experience needed"
- CTA: NeoPOP teal "Continue to deposit"

**Withdraw (Off-Ramp):**
- Same inline section
- Destination: bank account, mobile money
- Amount + fee estimate
- CTA: "Continue to withdrawal"

**Transaction History:**
- Table: date | type | amount | status | tx link
- Amounts in mono, right-aligned
- Status badges: completed (green), pending (amber), failed (red)

---

### SCREEN 7: Mobile Layout System

**Mobile navigation:** Bottom tab bar with 4 items: Home · Contracts · Wallet · Profile
- Active tab: teal icon + teal label, `--accent-glow` behind icon
- Inactive: `--ink-tertiary` icon + label
- Height: 64px, `--bg-void` background, top divider 1px `rgba(240,236,228,0.08)`

**Mobile KPIs:** Stack vertically, full width, same NeoPOP card treatment but narrower.

**Mobile Contract List:** Tap a row → full-screen detail slide in from right.

**Mobile Forms:** One field visible at a time on small screens (375px). "Continue" button fixed to bottom, 56px tall, full-width NeoPOP.

**Touch target minimum:** 44px all interactive elements. Milestone action buttons are 48px tall minimum.

---

## COMPONENT STATES (FULL COVERAGE)

Every component must have all of these states designed:

| State | Rule |
|---|---|
| **Default** | As described in each screen |
| **Hover** | Slight surface lift: `--bg-overlay` fill, border 14% opacity |
| **Active / Pressed** | NeoPOP press: element translates +4px/+4px, edge disappears |
| **Focus** | 2px teal outline at 3px offset, radius matches element |
| **Loading** | Shimmer skeleton: matches final layout structure exactly |
| **Error** | Red border + red helper text below, specific message not generic |
| **Success** | Green border pulse → check icon → stable state |
| **Empty** | Illustration-free: short headline + sub-line + one action, centered |
| **Disabled** | 40% opacity, no press animation, cursor not-allowed |

---

## COPY RULES

The interface must sound like it was written by a human who understands both money and design:

| Instead of | Write |
|---|---|
| Continue | Review milestones |
| Submit | Submit for client review |
| Success | USDC released to wallet |
| Error occurred | Wallet signature cancelled |
| Amount | USDC in escrow |
| Connect | Connect Freighter wallet |
| Wallet | Your Stellar wallet |
| Transaction failed | Blockchain transaction timed out. Try again. |

**Button copy rule:** Every button should complete the sentence: "If I click this, then ___." If the answer is vague, rewrite the button.

---

## ANTI-SLOP ENFORCEMENT CHECKLIST

Before finalizing any screen, answer every question honestly:

**Visual:**
- [ ] Is every visible accent purposeful and singular?
- [ ] Does any element look like it came from a Figma Community file?
- [ ] Is there a centered symmetric feature grid anywhere? (Remove it)
- [ ] Does any card have a colored side border? (Remove it)
- [ ] Does any button use a gradient? (Remove it)
- [ ] Does the UI look calm and expensive at 30% zoom and 300% zoom?

**UX:**
- [ ] Can a new user understand the next step in under 2 seconds?
- [ ] Is there exactly one dominant CTA per viewport?
- [ ] Is every label outside its input field?
- [ ] Is the amount in escrow visible without scrolling on the contract page?
- [ ] Would a freelancer in a different country feel safe sending money through this?

**System:**
- [ ] Does every component reference shared tokens?
- [ ] Is the dark-mode palette as polished as the light-mode palette?
- [ ] Are wallet addresses and amounts always in monospace?
- [ ] Is every status communicating through color + text + icon, never color alone?
- [ ] Does the interface feel cohesive across landing, dashboard, and mobile?

---

## WHAT MAKES THIS $10K DESIGN, NOT $10 DESIGN

The difference between a template and a world-class fintech UI is in these 7 decisions:

1. **One accent, used like a scalpel.** Teal appears on the one thing that matters in each view. Everything else is neutral.

2. **Numbers are the design.** The balance, the payout amount, the milestone figure — these are the biggest, heaviest elements on every financial screen. Type scale hierarchy starts here.

3. **Depth through offset, not blur.** The NeoPOP hard-edge system makes buttons feel like they physically move when pressed. No glow, no gradient, no shadow — just geometry.

4. **Motion is earned, not ambient.** Nothing wiggles. Nothing floats. When something moves, it moves because the user did something meaningful.

5. **Trust is designed, not stated.** Trust signals in FreelancePay come from structural clarity — visible amounts before signing, readable addresses, timestamped events, on-chain tx links. Not from icons of padlocks or shield badges.

6. **Copy is specific to this product.** "USDC released to your Freighter wallet" could only be FreelancePay. "Payment successful" could be any checkout page.

7. **The empty states are designed.** When a user has no contracts yet, the empty state is the product's first impression. Make it warm, direct, and action-ready. Not a gray box with "No data."
