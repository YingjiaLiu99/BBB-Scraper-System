# BBB-Playwright-Scraper-Module

This Python-based web scraper uses [Playwright](https://playwright.dev/python/) to collect listings of **A-rated Medical Billing companies** from the [Better Business Bureau](https://www.bbb.org) (BBB) website. The scraper gathers listing data from paginated search results and then visits each company’s detail page to extract deeper contact information.

---

##  Method Overview

- **Pagination**: Scrapes up to 15 pages of BBB search results.
- **Company Listings**: Extracts name, phone, address, accreditation status, and company URL.
- **Detail Page Scraping**: Visits each listing’s detail page to extract the principal contact name (if available).
- **Deduplication**: Ensures unique listings using hashed keys.
- **Polite Scraping**: Adds random delays between requests (2–3.5 seconds per page).
- **Export**: Saves the final data to a CSV file.

 **Note**: The full scrape (15 pages) may take **12 to 15 minutes**, as the script is designed to scrape respectfully.  
In order to make the test more smooth, I set the default scrape page range only from page 1 to page 2. You can always 
change it back to full scrape(15 pages) if you prefer.
To test on a full page scrape, you can edit the following line in [`/scraper/bbb_scraper.py`](./scraper/bbb_scraper.py):

```python
for page_num in range(1, 16):
```

Change `3` to number `16` to scrape 15 pages.

---

## 📁 Project Structure

```
BBB-Scraper-System/
data/                          # Where your result .csv file will be
scraper/
    ├── main.py                # CLI entry point
    ├── bbb_scraper.py         # Core scraping logic (listings)
    ├── detail_scraper.py      # Logic for scraping detail pages
    ├── data_cleaner.py        # Field-level cleaning and phone formatting
    ├── exporter.py            # CSV export utility
    ├── utils.py               # Deduplication and delay logic
    ├── data/                  # Output CSVs stored here
    └── README.md              
```

---

## How to Run

### 1. Setup Python Virtual Environment

From the root folder `BBB-Scraper-System`, run:

```bash
python3 -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
pip install -r requirements.txt
playwright install
```

### 2. Run the Scraper

To solely test this module and run the scraper and export results to `/data/BBB_scraper_output.csv`:

```bash
python main.py --url "https://www.bbb.org/search?filter_category=60548-100&filter_category=60142-000&filter_ratings=A&find_country=USA&find_text=Medical+Billing" --out data/BBB_scraper_output.csv
```

---

## ✅ Reproduction Instructions

- Clone this repo
- Ensure Python is installed
- Setup virtual environment and dependencies as described above
- Use a valid BBB search URL

---

## Example Output

Each CSV row includes:

| name           | phone           | principal_contact | url             | address              | accreditation   |
|----------------|------------------|--------------------|------------------|-----------------------|-----------------|
| Acme Billing Co | +13125551234     | Jane Doe           | https://...      | 123 Main St, Chicago  | Accredited      |

---

## Issues Encountered

None currently reported. The scraper has been tested across multiple BBB result pages with stable performance.

---

## Notes

- The scraper is **headless** and polite to the server using randomized delays.
- Fields like `phone` or `principal_contact` will be stored as `"N/A"` if not found.
- Make sure your environment has network access to `bbb.org`.
