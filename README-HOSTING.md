# Penhale Garage website – hosting instructions

This package is a complete **static website** for **penhalegarage.co.uk**. It replaces the current WordPress / Elementor site (currently hosted and maintained by Search4Local).

It's plain HTML, CSS and a little JavaScript. There's no database, no CMS and no build step. The only server-side part is a small PHP script for the contact form.

---

## 1. What's in the package

```
index.html                     Home page
mot/index.html                 /mot/
car-servicing/index.html       /car-servicing/
car-repairs/index.html         /car-repairs/
car-diagnostics/index.html     /car-diagnostics/
tyres/index.html               /tyres/
wheel-alignment/index.html     /wheel-alignment/
breakdown-recovery/index.html  /breakdown-recovery/
contact-us/index.html          /contact-us/  (contact form)
contact-us/car-garage-near-st-columb/index.html
contact-us/car-garage-near-summercourt/index.html
contact-us/car-garage-near-roche/index.html
contact-us/car-garage-st-stephen/index.html
contact-us/car-garage-near-newquay/index.html
cookie-privacy-policy/index.html
cookie-policy-uk/index.html
404.html                       Custom "page not found" page
contact.php                    Contact form handler (needs PHP)
sitemap.xml, robots.txt
css/styles.css                 All styles
js/main.js                     All scripts (menu, opening status, cookie consent, form, map)
fonts/                         Self-hosted fonts (Montserrat, Source Sans 3) + licences
images/                        All images + IMAGE-MANIFEST.csv
README-HOSTING.md, CHANGES.md  Documentation (safe to upload or leave out)
```

Every existing page keeps **exactly the same URL**, because each page is a folder containing `index.html`.

## 2. Server requirements

- Any standard web server: Apache, LiteSpeed, Nginx or IIS. Shared hosting is fine.
- **HTTPS** with a valid certificate.
- **PHP 7.4 or newer with working `mail()`**, for the contact form only. Without PHP, see section 6.
- `index.html` set as a directory index. This is the default almost everywhere.

## 3. Back up the current site first

Do this before changing anything.

1. **Full account backup.** If you have cPanel or Plesk, make a full backup and download it.
2. **Files.** Download everything in the web root (usually `public_html/`), especially `wp-content/` and `.htaccess`.
3. **Database.** Export the WordPress database as a `.sql` file (phpMyAdmin → Export, or `wp db export`).
4. **Record the current settings:** DNS records, SSL certificate details, and any redirects in `.htaccess`.
5. Keep the backup somewhere other than the server.

> The current privacy policy says the site is "hosted and maintained by Search4Local Ltd". If Search4Local hosts the site, ask them for the backup and to confirm who controls the domain name and DNS before you start.

## 4. Upload

1. In the web root, move the old WordPress files into a folder **outside** the public web root (for example `~/old-wordpress-2026/`). Don't delete them yet.
   - WordPress's `index.php` and `.htaccess` must not stay in the web root. On many servers `index.php` takes priority over `index.html`, and WordPress's rewrite rules would intercept every URL.
2. Upload the **contents** of this package to the web root, keeping the folder structure. `index.html` must sit directly in the web root.
3. You don't need to upload `README-HOSTING.md`, `CHANGES.md` or `images/IMAGE-MANIFEST.csv`. They're harmless if you do.
4. File permissions: folders `755`, files `644`.

The site uses relative links, so it also works from a sub-folder or from a local folder for previewing. **Exception:** `404.html` uses root-relative links (`/css/…`, `/mot/`), because it can be shown at any URL depth. It's designed for the site to live at the domain root.

## 5. Redirects and server settings

Two old URLs have no page of their own:

| Old URL | Redirect to | Why |
|---|---|---|
| `/air-conditioning/` | `/` | Already redirects to the home page on the old site; it was still listed in the old sitemap |
| `/appointments/` | `/contact-us/` | Was the "Book an appointment" link on every page but returned **404 Page Not Found** |
| `/sitemap_index.xml`, `/page-sitemap.xml` | `/sitemap.xml` | Old Yoast sitemap addresses already submitted to Google |
| `/wp-sitemap.xml` | `/sitemap.xml` | Old WordPress core sitemap address |

### Apache / LiteSpeed (`.htaccess` in the web root)

```apache
# Custom 404 page
ErrorDocument 404 /404.html

# Force HTTPS and the non-www address
RewriteEngine On
RewriteCond %{HTTPS} off [OR]
RewriteCond %{HTTP_HOST} ^www\. [NC]
RewriteRule ^ https://penhalegarage.co.uk%{REQUEST_URI} [L,R=301]

# 301 redirects from old URLs
RewriteRule ^air-conditioning/?$ / [L,R=301]
RewriteRule ^appointments/?$ /contact-us/ [L,R=301]
RewriteRule ^(sitemap_index|page-sitemap|wp-sitemap)\.xml$ /sitemap.xml [L,R=301]

# Old WordPress feed and admin addresses
RewriteRule ^(feed|comments/feed)/?$ / [L,R=301]
RewriteRule ^(wp-admin|wp-login\.php|xmlrpc\.php) - [G]

# Compression and caching (optional but recommended)
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript image/svg+xml application/xml text/plain
</IfModule>
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 month"
  ExpiresByType image/png "access plus 1 month"
  ExpiresByType image/svg+xml "access plus 1 month"
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>
```

### Nginx (inside the `server { }` block)

```nginx
error_page 404 /404.html;
location = /air-conditioning/ { return 301 /; }
location = /air-conditioning  { return 301 /; }
location = /appointments/     { return 301 /contact-us/; }
location = /appointments      { return 301 /contact-us/; }
location ~ ^/(sitemap_index|page-sitemap|wp-sitemap)\.xml$ { return 301 /sitemap.xml; }
location ~ \.php$ { include fastcgi_params; fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; fastcgi_pass unix:/run/php/php-fpm.sock; } # adjust socket
location ~* \.(css|js|woff2|jpg|png|svg)$ { expires 30d; }
```

Old image addresses under `/wp-content/uploads/…` will return 404 once WordPress is gone. That's normal. If Google Images traffic matters, you can redirect `^wp-content/uploads/` to `/`.

## 6. Contact form

The old form was an Elementor Pro form that only works inside WordPress. It has been replaced by **`contact.php`**:

- The form on `/contact-us/` posts to `/contact.php`.
- `contact.php` checks the fields and emails the message to **penhalegarage@outlook.com**. The visitor's email is set as Reply-To, so the garage can just press Reply.
- Spam protection is a hidden "honeypot" field plus a minimum fill-in time. Google reCAPTCHA (used on the old site) has been removed, because its keys belong to the old WordPress install.
- With JavaScript on, the visitor sees "Message sent" or a clear error on the page. Without JavaScript, they're redirected to `/contact-us/?sent=1`, or shown an error page.
- If sending fails, the visitor is told it didn't send and given the phone number and email address. The form never pretends to have sent.

**What the host needs to do:**

1. Check PHP `mail()` works on the server, or configure the server's sendmail or SMTP relay.
2. At the top of `contact.php`, set `$FROM_ADDRESS` to an address on a domain the server is allowed to send for. The default is `website@penhalegarage.co.uk`. Make sure the domain's **SPF** (and ideally **DKIM**) records allow the server to send, or Outlook may put the messages in junk.
3. **Test it:** send a message from the live site and confirm it arrives at penhalegarage@outlook.com, including the junk folder.

**If the host has no PHP:** don't leave the form as it is. Either replace the form block in `contact-us/index.html` with a note to call or email, or point its `action` at a third-party form service. A third-party service is a new data processor, so the privacy policy would need updating.

When the site is opened from a local folder (`file://`), the form shows a notice that it only sends once uploaded. That's expected.

## 7. Analytics, tracking and embeds

These are **kept exactly as found** on the old site:

| Item | ID / address | Notes |
|---|---|---|
| Google Tag Manager | `GTM-KFRXPGQN` | Loaded from `js/main.js` |
| Google Analytics (Universal Analytics, gtag.js) | `UA-110876202-49` | Google stopped processing UA data in July 2023, so it collects nothing. Kept as instructed; can be removed or replaced with a GA4 ID. |
| Google Maps embed | `maps.google.com/maps?q=Penhale%20Garage…` | On `/contact-us/` only. Now loads when the visitor clicks "Show map". |
| Facebook page link | `facebook.com/profile.php?id=61579715302072` | Plain link, no Facebook scripts |

**What changed:** on the old site, GTM and Analytics loaded **before** visitors gave consent. Complianz was installed but the tags weren't blocked. Now they only load after the visitor clicks "Accept analytics" in the cookie banner, which UK PECR requires. The choice is stored in the visitor's browser (`localStorage`, key `pg-consent`). "Manage cookie settings" in the footer reopens the banner.

The GTM `<noscript>` fallback iframe hasn't been included, because it would bypass consent.

No new trackers have been added.

## 8. DNS and SSL

- **Staying with the same host:** no DNS change is needed. Just swap the files.
- **Moving to a new host:**
  1. Lower the DNS TTL on the `A`/`AAAA` and `www` records to 300 seconds a day before the move.
  2. Set up the site and an SSL certificate on the new host first (e.g. Let's Encrypt). Test it using a temporary URL or a hosts-file entry.
  3. Point the `A` record (and `www` `CNAME`/`A`) at the new server.
  4. **Don't change the MX records.** The garage's email is on Outlook.com, but check for any other mail records before editing DNS.
  5. Keep the old hosting active for at least a week in case you need to roll back.
- Find out who the domain registrar is and who holds the login. It may be Search4Local.

## 9. Rolling back

1. Move the new static files out of the web root into a folder.
2. Move the WordPress files from `~/old-wordpress-2026/` back into the web root, including WordPress's `.htaccess`.
3. If the database was changed or removed, re-import the `.sql` backup.
4. If DNS was changed, point the records back to the old server. That's why the TTL was lowered.

## 10. After launch

- [ ] Visit every page in the sitemap and click through the menus on a phone.
- [ ] Send a test message through the contact form and confirm it arrives.
- [ ] Check `/air-conditioning/`, `/appointments/` and `/sitemap_index.xml` redirect, and that a made-up URL shows the 404 page.
- [ ] Submit `https://penhalegarage.co.uk/sitemap.xml` in Google Search Console.
- [ ] Accept cookies once and check GTM fires (GTM Preview mode).
- [ ] Resolve every **[TO CONFIRM]** item listed in `CHANGES.md`. They show as red labels on the pages.
