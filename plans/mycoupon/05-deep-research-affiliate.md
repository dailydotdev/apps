# MyCoupon — Deep Research: Affiliate / Deals Business Mechanics

Companion to `00-research.md` (which covered Honey, Wirecutter, Rakuten, GitHub Student Pack). This document covers what we were **missing**: how the big players actually operate, the technical plumbing, legal/compliance, data-quality ops, proven UX, SEO risk, monetization beyond affiliate, and the unglamorous operational realities.

Research date: 2026-08-07. Every finding is sourced.

---

## 0. The Glenn Gabe tweet (identification)

**Verified.** `https://x.com/glenngabe/status/2084988500340883550` was retrieved via the fxtwitter and vxtwitter JSON mirrors (direct x.com fetch is blocked). Both returned identical content.

- **Author:** Glenn Gabe (@glenngabe), SEO/AI-search consultant, G-Squared Interactive
- **Date:** Wed 05 Aug 2026 13:02:50 UTC (two days before this research)
- **Verbatim text:** *"The NYT quarterly earnings revealed revenue from affiliate (Wirecutter) increased 7.1% to $75.5M. So I checked search visibility. Yep, Wirecutter surged with the May core update (and beyond into July). So the surge in revenue makes a lot of sense. :)"*
- **Linked source:** https://www.nytimes.com/2026/08/05/business/media/new-york-times-earnings-q2.html
- **Media:** 2 attached charts (search-visibility trend vs. revenue). Engagement at time of fetch: 19 likes, 3 RTs, ~2.9k views.

**Correction to the brief:** the figure is **$75.5M in a single quarter** of NYT affiliate revenue (~$300M/yr run-rate), **not ~$10M**. There is no Glenn Gabe post I could find about a "~$10M affiliate directory." If the user is thinking of a smaller number, the closest candidates in Gabe's affiliate coverage are the *traffic-loss* case studies in "A Nightmare on Affiliate Street" (below), not a revenue figure.

Note: `00-research.md` line 63 cites tweet ID `1920100859360199120` for this same $75.5M claim — that ID is from ~May 2025 and cannot carry Q2-2026 earnings. **Fix the citation to `2084988500340883550`.**

Closest relevant Gabe findings (all verified):
- **"A Nightmare on Affiliate Street"** — his running teardown of site-reputation-abuse casualties. Concrete drops: Forbes Advisor (25 Sep 2024), APNews Buyline (18 Jul 2024), Time Stamped (Mar 2024 core + 18 Jul 2024), Fortune Recommends (11 Oct 2024, **−67% search visibility**), MarketWatch Guides (Aug core + 15 Oct), CNN Underscored and WSJ Buyside (both 27 Sep 2024). Google told Gabe: *"Our systems aim to understand if a section of a site is independent or starkly different from the main content."* Danny Sullivan separately confirmed the *algorithmic* version of the policy was **not** live — these were core-update effects. https://www.gsqi.com/marketing-blog/a-nightmare-on-affiliate-street/
- **Phia cookie-stuffing** (the case referenced in `00-research.md`): Bloomberg, July 2026 — Phia's extension opened a hidden background tab at checkout and overwrote other affiliates' referral codes, including Wirecutter's. Phia blamed a Dec-2024 code change; **Impact.com suspended the account**. Nov 2025: researchers had already found the extension shipping full HTML snapshots of visited pages to Phia's servers. https://techcrunch.com/2026/07/10/phia-accused-of-cookie-stuffing-taking-affiliate-credit-on-purchases-it-didnt-earn/

---

## 1. Big affiliate/deal businesses — how the loop actually works

### 1.1 Slickdeals (the model closest to ours)

| Dimension | Detail |
|---|---|
| Scale | 12M+ registered users, ~25M monthly visitors, 3,000+ brand partners |
| Revenue | est. $49.2–80M/yr (2024); acquired by Goldman Sachs for ~$500M in 2021 |
| Supply | Community submissions + "Deal Hunters" who find deals in the wild |
| Curation | Community votes escalate a deal **Popular → Frontpage → Fire**; editors ("Deal Specialists") then reformat frontpage deals into a standardized card |
| Monetization | (a) affiliate commissions 3–10% via CJ, Impact, Rakuten Advertising, Awin and direct retailer deals; (b) sponsored placements; (c) display; (d) selling performance data back to brands |

Sources: https://www.enactsoft.com/resources/slickdeals-business-model/ · https://sales.slickdeals.net/solutions

**The critical governance rule:** *"A deal's popularity — community votes, engagement, and value — determines whether it makes the frontpage, not whether there is a working relationship with the merchant."* Slickdeals also **forbids retailers (or anyone associated with them) from posting their own deals**, and bans linking to competitor deal sites. https://slickdeals.net/corp/acceptable-use.html

**The monetization trick worth stealing — Deal Specialist Funnel (DSF).** Merchants pay a **monthly subscription** to submit deals into a review queue and get expert feedback on pricing and expected shopper sentiment *before* the deal goes live. They do **not** buy placement — they buy the odds of earning it. One footwear client combined DSF with paid media and got 33 frontpage placements over three months and **+529% sales YoY**. This cleanly separates "pay to be coached" from "pay to rank," which is exactly the line a community product must not cross.
https://blog.sales.slickdeals.net/en/slickdeals-resources/case-study-slickdeals-deal-specialist-funnel · https://help.merchants.slickdeals.net/knowledge/the-dsf-review-process

Paid inventory sold separately: Featured Deals, Announcement Bars, Weekly/Solo Newsletters (1.2M opted-in subscribers), sponsored Giveaways with up to 5 highlighted deals. https://sales.slickdeals.net/

### 1.2 Pepper network (mydealz / HotUKDeals / Dealabs / Pepper)

- ~25M consumers across country sites, **~500M page impressions/month**; revenue ~$13M (2026) — note the enormous traffic-to-revenue gap vs Slickdeals, i.e. audience alone doesn't monetize. https://tech.eu/2015/11/03/pepper-com-social-commerce/ · https://www.crunchbase.com/organization/pepper-networks
- **"Temperature" mechanic:** upvotes raise a deal's temperature, downvotes cool it. It is a *bidirectional* score, not a like counter — cold deals visibly die. This is materially better than upvote-only for deal quality, because a bad deal must be actively suppressible. https://en.wikipedia.org/wiki/Hotukdeals
- Disclosure norm: "some links on Pepper may be monetized to fund the platform and keep it free." https://www.pepperdeals.com/page/help
- They invested in **personalized ranking** (Recombee) and got **+21% click-outs** — i.e. the recommendation layer, not the deal supply, was the growth lever. https://www.recombee.com/case-studies/pepper

### 1.3 Honey / Capital One Shopping / Karma / Coupert / Cently (the extension pole)

- All run the same loop: affiliate commission on referred purchase → some share returned to the user as points/cashback → user retention. Honey was acquired by PayPal for **$4B** (2019/2020); Capital One Shopping began as Wikibuy. https://wecantrack.com/insights/how-do-cashback-sites-make-money/
- **Honey litigation outcome (important):** the influencers' class action was dismissed in Nov 2025 for failure to show injury; a Second Amended Complaint (22 Jan 2026) detailed a **"Secret Tab" mechanism** — closing the Honey pop-up allegedly opened a hidden tab redirecting through a PayPal affiliate URL that overwrote the creator's ID. On **15 June 2026 Judge P. Casey Pitts dismissed with prejudice**, calling the data collection "routine commercial behavior." https://www.affiversemedia.com/paypal-honey-lawsuit-reveals-systematic-secret-tab-mechanism-and-detection-evasion-tactics/ · https://news.bloomberglaw.com/litigation/paypals-honey-sheds-influencers-affiliate-link-hijacking-suit
- **The commercial punishment was worse than the legal one:** in Jan 2026 **Rakuten Advertising terminated Honey from its network**, cutting access to ~2,000 merchants including Walmart, Sephora, Lego, Dyson, Uniqlo. Networks, not courts, are the real enforcement layer. https://lawfold.com/honey-lawsuit/

### 1.4 SimplyCodes (the quality-first challenger)

Publicly reports its own accuracy: **81.5% code success rate across 33,235 merchants in March 2026** — the only player publishing this metric. Runs a "three-layer verification engine" (automated checkout testing + editorial + community). https://simplycodes.com/how-it-works · https://simplycodes.com/blog/best-coupon-app-extension

### 1.5 RetailMeNot / Coupons.com / Groupon

- RetailMeNot: ~20,000 brands; mixes staff-verified codes with user-submitted codes and vote-based success rates. Known failure mode: **scammers submit fake codes purely to drive traffic**. https://simplycodes.com/blog/best-coupon-app-extension
- Acquired by Ziff Davis for **$420M** in 2020. https://mergr.com/ziff-davis-acquires-retailmenot
- Counter-intuitive 2024 result: when Google killed publisher coupon subdirectories, **dedicated voucher sites gained**. The coupon cohort went from −16% YoY sales (Mar 2024) to −14% (Apr), +5% (May), +14% (Jun). Being a *pure-play, first-party* deals destination was rewarded. https://www.awin.com/us/compliance-and-regulations/insight-of-the-month-google-site-reputation-update

### 1.6 SaaS/dev-adjacent marketplaces

- **AppSumo:** makers apply for a slot, AppSumo negotiates 80–95% off lifetime pricing, deal runs 30–90 days to the list. Rev-share is heavily AppSumo-weighted (~60–70% to AppSumo; as low as 10–30% to the vendor on the "Select" program). Partners also get **100% commission up to $100 per new buyer they bring in**. AppSumo Plus ($99/yr, ~27k members) is the recurring layer. Revenue reportedly **crashed ~50%** as the lifetime-deal model hit its ceiling — a warning that discount marketplaces have a decay curve. https://appsumo.com/blog/breaking-down-appsumo-revenue-share · https://ppc.land/appsumos-revenue-crashes-50-as-lifetime-deal-model-faces-existential-crisis/
- **NachoNacho:** free Basic tier = 400+ SaaS discounts; **Premium tier = 800+ discounts** plus virtual-card spend management. Vendors list free, pay **rev-share**, no integration required. The premium-tier-unlocks-better-deals pattern is directly portable to daily.dev Plus. https://nachonacho.com/about · https://support.nachonacho.com/support/solutions/articles/151000152098-what-is-the-saas-marketplace-
- **StackSocial / StackCommerce:** **$150M+ paid to publisher partners across 1,000+ publisher relationships** (VentureBeat, Mashable). Tracking is cookie + postback, **365-day cookie, last-click**. This is the white-label "commerce section for your publication" business — and precisely the shape Google penalized in 2024 when it ran under the publisher's own domain. https://affiliateden.com/platforms/stacksocial
- **The Points Guy:** ~100-person media company built almost entirely on affiliate fees; credit-card issuers pay **~$120 per approved customer, up to ~4× that for high-volume publishers**. Relevant because *lead-gen bounties beat percentage commissions* when the vendor's LTV is high — which is true of dev tools too. https://digiday.com/media/points-guy-built-100-person-media-company-off-affiliate-fees/
- **Dev-specific directories that already exist:** GitHub Student Pack clones (`AchoArnold/discount-for-student-dev`, `IAmHughes/Discounts-for-Student-Developers`), StudentPerks, studentperks.dev (120+ tools), studentdiscounthub.com (200+ tools). All are static lists with **no verification signal, no freshness, no community**. That's the open lane. https://github.com/AchoArnold/discount-for-student-dev · https://www.studentperks.dev/student-discount

---

## 2. Affiliate network / technical plumbing

### 2.1 Networks and what they cost a publisher

- **Impact.com:** free to join as a publisher but **manual approval** (platform/channel review). Brands pay $30–$500/mo platform fee plus **2.5% of every commission**. Publishers who go 6 months without a payout get charged a maintenance fee (£25/mo entity-invoiced, $10/mo direct). https://impact.com/integrated-platform-prices/ · https://help.impact.com/partner/what-would-you-like-to-learn-about/platform-features/finance/payment-requirements-explained-for-partners
- **SaaS-native networks** (the ones that matter for dev tools): PartnerStack (enterprise, opaque pricing, sales-gated, has its own partner marketplace), Reditus ($99–149/mo, 26k+ affiliate network, B2B-SaaS-only), FirstPromoter (from $49/mo, **supports affiliate-managed coupon codes** — important, because SaaS often tracks by code not link), Tolt ($29/mo, early-stage). https://getreditus.com/blog/top-partnerstack-alternatives · https://firstpromoter.com/compare/firstpromoter-vs-partnerstack
- **SaaS commission benchmarks 2026:** 20–30% recurring is market rate; most programs use a fixed 6- or 12-month recurring term rather than true lifetime; dev-audience programs commonly 30% recurring with 90-day cookies. https://track360.io/blog/saas-affiliate-commission-rates-benchmark-2026
- **Aggregator layer (build-vs-buy shortcut):** **Sovrn Commerce** — one approval gives access to *tens of thousands* of merchants without applying individually, plus APIs for merchant/link/report data. **Wildfire Systems** — 50,000+ merchant programs, white-label extension SDK for Chrome/Edge/Safari/Mobile Safari/Mobile Edge, coupon+offer APIs, auto-apply ("The Couponator"), SOC-2 and PCI-DSS, payout rails (PayPal, gift cards, statement credit, custom in-product currency), and even AI-chatbot link detection for ChatGPT/Gemini/Perplexity answers. Used by Citi, RBC, Visa. Rev-share is custom-quoted. https://knowledge.sovrn.com/kb/api-onboarding-guide-for-commerce · https://www.wildfire-corp.com/cashback-white-label-browser-extensions

### 2.2 Tracking mechanics a product team must design for

- **SubIDs are the whole attribution story.** Networks pass up to ~10 sub-ID parameters through the redirect chain and return them in postbacks. You encode `userId | placement | dealId | surface | experimentArm` into SubIDs at click time; without this you cannot attribute a commission to a specific user, card, or A/B arm. https://track360.io/blog/affiliate-deep-linking-tracking-operator-guide-2026
- **S2S postback > pixel.** Advertiser server → your server, carrying the click ID captured at click time. Harden with **IP allowlisting of network postback endpoints** and **signed/hashed tokens**, or you will be paid for fabricated conversions. https://dzone.com/articles/postback-and-s2s-conversion-tracking-guide
- **Deep linking is infrastructure, not a toggle** — it touches the tracking system, the redirect layer, the landing-page code, and the postback config. Decide it once, up front. https://track360.io/blog/affiliate-deep-linking-tracking-operator-guide-2026
- **Cookie windows vary wildly:** Amazon 24 hours (extended to 89 days if added to cart within the window); StackSocial 365 days; typical SaaS 30–90 days. Your "did we earn this?" logic must be per-merchant. https://blog.freshstore.com/amazon-associates-operating-agreement-guide/
- **Redirect/cloaking rules:** cloaking via your own redirector is fine with Google *provided* you use 301 or 302/307 and tag with `rel="sponsored"` (preferred) or `rel="nofollow"`. "Bot sees X, human sees Y" is where it becomes spam. **But Amazon separately forbids obscuring the amazon.com destination.** https://affiliate-blog.linkstest.com/affiliate-link-cloaking-compliance-amazon-rules-vs-google-rel-sponsored-safe-redirect-methods/ · https://geniuslink.com/blog/rel-sponsored-affiliate-links/
- **Product feeds:** each network has its own format — **Awin prefers CSV, min image 600px; CJ accepts XML/API; ShareASale is pipe-delimited CSV with CRLF line breaks, min image 500px**, columns like `ProductID | Name | MerchantID | Merchant | Link | Thumbnail | BigImage | Price | RetailPrice | Category`. Any ingestion pipeline needs per-network adapters. https://www.cumbrowski.com/CarstenC/affiliatemarketing_datafeeds_shareasale.asp · https://plumrocket.com/magento-data-feed/awin

### 2.3 Reconciliation

- Publisher reality: **booked ≠ earned**. Reversal/refund rate silently cuts real EPC — "a program with a 25% reversal rate is quietly cutting your real EPC by a quarter." The number that matters is **booked-minus-reversed 30 days later**. https://track360.io/blog/affiliate-commission-clawback-operator-guide
- Networks settle **net-30/net-60** after a payment threshold. *"A 10% better payout rate on net-60 terms with a $200 threshold is often worse than a lower rate on net-15 with no threshold. Cash flow beats headline rate."* https://track360.io/blog/affiliate-commission-clawback-operator-guide
- Chargeback window is **120 days** for most card networks; standard validation holds are **30–60 days**. https://track360.io/blog/affiliate-commission-clawback-operator-guide

---

## 3. Legal, compliance and platform policy

### 3.1 FTC (US)

- Material connection must be disclosed **every time the endorsement appears**, in plain language, **adjacent to the link** — not in a footer, not on a separate policy page. "Endorsement and disclosure should ideally be visible at the same time." https://partnercentric.com/blog/how-to-properly-disclose-ftc-endorsements/
- Revised Endorsement Guides (June 2023) added platform-specific guidance and expectations about **brand monitoring of its endorsers**. https://www.ftc.gov/news-events/news/press-releases/2023/06/federal-trade-commission-announces-updated-advertising-guides-combat-deceptive-reviews-endorsements
- The **2024 Consumer Reviews & Testimonials Rule** bans fake/manipulated reviews with civil penalties — directly relevant to community "this code worked ✓" votes if we ever seed or weight them dishonestly. https://www.referralcandy.com/blog/ftc-affiliate-disclosure/
- FTC dark-pattern enforcement is live and expensive: **$2.5B Amazon settlement, Sept 2025**, and the agency explicitly names "misleading urgency or scarcity claims, including false activity messages or fake, non-expiring countdown timers." https://legalclarity.org/ftc-dark-patterns-legal-authority-and-enforcement-actions/

### 3.2 Chrome Web Store — the rules that get affiliate extensions banned

This is the single most product-shaping constraint for our sidecar. Policy effective, **enforcement began 10 June 2025**.

Verbatim requirements:
- *"Related user action is required before the inclusion of each affiliate code, link, or cookie."*
- Affiliate links/codes/cookies may only be included when the extension provides **"a direct and transparent user benefit related to the extension's core functionality"**.
- *"Any affiliate program must be described prominently in the product's Chrome Web Store page, user interface, and before installation."*

Explicitly listed violations:
- Inserting affiliate links when **no discount, cashback, or donation is provided**
- **Continuously injecting** affiliate links in the background without user action
- Modifying shopping cookies without user awareness while browsing retail sites
- **Appending or replacing affiliate codes in URLs** without explicit user knowledge/action
- **Applying or replacing promo codes** without explicit user knowledge/action
- Click-bait metadata

https://developer.chrome.com/docs/webstore/program-policies/affiliate-ads · https://developer.chrome.com/docs/webstore/program-policies/affiliate-ads-faq · https://developer.chrome.com/blog/cws-policy-update-affiliate-ads-2025

**Translation for us:** an "auto-apply at checkout that silently sets our cookie" build is now a store-removal risk. The compliant shape is: user clicks *"Find codes"* → we test codes → **if and only if** we produce a working code / cashback do we attach our affiliate link → we show what we did.

Permissions: prefer `activeTab` and `chrome.permissions.request()` optional host permissions over blanket `<all_urls>`. Over-permissioning is cited as the **#1 cause of store rejection and user distrust**, and it depresses install conversion because the permission warning is shown pre-install. https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions · https://extensionbooster.com/blog/best-practices-build-browser-extension/

Privacy context we inherit: Honey's "read and change all your data on the websites you visit" permission is the canonical cautionary tale; in Feb 2026 researchers found **300+ Chrome extensions with 37.4M combined users leaking or stealing data**. https://news.gatech.edu/news/2024/09/17/study-finds-thousands-browser-extensions-compromise-user-data · https://www.pandasecurity.com/en/mediacenter/chrome-extensions-spying-you/

### 3.3 Amazon Associates — effectively disqualifying for our extension

From the Operating Agreement / Participation Requirements:
- **Special Links may not be used "on or in connection with any client-side software application (e.g., a browser plug-in, helper object, toolbar, extension, or component)"** — mobile apps only by separate written agreement. This alone rules Amazon out of the sidecar.
- **All offline promotion is prohibited**, and trademarks/logos may not be used "in any printed material, mailing, SMS, MMS, email or attachment to email" — i.e. **no Amazon links in our email digest**.
- **No cloaking/obscuring** the source site.
- **Price display:** if you show Amazon prices in any comparison against non-Amazon prices, you must show both the lowest new and (if provided) lowest used price, plus a **timestamp disclaimer** of when the data was retrieved.
- **No incentives:** you may not offer "money, rebate, discount, points, donation to charity" for using Special Links — **this bans a cashback/points layer on Amazon**.

https://affiliate-program.amazon.com/help/operating/participation/ · https://geniuslink.com/blog/amazon-associates-requirements/

### 3.4 GDPR / ePrivacy (EU)

- ePrivacy **Art. 5(3) requires prior consent** for storing/accessing anything on terminal equipment. **Legitimate interest under GDPR Art. 6 is not a substitute.** The publisher placing the affiliate link bears primary responsibility for obtaining consent. https://www.cookieyes.com/blog/affiliate-cookie-consent-requirements/ · https://www.consenteo.com/knowledge-hub/GDPR/gdpr_cookie_consent_2026
- **EDPB Guidelines 2/2023 (final Oct 2024)** extended Art. 5(3) beyond cookies to **pixels, URL tracking parameters, IP-only tracking, and fingerprinting** — meaning our SubID-in-URL scheme is in scope, not just cookies. https://www.consenteo.com/knowledge-hub/GDPR/gdpr_cookie_consent_2026
- Enforcement is real: **CNIL fined Google €325M and SHEIN €150M in 2025** for cookie-consent violations. https://usercentrics.com/knowledge-hub/eu-cookie-compliance/
- Watch: the Nov 2025 **Digital Omnibus Regulation** proposal would clarify which limited purposes may operate without consent. https://www.iubenda.com/en/blog/privacy-marketing-cookie-consent-europe/

### 3.5 EU price-display law (Omnibus Directive 2019/2161, Art. 6a)

Any announced price reduction must state **the lowest price the trader applied in the preceding 30 days** — confirmed by the CJEU. Penalties up to **≥4% of annual turnover** in affected member states, floor €2M. If we render "was €X, now €Y −40%" for EU users we are making a price-reduction announcement. https://insightplus.bakermckenzie.com/bm/international-commercial-trade/european-union-the-cjeu-confirms-that-a-price-reduction-must-be-calculated-based-on-the-lowest-price-in-the-last-30-days · https://www.twobirds.com/en/insights/2025/global/transparency-of-price-reductions-a-closer-look-at-the-legal-framework-in-the-eu

### 3.6 Brand bidding / trademark

- Trademark bidding = bidding on brand terms, close variants, or **"brand + coupon" queries**. ~85% of programs prohibit or restrict it; **fewer than 15% allow it unrestricted**. https://www.tinyaffiliate.com/blog/brand-bidding-policy-for-affiliates-template
- ShareASale lets merchants register protected TM terms; CJ runs a TM policy system where merchants whitelist specific publishers for TM+ bidding, and **violations trigger commission reversals**. Geo-targeting or dayparting to dodge enforcement is grounds for immediate program removal. https://www.brandverity.com/blog/affiliate-compliance-guide

---

## 4. Deal data quality and operations

### 4.1 Freshness scoring — the concrete model to copy

SimplyCodes' published mechanic: a code's **health score starts at 100% when freshly verified and decays with days-since-verification**, adjusted by how it is currently testing. The score combines **outcome data + consensus weight + freshness decay** into one confidence number. Aging or failing codes are **automatically re-queued for community re-testing**; if they still work, the score refreshes.
https://simplycodes.com/how-it-works · https://simplycodes.com/blog/best-coupon-app-extension

Reported outcome of that discipline: **81.5% success across 33,235 merchants** (Mar 2026).

### 4.2 Where codes come from, and why each source rots

Higher-quality platforms use *"a mix of automated testing, editorial review, community feedback signals, deduplication and ranking to combine duplicates and surface the most recently successful code."* Sources in practice: affiliate-network coupon feeds (stale, merchant-sanctioned, lowest value), scraped web (noisy, expired), community submission (freshest, most abusable), direct merchant relationships (best terms, highest BD cost — Wirecutter's stated preference).
https://simplycodes.com/blog/how-coupon-sites-get-codes · https://www.awin.com/us/how-to-use-awin/wirecutter-affiliate-partner-success

**Automated coupon testing is patented territory** — e.g. USPTO 11,727,428 and 12,165,166 "Automated testing of multiple on-line coupons." Worth a freedom-to-operate glance before building a checkout-testing bot. https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11727428

### 4.3 Adversarial supply

RetailMeNot's documented failure mode: **scammers submit fake codes purely to drive traffic**. Any open submission form gets this within weeks. Slickdeals' counter is structural: retailers and their associates may not post their own deals, and a paid review funnel channels merchant supply into a queue that still has to earn placement. https://simplycodes.com/blog/best-coupon-app-extension · https://slickdeals.net/corp/acceptable-use.html

### 4.4 Price history

- **CamelCamelCamel** is fully free — charts, browser plugin, alerts — funded by affiliate links and ads. **Keepa** monetizes: ~€19/mo for data access, **API from ~€49/mo for 20 tokens/min**, covering 4.5B+ Amazon products. If we ever want price history we buy Keepa rather than build a crawler. https://www.hulkapps.com/blogs/ecommerce-hub/choosing-the-best-amazon-price-tracker-camelcamelcamel-vs-keepa · https://goaura.com/blog/camelcamelcamel-vs-keepa
- Note this is Amazon-shaped. For SaaS/dev tools there is **no equivalent price-history source** — a genuinely open gap we could own for dev tooling (e.g. tracking Cursor/Linear/JetBrains list-price and promo history ourselves).

### 4.5 Black Friday operations

The publisher-side calendar starts in **April**: review last year → May budgets → June outreach → **July lock premium placements** → August finalize hero products and commission tiers → September brief partners → **October test tracking and confirm codes** → November execute. Brands must be told about non-stackability of codes early. https://growth-hq.co/blog/your-countdown-to-black-friday-how-to-nail-your-affiliate-strategy/ · https://trackonomics.net/blog/black-friday-cyber-monday-affiliate-checklist-for-publishers/

2025/26 shift worth internalizing: *"Organic search is no longer a dependable growth engine, the holiday shopping window now includes all of November, and publishers are refocusing on first-party channels and direct relationships."* https://www.adweek.com/media/publishers-affiliate-post-search-black-friday/

---

## 5. UX patterns that convert (and the ones that are dark patterns)

### 5.1 Proven converters

- **Price-drop alerts convert at 8–15%**, versus ~2.63% for the best-performing standard triggered email (abandonment). Click-to-conversion on triggered messages ~21.78%. Recommended threshold: **only fire for ≥15–20% drops**, otherwise the channel decays. Most purchases land in the first few hours. https://us.upsellit.com/blog/pricedropalerts/ · https://www.sequenzy.com/for/price-drop-alert-email
- **Watchlist → alert is the retention mechanic**, not the deal page. Honey's Droplist converts a one-time coupon lookup into a standing relationship (`00-research.md` §1).
- **Personalized ranking beats more supply:** Pepper's recommendation engine lifted click-outs **+21%**. https://www.recombee.com/case-studies/pepper
- **Cashback status transparency:** TopCashback exposes three explicit states — **Pending → Confirmed → Payable** — and tells users *payable* only happens after the retailer's invoice reaches the affiliate network. Rakuten pays monthly (confirmed by month end → paid on the 15th of the next); pending-to-confirmed typically **3–14 weeks**. Users tolerate long waits when the state machine is visible; they churn when it is a black box. https://www.topcashback.com/help/cash-back-statuses/ · https://scrimpr.co.uk/review/rakuten/
- **Missing-payout claims are a first-class flow, not a support ticket.** Rakuten claims have a time window; guidance is to file within 7–10 days. Build the claim form. https://blog.brandumentals.com/rakuten-missing-cash-back/
- **Gated/exclusive offers via verification:** SheerID verifies student/military/etc. status against authoritative data sources in 191 countries, with document review as fallback, explicitly to **prevent promo abuse and identity spoofing**. This is the industry-standard way to make "only for this community" real. https://www.sheerid.com/audience-students/ · https://www.sheerid.com/offer-protection/
- **Extension onboarding:** get to value in **under 60 seconds**; 86% of users decide in the first few minutes; poor onboarding drives ~80% abandonment. **Most users don't know how to pin an extension — a visual pin guide materially raises daily usage.** Onboarding checklists retain **+47.9% more users at day 30**. https://extensionbooster.com/blog/best-practices-build-browser-extension/

### 5.2 Dark patterns to explicitly forbid

FTC-named and regulator-targeted:
- **Fake/non-expiring countdown timers** and **false activity or scarcity messages** ("only 2 left", "12 people viewing") — named in FTC enforcement. https://legalclarity.org/ftc-dark-patterns-legal-authority-and-enforcement-actions/
- **Inflated reference prices** — the entire reason for the EU 30-day-lowest-price rule. https://legalclarity.org/what-does-lowest-price-in-30-days-mean-eu-and-us-rules/
- **Cookie stuffing / attribution hijacking** — Honey's Secret Tab allegations and Phia's hidden background tab. Commercially fatal even when legally survivable (Rakuten cut Honey off; Impact suspended Phia). https://techcrunch.com/2026/07/10/phia-accused-of-cookie-stuffing-taking-affiliate-credit-on-purchases-it-didnt-earn/
- **Theatrical search with a rigged result set** — animating "checking 300 codes" while only testing merchant-sanctioned ones is the specific behavior that destroyed Honey's reputation (`00-research.md` §1).
- **Silent affiliate attachment with no user benefit** — now an explicit Chrome Web Store removal offense, not merely distasteful. https://developer.chrome.com/docs/webstore/program-policies/affiliate-ads
- **Fake reviews / manufactured "it worked" votes** — FTC 2024 Reviews Rule carries civil penalties. https://www.referralcandy.com/blog/ftc-affiliate-disclosure/
- France's DGCCRF made dark patterns a **2025–2028 enforcement priority**; 80+ e-commerce sites hit with blocking orders in H1 2025. https://us.fashionnetwork.com/news/-dark-patterns-what-lies-ahead-for-deceptive-e-commerce-practices-,1824463.html

---

## 6. SEO for deals/coupons in 2025–2026

### 6.1 Google's actual policy text

From Google's spam policies — **site reputation abuse** examples explicitly include *"news sites distributing third-party coupons to exploit established reputation."* What is **not** abuse, verbatim in the same doc: **user-generated content platforms and forums**, syndicated news, editorial columns, third-party content genuinely meant to reach readers, **affiliate links when properly attributed**, and **"coupons sourced directly from merchants serving consumers."**
https://developers.google.com/search/docs/essentials/spam-policies

**This is the single most important paragraph for our product:** a community-generated deals section on daily.dev, with first-party editorial involvement and merchant-direct offers, sits on the *permitted* side of the line — but a white-labelled third-party coupon subdirectory would not.

**Thin affiliate:** copying merchant product descriptions with no original content violates policy, especially cookie-cutter templates replicated across domains. Acceptable affiliate pages add **original reviews, price comparison, actual testing, product navigation, or category organization**. https://developers.google.com/search/docs/essentials/spam-policies

### 6.2 Enforcement timeline and casualties

- Policy announced **5 Mar 2024** with the March core update; manual-action enforcement began **May 2024**. https://www.searchenginejournal.com/google-strengthens-policy-against-site-reputation-abuse/533018/
- Hit: CNN, USA Today, LA Times among the first manual actions, primarily for **third-party coupon and promotional sections**. Plus Forbes Advisor, APNews Buyline, Time Stamped, Fortune Recommends (−67%), MarketWatch Guides, CNN Underscored, WSJ Buyside. https://www.gsqi.com/marketing-blog/a-nightmare-on-affiliate-street/
- UK: coupon sections on Daily Mail, Mirror, Telegraph, Independent disappeared from search; **one site went from 1.6M monthly organic visits to near zero.** Meanwhile dedicated voucher sites *gained*. https://theapma.co.uk/what-googles-latest-search-updates-mean-for-coupon-publishers/
- **Moving the section to another subdirectory or subdomain is treated as circumvention and makes it worse.** https://www.seroundtable.com/google-site-reputation-abuse-move-38457.html
- **2026 status:** Google has stated that *no amount of first-party oversight changes the third-party nature of content if its primary purpose is ranking manipulation* — the "we have editors" defense is dead. As of mid-2026 enforcement is still **manual-action only**; Gabe and Marie Haynes both confirm the algorithmic version has not shipped. The European Commission is probing whether these penalties unfairly hit legitimate publisher commercial partnerships. https://kitful.ai/blog/surviving-the-2026-site-reputation-abuse-policy-a-compliance-guide-for-scaled-publishers · https://www.capconvert.com/learn/blog/google-site-reputation-abuse-18-months

### 6.3 Structured data

- `Product` + `Offer` with required `name`, `image`, `offers.price`, `offers.priceCurrency`. Markup must be **server-rendered HTML** (not injected by JS) and must **match what users see**. https://developers.google.com/search/docs/appearance/structured-data/product-snippet
- Coupon codes can surface on product listings alongside sale price and stock status via **Merchant Center Promotions** on the Free Listings surface. https://support.google.com/merchants/answer/6386198
- June 2025: Google launched **loyalty-program structured data** — `MemberProgram` nested under `Organization`, and member pricing via `UnitPriceSpecification` under `Offer`. Directly usable if daily.dev Plus gets member-only pricing. https://www.magstags.com/notes/google-ecommerce-rich-results/
- Every affiliate outbound link must carry `rel="sponsored"` (preferred) or `nofollow`, dynamic links included. https://geniuslink.com/blog/rel-sponsored-affiliate-links/

---

## 7. Monetization beyond affiliate

| Model | How it works in the wild | Source |
|---|---|---|
| Sponsored placements | Slickdeals sells Featured Deals, Announcement Bars, Weekly/Solo Newsletters (1.2M subs), sponsored Giveaways with 5 highlighted deals; CPM across desktop/mobile/email/social with geo + 20 category targets | https://sales.slickdeals.net/ |
| Paid *access to review*, not paid placement | Slickdeals DSF — monthly subscription to submit + get pricing/sentiment feedback; placement still earned by votes | https://help.merchants.slickdeals.net/knowledge/the-dsf-review-process |
| Selling performance data back to brands | Slickdeals' 4th pillar: analytics/performance reports to brands | https://www.enactsoft.com/resources/slickdeals-business-model/ |
| Premium tier unlocks better deals | NachoNacho Basic = 400+ discounts, Premium = 800+; AppSumo Plus $99/yr (~27k members) | https://nachonacho.com/about · https://appsumo.com/blog/appsumo-myths |
| Lead-gen bounty (beats % commission at high LTV) | The Points Guy: ~$120 per approved card customer, up to 4× for volume publishers | https://digiday.com/media/points-guy-built-100-person-media-company-off-affiliate-fees/ |
| Rev-share with users (cashback/points) | Honey Gold, Rakuten; Wildfire supports PayPal / gift card / statement credit / **custom in-product currency** payouts | https://www.wildfire-corp.com/cashback-white-label-browser-extensions |
| Deal-submission bounty to community | Slickdeals runs deal-posting contests/sweepstakes to keep supply flowing | https://corp-site.slickdeals.net/slickdeals-deal-posting-contest-official-rules/ |

**Vendor-funded credits ("free months for community X") — how these are actually structured:**
- **AWS Activate:** up to $100k (some tiers to $300k) in credits; eligibility gates are *company* attributes — <10 years old, privately held, no prior Activate credits. Credits are distributed through **partner organizations** (accelerators, VCs, and platforms), which is the slot a community like daily.dev would occupy. https://aws.amazon.com/activate/ · https://xraise.ai/blog/aws-activate-credits-startups/
- **Notion for Startups:** 6 months free Business plan with unlimited AI, up to 100 employees. https://orbitmoney.io/deals/blog/startup-credits
- **Stripe Atlas ($500)** automatically grants access to AWS Activate and Notion credits — **perk programs deliberately unlock each other**, forming a graph. Being a recognized "unlocking" node is the strategic position. https://orbitmoney.io/deals/blog/startup-credits
- **Vercel AI Accelerator:** $6–8M in pooled credits across Vercel, v0, AWS and other AI platforms for a 40-participant cohort — cohort-based, not open-directory. https://vercel.com/blog/the-vercel-ai-accelerator-is-back-with-6-million-in-credits
- **The universal gotcha:** most credits expire in 12–24 months and services **auto-bill when credits run out**. A directory that tracks expiry per user is a real, unmet service. https://orbitmoney.io/deals/blog/startup-credits

---

## 8. Things that surprise a first-time team

1. **Booked revenue is fiction for 30–120 days.** Card chargeback window is 120 days; standard affiliate validation holds are 30–60 days; cashback pending→confirmed is typically 3–14 weeks. Never show a user "you earned $X" in a way that implies it's spendable. https://track360.io/blog/affiliate-commission-clawback-operator-guide · https://scrimpr.co.uk/review/rakuten/
2. **Negative balances are normal.** If a refund lands after payout, merchants apply a negative balance against future commissions. Your ledger must support it. https://blog.goaffpro.com/affiliate-refunds-and-returns-handle-them-with-goaffpro/
3. **Network terms beat commission rates.** net-60 with a $200 threshold can be worse than a lower rate at net-15 with no threshold. https://track360.io/blog/affiliate-commission-clawback-operator-guide
4. **Fraud vectors specific to this product:** self-referral (user buys through own link for a discount), referral farming (many controlled accounts), coupon abuse, and extension-based commission theft. Detection signals: unusually high conversion rates, repeat orders from similar devices, heavy coupon usage, commissions concentrated on *existing* customers, IP velocity. Mitigations: one-time-use codes, self-referral blocking by email+IP, delayed payouts, leaked-code monitoring. https://www.rewardful.com/guides/how-to-detect-and-prevent-affiliate-fraud · https://searchengineland.com/unmasking-affiliate-fraud-protecting-growth-in-2026-464840
5. **The network is the regulator.** Rakuten Advertising cut Honey off from ~2,000 merchants; Impact suspended Phia. One compliance incident can vaporize supply overnight regardless of the legal outcome. https://lawfold.com/honey-lawsuit/
6. **Traffic ≠ revenue in this category.** Pepper: ~500M monthly impressions, ~$13M revenue. Slickdeals: 25M monthly visitors, ~$49–80M. Monetization density comes from merchant relationships and placement inventory, not pageviews. https://tech.eu/2015/11/03/pepper-com-social-commerce/
7. **The lifetime-deal model decays.** AppSumo revenue reportedly halved as the LTD well ran dry. Discount marketplaces need a supply refresh engine or they die. https://ppc.land/appsumos-revenue-crashes-50-as-lifetime-deal-model-faces-existential-crisis/
8. **Support burden is concentrated in "where's my money."** Missing-cashback claims have retailer-imposed time windows; users must file within days, and some retailers refuse late claims outright. Without self-serve claim tooling this becomes a headcount problem. https://blog.brandumentals.com/rakuten-missing-cash-back/
9. **Automated coupon testing is patented.** USPTO 11,727,428 / 12,165,166. https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/12165166
10. **Amazon is essentially off the table for the extension and email**, which reshapes the whole merchant strategy toward SaaS/dev tools (where commissions are 20–30% recurring anyway, far better than Amazon's 1–4%). https://affiliate-program.amazon.com/help/operating/participation/

---

## Implications for daily.dev Deals

Concrete, buildable gaps. Ordered roughly by "blocks launch" → "blocks scale."

### Compliance and platform survival (must exist at v1)

1. **Extension must be click-to-act, never background-inject.** Design the sidecar so *no* affiliate cookie/link/code is ever set without a preceding explicit user action (a "Find codes" / "Apply offer" button), and only when we actually deliver a code, cashback, or credit. Add a build-time lint/test that fails if the affiliate redirect can be reached from any non-user-initiated code path. Chrome enforces this since 10 Jun 2025 and removal is the penalty. [§3.2]
2. **Add an "affiliate program" disclosure in three places:** the Chrome Web Store listing body, a pre-install/first-run consent screen, and persistently in the extension UI. This is a literal policy requirement, not a nicety. [§3.2]
3. **Per-card FTC disclosure component.** A `<OfferDisclosure />` rendered adjacent to every outbound CTA ("daily.dev may earn a commission" / "Sponsored"), visible in the same viewport as the link — not a footer link, not a `/affiliate-disclosure` page. Applies in feed cards, the deals directory, the extension popup, and email. [§3.1]
4. **Ship a "why we ranked this / were we paid?" state on every offer.** Three explicit values in the data model: `monetization: 'affiliate' | 'sponsored' | 'none'`. Sponsored must render a visually distinct label. Community picks must be resolvable without any monetization. [§1.1, §5.2]
5. **Consent gating for EU users before any SubID/affiliate redirect.** EDPB 2/2023 puts URL tracking parameters and pixels in scope, not just cookies — the outbound redirect itself needs consent. Wire the deals redirector to the existing CMP and hard-fail closed. [§3.4]
6. **Do not render "was $X → now $Y, −40%" to EU users** unless we can substantiate the 30-day-lowest reference price. Either store `priceHistory` per offer or render savings as merchant-stated text with attribution. Penalty ceiling is 4% of turnover. [§3.5]
7. **Exclude Amazon from the extension and from email entirely.** Encode a `merchant.channels: ['web','extension','email']` allowlist per merchant so policy is data, not tribal knowledge. [§3.3]
8. **Minimum-permission extension:** `activeTab` + `chrome.permissions.request()` optional host permissions per merchant domain, never blanket `<all_urls>`. Publish a Limited Use statement. Over-permissioning is the #1 rejection cause and visibly suppresses install conversion. [§3.2]
9. **`rel="sponsored"` on 100% of outbound offer links**, including dynamically rendered ones, and a 302 through our own redirector. Add a test asserting the attribute is present on every offer CTA. [§6.3]

### Data model gaps

10. **Offer needs a health score, not a boolean.** Fields: `lastVerifiedAt`, `verificationOutcomes[]` (success/fail + userId + timestamp), `healthScore` (starts 100 on verification, decays by days-since-verification, weighted by consensus), `autoRetestQueuedAt`. Copy SimplyCodes' three-input formula: outcome data + consensus weight + freshness decay. Surface it as "worked ✓ 2h ago · 94% success (37 reports)". [§4.1]
11. **Bidirectional voting, not upvote-only.** Pepper's "temperature" lets the community actively *cool* a bad deal. An upvote-only feed cannot kill a stale offer, which is the single biggest quality risk in a community deals product. [§1.2]
12. **Per-merchant terms as first-class data:** `cookieWindowDays`, `attributionModel` ('last-click'|'first-click'), `commissionType` ('percent'|'flat'|'recurring'|'bounty'), `commissionValue`, `recurringTermMonths`, `validationHoldDays`, `network`, `networkFeePercent`, `brandBiddingAllowed`. Amazon 24h vs StackSocial 365d vs SaaS 90d cannot live in a comment. [§2.2]
13. **Deal dedup key.** `(merchantId, normalizedCode, offerType, expiresAt)` plus fuzzy matching on offer text, so three community submissions of the same code collapse into one card carrying the union of verification reports. Without this the feed fills with duplicates within a month. [§4.2]
14. **Credit-expiry tracking per user.** Startup/dev credits expire in 12–24 months and auto-bill. `userClaim { offerId, claimedAt, creditExpiresAt, notifyAt }` plus a reminder job is a genuinely unmet service in this space and a strong retention hook. [§7]
15. **Ledger with reversal support.** `commissionEvent { status: pending|confirmed|reversed|paid, bookedAt, confirmedAt, reversedAt, amount }` and support for **negative balances**. Never show users a spendable number derived from `pending`. [§8.1, §8.2]

### Flows we don't have

16. **Explicit three-state reward UI: Pending → Confirmed → Payable**, with the reason for each ("waiting on the retailer's return window"), copied from TopCashback. Long waits are tolerable when visible; black boxes cause churn and support load. [§5.1]
17. **Self-serve "missing credit / missing cashback" claim form** with the merchant's claim deadline shown up front, and a 7–10 day nudge. Otherwise this is a support headcount line item. [§5.1, §8.8]
18. **Watchlist + drop alert as the retention primitive.** Alert only on ≥15–20% improvements (new lower price, better code, new exclusive). Price-drop alerts convert at 8–15% vs ~2.6% for the best generic triggered email — but only if the threshold keeps the channel honest. [§5.1]
19. **Merchant-facing submission queue that sells review, not placement.** Copy Slickdeals DSF: vendors can pay to submit + get feedback; placement is still earned by community votes. Pair it with a hard rule, published in the community guidelines, that **vendors and their employees may not post their own offers** as community submissions. [§1.1, §7]
20. **Gated-offer verification path.** For "only for daily.dev members" offers, decide the gate: internal (account age / streak / reputation) or third-party (SheerID-class) for student/startup-status offers. Vendors will demand abuse protection before granting exclusive terms. [§5.1]
21. **Extension first-run: value in <60s, plus an explicit pin guide.** 86% of users decide in minutes; most don't know how to pin. Add a 3-step onboarding checklist (day-30 retention +47.9% in comparable products). [§5.1]

### Technical plumbing to design for now

22. **SubID schema decided before the first merchant integration.** Encode `userId|surface|dealId|placement|experimentArm` into network sub-IDs (up to ~10 params survive the redirect chain and return in postbacks). Without this we cannot measure which surface earns, cannot pay users cashback accurately, and cannot A/B test deal ranking against revenue. Retrofitting is a re-integration with every merchant. [§2.2]
23. **S2S postback receiver with IP allowlist + signed tokens**, not pixels. Treat unsigned postbacks as untrusted input. [§2.2]
24. **Buy the merchant graph, don't apply merchant-by-merchant.** Evaluate Sovrn Commerce (one approval → tens of thousands of merchants + merchant/link/report APIs) and Wildfire (50k+ programs, white-label extension SDK across Chrome/Edge/Safari incl. mobile, coupon APIs, payout rails, SOC-2/PCI-DSS) against direct programs. For dev-tool SaaS specifically, go direct or via PartnerStack/Reditus/FirstPromoter — note FirstPromoter supports **affiliate-managed coupon codes**, which matters because SaaS often tracks by code rather than link. [§2.1]
25. **Fraud controls before the first cashback payout:** self-referral blocking (email + IP + payment fingerprint), IP velocity limits, one-time-use codes where the merchant supports them, delayed payout past the validation hold, and alerting on conversion-rate outliers and commissions concentrated on pre-existing customers. [§8.4]

### SEO position (a strategic choice, not a task)

26. **Build this as first-party community content, and say so structurally.** Google's spam policy explicitly exempts UGC platforms/forums, properly attributed affiliate links, and *"coupons sourced directly from merchants."* The penalized pattern is a third-party-operated coupon subdirectory on a trusted domain — which is exactly what a white-label vendor (StackCommerce/Global Savings Group-style) would give us. **Do not outsource the deals subdirectory.** Google has also stated that first-party oversight does not launder third-party content, and that relocating a penalized section is circumvention. [§6.1, §6.2]
27. **Every offer page must clear the "thin affiliate" bar** with something merchants can't supply: the community verification history, real comments, the "why it's worth it" reasoning blurb from `01-product-spec.md`, and comparison against alternatives. Server-render `Product`+`Offer` JSON-LD matching the visible price; consider `MemberProgram` markup if Plus gets member pricing. [§6.1, §6.3]

### Anti-patterns to write into the spec as prohibited

28. No countdown timers or "X left" counters that aren't backed by a real merchant-supplied constraint; no "N people viewing." No animated "searching 300 codes" theatre unless we genuinely test that set. No attaching our affiliate parameter when we delivered nothing. No seeding or weighting "worked ✓" votes we didn't receive. These are, in order: FTC dark-pattern enforcement, the Honey reputational collapse, a Chrome removal offense, and the FTC 2024 Reviews Rule. [§5.2, §3.1, §3.2]
