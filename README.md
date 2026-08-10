# Instacheck

CLI that lists Instagram accounts **you follow who don't follow you back**, using your official Instagram data export. No login, scraping, or API keys.

Works for **private and public** accounts the same way — Meta includes your followers/following in your own data download either way.

## 1. Download your Instagram data

1. In the Instagram app or [accountscenter.instagram.com](https://accountscenter.instagram.com/): **Settings → Your activity → Download your information** (wording may vary slightly).
2. Choose **JSON** (not HTML).
3. Include **Followers and following** (or download your full information).
4. Submit the request and wait for the email/notification (can take minutes to days).
5. Download and unzip the archive.

You should end up with something like:

```text
.../connections/followers_and_following/following.json
.../connections/followers_and_following/followers_1.json
```

## 2. Run the CLI

Requires Python 3.9+.

```bash
cd /path/to/instacheck
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

## Output

Prints a count, then one username per line. Interactively, you can save to `@yourname-not-following-back.txt`.

## Notes

- This only works for **your** export — not other people's accounts.
- If you only see HTML files, request a new download in **JSON**.
- Results reflect the export snapshot, not live Instagram.
