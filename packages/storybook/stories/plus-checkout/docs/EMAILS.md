## Emails and messages after checkout

What a buyer (and a gift recipient) gets after paying, who sends it, and which
line on our page depends on it. Paddle’s list is from
[Which emails will customers receive on Paddle Billing](https://www.paddle.com/help/manage/your-customers/which-emails-will-customers-receive-on-paddle-billing)
(read 15 Oct 2026). Paddle doesn’t say whether merchants can switch these off or
edit them; Paddle translates them into its 16 checkout languages.

### Sent by Paddle (merchant of record)

| Email | When | Our page relies on it |
|---|---|---|
| Subscription Confirmation | A subscription is created | — |
| Transaction Receipt | A paid transaction completes (Paddle lists no separate renewal receipt; a renewal is a paid transaction) | Success page: “Paddle emails your receipt to …” |
| Auto-Renewal Reminder | 7 or 30 days before renewal, **only** for plans of 180+ days and **only** in the EU 27, the UK and 11 US states | Bill row “By 1 Oct 2027 · Reminder email before it renews”, shown only there |
| Discount Period End Reminder | At least 7 days before a discount period ends | The sale case (50% off the first year): buyers get it before full price applies |
| Subscription Price Changed | Items change the price (e.g. monthly → annual in the portal) | — |
| Subscription Cancel Request / Canceled | A cancellation is scheduled / takes effect | “or cancel” in the bill |
| Transaction Refund (full / partial) | A refund is issued | “30-day refund, no questions asked” |
| Retain: Payment Failed (initial, 2nd, 3rd, final) | A renewal payment fails | — (**verify** Paddle Retain is on for our account) |
| Checkout Recovery (with / without discount) | A checkout is abandoned | — (**verify** on/off; the discount version adds a 10% fee) |
| Invoice emails | Invoiced transactions (issued from Paddle, not card checkouts) | — |

### Sent by Apple (iOS app, StoreKit)

Apple’s own purchase receipt and renewal emails. The iOS success page says “Apple sends your receipt”.

### In the app (daily.dev)

| Message | Who | Source |
|---|---|---|
| “Surprise! 🎁 … gifted you a one-year daily.dev Plus membership!” pop-up | Gift **recipient**, next visit | `GiftReceivedPlusModal`, opened by `BootPopups` when `user.flags.showPlusGift` (production, unchanged) |
| Success page | Buyer | `/plus/success` (new design in `9. After payment`) |

### Not in this repo — verify before shipping

- Whether daily.dev sends its **own** email after a purchase (welcome to Plus, gift to the recipient). Nothing in `dailydotdev/apps` sends one; it would live in the API / email service. The new pages promise no daily.dev email.
- Retain and Checkout Recovery: on or off in the Paddle dashboard.
