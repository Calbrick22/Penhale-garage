# What's changed on the Penhale Garage website

This is a plain-English summary of the new website. The wording on your pages (services, prices, opening hours, contact details and legal text) has been kept as it was. What's changed is the look, the layout and how the site works.

## The big changes

**Calling you is the first thing people see.**
Most customers book by phone, so the home page now opens with your number in large type, a "Call now" button and the garage address. It also shows whether you're **open right now** (for example "Open now, until 18:00"), based on your opening hours. On phones, a bar with **Call**, **Email** and **Directions** stays at the bottom of the screen on every page.

**Prices are easy to find.**
The home page lists all seven services with their prices, where the old site had them: MOT, servicing from £120, diagnostics £25 + VAT, wheel alignment, tyres, repairs and recovery. Each service page has a "Book your car in" box with the price beside the text.

**A broken booking link is fixed.**
Every page had a "Book an appointment" link that went to an error page. It now goes to the contact page.

**Simpler menus.**
The menu is now *Services*, *Areas we cover*, *Contact* and a *Call* button. It works with a mouse, a finger or a keyboard.

**Same brand, cleaner look.**
Your logo, the Penhale navy and blue colours and the Montserrat headline font are all kept. Body text uses a clearer reading font (Source Sans 3), and buttons are larger so they're easy to tap. One new colour, amber, is used only for the "Call" buttons so they stand out.

**Much faster.**
The old home page downloaded about 1.75 MB and 68 files, including almost 0.5 MB of code. The new one is about 0.5 MB and 18 files, with 9 KB of code. On a slow phone connection the main content appears in under a second in our tests.

**Easier for everyone to use.**
The site was built and checked against the WCAG 2.2 AA accessibility standard:
- strong colour contrast
- every image described for screen readers
- every form field labelled
- everything works with a keyboard
- animation turned off for people who've asked their device to reduce motion

**Better for Google.**
Every page keeps its old web address, so your search rankings aren't lost. Each page has a proper title, description, heading order and preview image for when it's shared on Facebook or WhatsApp. The home and contact pages tell Google your business details (address, phone, hours, areas served) in a format it understands.

**Cookies handled properly.**
The old site switched on Google tracking *before* visitors agreed to cookies. Now Google Analytics and Google Tag Manager only start once a visitor clicks "Accept analytics", as UK law requires. Visitors can change their mind using "Manage cookie settings" at the bottom of every page.

**The Google map loads on request.**
On the contact page, the map appears when someone clicks "Show map". This keeps the page fast and avoids Google cookies until the visitor chooses.

**The contact form has been rebuilt.**
The old form only worked inside WordPress. The new form sends messages to **penhalegarage@outlook.com**. Your web host needs to switch it on (instructions are in README-HOSTING.md). If a message can't be sent, the visitor is told and given your phone number instead.

**Small fixes.**
- The tyres page title said "Filly Fitted". It now says "Fully Fitted".
- Page headings are now in a logical order.
- On the home page, the "Why choose us" section now sits beside real photos of your workshop, reception and waiting area.
- The RAC, RMI, Trust My Garage and VOSA badges now appear on every page.

## Things we need you to confirm before going live

These show as small red **[TO CONFIRM]** labels on the pages. Please check each one and tell us the correct answer.

| # | Question | Where | What the old site said |
|---|---|---|---|
| 1 | **MOT price.** Is it £54.85 or £45? | MOT page, home page price list | The page said "£54.85 including tax". The Google description said "£45 inc VAT". We've used £54.85 and left the price out of the Google description until you confirm. |
| 2 | **Wheel alignment price.** Is it £65 including VAT, or £35 + VAT? | Wheel alignment page, home price list | The page said "£65 including VAT". The page title said "£35 + VAT". We've used £65 and left the price out of the title until you confirm. |
| 3 | **Saturday hours.** Closed, or 09:00 – 13:00? | Opening hours on every page | Most pages said "Closed". The contact page said "09:00 - 13:00". Both are shown for now. On Saturdays the "open now" message says "please call to check". |
| 4 | **Copyright line in the footer.** | Footer of every page | The old footer said "© 2023 - Search4local Ltd … content owned by us and our client". We've put "© Penhale Garage". |

## Decisions and loose ends

1. **Who owns the words and photos?** The old site was made by Search4Local, and their footer says they share ownership of the content, including images. Please check your agreement with them before the new site goes live. Most of the photos on the service pages look like stock photos that Search4Local may have licensed.
2. **The privacy policy names Search4Local** as the company that hosts the site and handles personal data (customerservices@search4local.co.uk, 0330 024 0999). It's been kept word for word. If you move host, it needs updating.
3. **The cookie policy is out of date.** It lists cookies from WordPress, Elementor, Complianz and iThemes Security, which the new site doesn't use. It's been kept word for word for now. It should be updated to list only Google Analytics and Google Tag Manager.
4. **Old Google Analytics.** The tracking code (UA-110876202-49) is the old type that Google switched off in July 2023, so it isn't collecting anything. It's been kept as found. We'd suggest replacing it with a current Google Analytics 4 code if you want visitor statistics.
5. **"VOSA".** The MOT testing agency has been called DVSA since 2014. The wording "VOSA" has been kept as it was. Tell us if you'd like it updated.
6. **The "Air Conditioning" page** didn't exist on the old site (it just redirected to the home page). Air conditioning is still listed under Repairs. If you'd like a proper page for it, send us the details.
7. **"We offer courtesy cars too!"** appears on the contact page, as before. Please confirm this is still true.
8. **The location pages** (St Columb, Summercourt, Roche, St Stephen, Newquay) are almost identical to each other. Google may treat them as duplicates. A sentence or two that's specific to each town (distance, the route from there) would help.

## Photos we'd like from you

The five real photos of your garage are very small on the old site (about 150–330 pixels wide), so they look soft. Larger versions would make a big difference. The full list, with the sizes needed, is in `images/IMAGE-MANIFEST.csv`. The most useful would be:

- the front of the workshop
- the workshop inside
- reception and the waiting area
- your recovery truck
- the MOT bay

Any phone photo taken in good light will do.

The picture shown when the site is shared on social media is a temporary design (logo on navy). It should be replaced with a good photo of the garage, 1200 × 630 pixels.

## Pages

Every page from the old site is included at the same address:

- Home
- MOT
- Servicing
- Repairs
- Diagnostics
- Tyres
- Laser Wheel Alignment
- Breakdown Recovery
- Contact
- Five "Car Garage Near…" area pages
- Cookie & Privacy Policy
- Cookie Policy (UK)

There's also a new, friendly "page not found" page.
