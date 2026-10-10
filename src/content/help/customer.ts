export type Section = { id: string; title: string; content: string };

export const customerSections: Section[] = [
  {
    id: "joining",
    title: "Joining a loyalty programme",
    content: `
**How you join**

You can join a shop's loyalty programme in two ways:

1. **At the till** — a staff member adds your name and phone number directly. You are immediately in the programme and can start earning stamps. You do not need the app for this.

2. **By downloading the app** — sign up with your South African mobile number and the shop will appear in your Shops list if it already has your details, or you can scan a till QR code to earn your first stamp.

**What information is stored**

- Your name
- Your mobile number (this is your loyalty identity)
- Optional: email address, birthday month and day
- Your stamp history

Your data is stored securely and used only to run the loyalty programme. See **Privacy and your data** for more details.
    `.trim(),
  },
  {
    id: "loyalty-number",
    title: "Your loyalty number",
    content: `
**Your mobile number is your loyalty identity**

Loyalty Leap uses your South African mobile number (e.g. 082 123 4567) as your unique identifier across all shops. You do not need to remember a separate loyalty card number or PIN.

**One number, multiple shops**

The same mobile number works at every shop that uses Loyalty Leap. Each shop has its own separate stamp count — earning stamps at one shop does not affect your count at another.

**Linking your number to the app**

If a shop already has your number in their system and you sign up in the app with the same number, your stamp history is automatically linked. You will see a welcome banner confirming the link and your existing stamps will appear.
    `.trim(),
  },
  {
    id: "earning-stamps",
    title: "Earning stamps",
    content: `
**Two ways to earn a stamp**

**1. Scan the QR code (recommended)**

When you are at the till, ask the staff to show the till QR code on their screen. Open your Loyalty Leap app, tap **Scan** (the QR icon at the bottom of the screen), and scan the code. The stamp is awarded instantly.

The QR code changes every 60 seconds and can only be used once, so scan it before it expires.

**2. Give your phone number**

Tell the staff your South African mobile number. They enter it into the till and tap **Give stamp**. No app needed for this method.

**Earning rules**

Some shops have rules about stamps:
- **Minimum spend** — you may need to spend a minimum amount to earn a stamp. The staff will let you know.
- **Cooldown** — a shop may limit stamps to once per hour or once per day.

If a stamp cannot be awarded, the staff will see a message explaining why.
    `.trim(),
  },
  {
    id: "redeeming",
    title: "Redeeming a reward",
    content: `
**When can I redeem?**

Once you have collected enough stamps for a reward, it becomes available. You can see your current stamp count and available rewards in the app under **Rewards**.

**How to redeem at the till**

Tell the staff you would like to redeem a reward. They will:
1. Look up your account via QR scan or your phone number.
2. See the available rewards on their screen.
3. Select the reward and confirm the redemption.

Your stamp count is reduced by the stamps required for that reward.

**You do not redeem through the app yourself** — all redemptions are processed by the staff at the till.
    `.trim(),
  },
  {
    id: "birthday-reward",
    title: "Birthday reward",
    content: `
**What is a birthday reward?**

Some shops offer a free reward during your birthday month — independent of your stamp count. It is the shop's gift to you.

**How to register your birthday**

You can add your birthday:
- When you sign up in the app (birthday day and month, plus birth year for age analytics)
- When a staff member adds you via the till form

You do not need to provide your full birth year if you prefer not to — only the month and day are needed for the birthday reward.

**Claiming your birthday reward**

During your birthday month, when you visit the till, the staff will see a **Birthday reward available** banner. They will ask if you would like to redeem it. You can receive one birthday reward per year per shop.
    `.trim(),
  },
  {
    id: "multiple-shops",
    title: "Multiple shops",
    content: `
**Your Shops list**

The **Shops** section of the app shows every Loyalty Leap business that has your mobile number in their programme. Each shop has its own stamp count and rewards — they are completely separate.

**Switching between shops**

Tap any shop in your Shops list to see:
- Your current stamp count for that shop
- Available rewards
- Your stamp history at that shop

**Adding a new shop**

Earn your first stamp at a new shop (by scanning their QR code or giving your number at the till) and it will appear in your Shops list automatically.
    `.trim(),
  },
  {
    id: "app-linking",
    title: "Downloading the app and linking your account",
    content: `
**If a shop already has your number**

A staff member may have added your details before you downloaded the app. When you sign up with the same mobile number:
1. Your existing stamp history links to your new account automatically.
2. You will see a **Welcome back!** banner on your dashboard.
3. The shop appears in your Shops list with your existing stamp count.

**Why use the app?**

- Scan QR codes at the till without giving your number every time.
- See your stamp counts and rewards at a glance.
- Track your activity across all shops.
- Receive birthday rewards without reminding staff.

**Signing up**

1. Open the Loyalty Leap app and tap **Sign up**.
2. Enter your South African mobile number, a name, and a password.
3. Your account is created and any existing stamp history is linked.

Use the **same mobile number** the shop has on file, otherwise linking will not happen automatically.
    `.trim(),
  },
  {
    id: "privacy",
    title: "Privacy and your data",
    content: `
**What is stored**

Loyalty Leap stores:
- Your name and South African mobile number
- Optional: email address, birthday month/day, birth year
- Your stamp and redemption history (date, shop, type)
- Whether you have opted in to marketing communications

**Who can see your data**

The business that added you can see your name, phone number, stamp count, visit history and birthday. Loyalty Leap staff can also access this data to operate the service.

Your data is not sold or shared with other businesses or third parties.

**POPIA**

Loyalty Leap complies with the Protection of Personal Information Act (POPIA). Your data is collected with your consent and used only for operating the loyalty programme.

**Requesting removal**

To have your data removed from a shop's programme, ask the business owner directly. To have your account deleted entirely, contact Loyalty Leap at [lgubevu@gmail.com](mailto:lgubevu@gmail.com?subject=Delete%20my%20Loyalty%20Leap%20account).
    `.trim(),
  },
];
