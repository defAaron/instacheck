# Instacheck

Lists Instagram accounts **you follow who don't follow you back**, using your official Instagram data export. No login, scraping, or API keys.

Works for **private and public** accounts the same way — Meta includes your followers/following in your own data download either way.

The **web app** is the primary way to use Instacheck. It runs entirely in your browser: the export never leaves your device. A Python CLI is still available for terminal use.

## 1. Download your Instagram data

1. In the Instagram app or [accountscenter.instagram.com](https://accountscenter.instagram.com/): **Settings → Your activity → Download your information** (wording may vary slightly).
2. Choose **JSON** (not HTML).
3. Include **Followers and following** (or download your full information).
4. Submit the request and wait for the email/notification (can take minutes to days).
5. Download the archive. You can drop the ZIP as-is, or unzip it.

You should end up with something like:

```text
.../connections/followers_and_following/following.json
.../connections/followers_and_following/followers_1.json
```

## 2. Web app

```bash
cd web
npm install
npm run dev
```

Open the local URL, optionally enter your handle, and drop the ZIP, the `followers_and_following` folder, or the JSON files.

The results page includes search, Instagram profile links, copy, and a `.txt` download. Extra lists (fans, pending requests, recently unfollowed, close friends, blocked) appear when those files are in the export.

```bash
npm test
npm run build
```

## 3. CLI

Requires Python 3.9+.

```bash
python3 nonfollowers.py
```

You'll be prompted for your Instagram handle and the path to the unzipped export folder.

Or pass flags:

```bash
python3 nonfollowers.py \
  --handle yourname \
  --export ~/Downloads/instagram-yourname-YYYY-MM-DD \
  --out not-following-back.txt
```

You can point `--export` at either the unzipped export root or the `followers_and_following` folder inside it.

Prints a count, then one username per line. Interactively, you can save to `@yourname-not-following-back.txt`.

## Notes

- This only works for **your** export — not other people's accounts.
- If you only see HTML files, request a new download in **JSON**.
- Results reflect the export snapshot, not live Instagram.
- The web app does not upload your export. Reload the page and the data is gone.
