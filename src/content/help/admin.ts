export type Section = { id: string; title: string; content: string };

export const adminSections: Section[] = [
  {
    id: "getting-started",
    title: "Getting started",
    content: `
**Creating your account**

Loyalty Leap uses a two-step onboarding process:

1. A Loyalty Leap staff member sets up your business profile and assigns your email address as the owner.
2. You visit the app and click **Sign up** — not Log in — using that exact email address.

Why Sign up and not Log in? Your business is waiting to be claimed. Signing up creates a personal account and instantly links it to your business. If you try to log in first, there is nothing to log into yet.

**After signing up**

You will land on the **Admin Dashboard**. From here you can navigate to:
- **Till** — give customers stamps and redeem rewards
- **Customers** — view, search and add customers
- **Rewards** — set up your loyalty programme
- **Analytics** — track performance
- **Settings** — view your plan

**Staff accounts**

Only the business owner (admin) can access the dashboard. Till staff use the Till screen directly — there is no separate staff login at this time.
    `.trim(),
  },
  {
    id: "programme-setup",
    title: "Setting up your loyalty programme",
    content: `
**Rewards**

Go to **Rewards** to create the items customers work towards. Each reward needs:
- A **name** (e.g. "Free coffee", "10% off next visit")
- **Stamps required** — how many stamps a customer must collect before they can redeem
- **Cost to you** (optional, in Rand) — used to calculate programme cost in Analytics

You can have multiple active rewards at once. On the Starter plan there is a limit on active rewards; Growth and Pro have more room.

**Programme rules (Earn rule & Cooldown)**

Open the **Programme** section on the Rewards page:
- **Earn rule** — how many stamps a customer earns per visit (default 1)
- **Minimum spend (R)** — a customer must spend at least this amount to earn a stamp. Leave blank for no minimum.
- **Cooldown (hours)** — minimum hours between stamps for the same customer. This prevents multiple stamps in one day. Leave blank for no cooldown.

Changes take effect immediately for new transactions.
    `.trim(),
  },
  {
    id: "birthday-rewards",
    title: "Birthday rewards",
    content: `
**How birthday rewards work**

A birthday reward is a free, automatic reward given to a customer on their birthday month. It is separate from the stamp programme — the customer does not need to collect any stamps to get it.

**Enabling birthday rewards**

On the **Rewards** page, open the **Birthday reward** section and toggle it on. You must set:
- **Reward name** — what the customer receives (e.g. "Free slice of cake")
- **Cost to you (R)** — optional, for analytics tracking

**How it fires**

When a customer visits the till during their birthday month, you will see a **Birthday reward available** banner. Tap **Redeem birthday reward** to give it to them. The customer can only receive one birthday reward per year.

**Customers must have their birthday registered** — either when you add them via Add customer, or when they sign up in the app and enter their birthday.
    `.trim(),
  },
  {
    id: "till",
    title: "Running the till",
    content: `
**Two ways to stamp**

Open the **Till** page. You will see two tabs:

**QR code tab**
1. Tap **Generate QR code**. A one-time code appears with a 60-second countdown.
2. The customer scans it with their Loyalty Leap app.
3. The stamp is awarded automatically and the screen confirms the customer's name.
4. The code expires after 60 seconds or after one scan — whichever comes first. Tap Generate again if it expires.

**Phone number tab**
1. Enter the customer's South African cellphone number (with or without the leading 0).
2. Tap **Find customer**.
3. Their name and stamp count appears.
4. Tap **Give stamp** to award the stamp.

**Minimum spend and cooldown**

If you have set a minimum spend, you will see a spend confirmation step. If the cooldown has not elapsed since the customer's last stamp, the system will block the stamp and show you when they are next eligible.

**Redeeming a reward**

Once a customer has enough stamps, a **Rewards available** section appears below their details. Select the reward and tap **Redeem**. The customer's stamps are deducted and the redemption is logged.

**Birthday rewards at the till**

If the customer is in their birthday month and has not yet redeemed their birthday reward this year, a **Birthday reward available** banner appears. Tap **Redeem birthday reward** — no stamps are deducted.

**Adding a new customer at the till**

If a customer does not have an account:
1. Click **Add new customer** below the phone number field.
2. Enter their name and phone number (email and birthday are optional but useful).
3. Confirm POPIA consent on their behalf.
4. Tap **Add customer**. They are now in your programme and their stamp can be given immediately.

When they later download the app and sign up with the same phone number, their account will automatically link to their existing stamp history.
    `.trim(),
  },
  {
    id: "add-customers",
    title: "Adding customers manually",
    content: `
**The Add customer button**

On the **Customers** page, tap **Add customer** (top right). This opens a form:
- **Name** (required)
- **Phone number** (required — this is their loyalty identity across all shops)
- **Email** (optional)
- **Birthday** (optional, but needed for birthday rewards)

**POPIA consent**

Tick the POPIA consent checkbox before submitting. By doing so you confirm the customer has agreed to their data being stored for loyalty purposes.

**What happens next**

The customer is immediately in your programme with 0 stamps. You can stamp them right away via the Till.

**App linking**

When the customer later downloads the Loyalty Leap app and signs up using the **same phone number**, their account automatically links. They will see:
- Their existing stamp count
- Your shop in their Shops list
- A welcome banner confirming the link

You will see a **Using app** badge next to their name in the Customers list once they have linked.
    `.trim(),
  },
  {
    id: "customers-list",
    title: "Customers list",
    content: `
**Viewing your customers**

The **Customers** page shows everyone in your programme, sorted by most recent visit. Each row shows:
- Name and phone number
- Current stamps (unredeemed)
- Lifetime stamps (all-time total)
- Last visit date
- Date joined
- Whether they are using the app (**Using app** badge)

**Searching**

Use the search bar to filter by name or phone number. Partial matches work.

**Pagination**

The list shows 50 customers at a time. Tap **Show more** to load the next 50.

**CSV export (Pro plan)**

On the Pro plan, two export buttons appear:
- **Export customers** — name, phone, stamps, lifetime stamps, joined date, last visit, birthday, email, app status
- **Export stamp history** — a full log of every stamp and redemption

On Starter and Growth plans, these buttons show a lock icon. Upgrade to Pro to unlock exports.

**Member limits**

Each plan has a maximum number of members. When you are within 10% of the limit, a warning appears. When you reach the limit, new customers cannot join until you upgrade — but existing customers can still earn stamps.
    `.trim(),
  },
  {
    id: "analytics-basic",
    title: "Analytics — basic (Starter & Growth)",
    content: `
The **Analytics** page is available on all paid plans.

**Weekly overview (chart)**

A bar chart showing the last 12 weeks of:
- Stamps given per week
- Rewards redeemed per week
- New members per week

Use this to spot busy periods and see whether your programme is growing.

**This week's numbers**

Four headline tiles:
- Total members in your programme
- Stamps given this week
- Rewards redeemed this week
- New members this week

**Top customers**

The 10 customers with the most lifetime stamps. Recognise and reward your most loyal regulars.

**Upcoming birthdays**

Customers whose birthday falls within the next 30 days, sorted by how soon it is. Use this list to prepare birthday rewards in advance.

**Monthly programme cost**

A table showing each of the last 6 months: number of redemptions and total cost to you (based on the cost-per-reward you set). Months with no cost set on any reward show "—".
    `.trim(),
  },
  {
    id: "analytics-full",
    title: "Analytics — full (Pro)",
    content: `
Pro plan includes everything in Basic, plus:

**Busiest days and hours (heatmap)**

A grid showing stamp activity by day of week and hour of day over the last 12 weeks. Darker cells are busier. Use this to optimise staffing — schedule more staff for your peak hours and fewer for quiet ones.

**Quiet times**

The 5 least-busy day/hour combinations from the heatmap, among the hours you are actually trading. A good prompt for off-peak promotions.

**Stamp method split**

How customers are stamping: QR code vs phone number entry. A high QR percentage means customers are using the app.

**Return rate**

The percentage of customers who have received at least 2 lifetime stamps. A higher return rate means your programme is working.

**Lapsed customers**

Customers who have not visited in 30+ days, sorted by most recent visit. Use this list to reach out or run a win-back promotion.

**Average days to first reward**

How long, on average, it takes a customer from joining to their first redemption. A useful benchmark for adjusting your stamps-required setting.

**Age groups**

How your members break down by age band (Under 18, 18–24, 25–34, 35–44, 45–54, 55+). Only members who provided their birth year are counted.

**Cost per visit**

The total redemption cost over the last 12 weeks divided by the number of stamps given. Tells you roughly what each customer visit costs your programme.

**Reward liability**

An estimate of your outstanding liability: the number of unredeemed stamps across all members, valued at the cheapest active reward's cost per stamp. A planning tool, not an exact figure.

**Reward performance**

How often each reward is redeemed and its total cost over the last 12 weeks. Spot which rewards are popular and which are rarely used.

**Birthday reward stats**

Total birthday rewards redeemed and their combined cost over the last 12 weeks.
    `.trim(),
  },
  {
    id: "plans",
    title: "Plans and limits",
    content: `
Loyalty Leap has three plans:

| | Starter | Growth | Pro |
|---|---|---|---|
| Monthly | R399 | R799 | R1,199 |
| Members | 250 | 1,000 | Unlimited |
| Active rewards | 2 | 5 | Unlimited |
| Analytics | — | Basic | Full |
| CSV export | — | — | ✓ |

**Switching plans**

To upgrade, email [lgubevu@gmail.com](mailto:lgubevu@gmail.com?subject=Upgrade%20my%20Loyalty%20Leap%20plan) and include your business name. There is no self-service upgrade in the app at this time.

**1 month free trial**

All new businesses start on a free trial. No payment is required until the trial ends.

**What happens when you reach a limit**

- **Member limit reached:** existing members can still earn stamps and redeem rewards. New customers cannot join until you upgrade.
- **Active reward limit reached:** you cannot create a new reward until you delete or deactivate an existing one, or upgrade.

Your current plan and usage are shown on the **Settings** page and the usage card at the top of the Customers page.
    `.trim(),
  },
  {
    id: "faq",
    title: "FAQ & troubleshooting",
    content: `
**The Till shows no QR code**

Tap **Generate QR code**. A code must be generated each time — it is single-use and expires after 60 seconds.

**The QR code expired before the customer scanned it**

Tap **Generate QR code** again. The old code is invalid and cannot be reused.

**"Stamp not saved" or "Already stamped today"**

If a cooldown is set, the same customer cannot be stamped again until the cooldown period passes. Check the cooldown setting on the Rewards page.

**Customer says their stamps aren't showing in the app**

Ask them to pull down to refresh the app. If the issue persists, confirm they signed up with the same phone number you have on file. The App column in the Customers list shows whether their account is linked.

**"Export is locked"**

CSV export is a Pro plan feature. The Starter and Growth plans do not include it.

**A customer's birthday reward is not appearing**

Check that:
1. Birthday rewards are enabled on the Rewards page.
2. The customer's birthday is saved (visible in the Customers list or via Add customer).
3. The current month matches their birthday month.
4. They have not already received a birthday reward this year.

**I signed up with Log in instead of Sign up**

Log out and use Sign up with your assigned email. If your email was already used, contact Loyalty Leap support.

**Analytics shows no data**

Analytics builds from your stamp log. If you have not given any stamps yet, charts will be empty. Give your first stamp via the Till and data will appear shortly.
    `.trim(),
  },
];
