# BBB-Scraper-System (Part B & C)

This project builds on **Part A** (Python-based Playwright scraper, you can find its README.md in its own folder) and adds two major components:

- **Part B: Stagehand Automation Module** — Wrap the scraper for AI-assisted Stagehand usage.
- **Part C: Full-stack Web Application** — GUI + Supabase database integration built in Next.js.


##  Design Rationale: Why Two Scrapers?
The reason for including a second scraper for the Books to Scrape website is to demonstrate the Stagehand-native, AI-assisted scraping capability.

While Stagehand works well on well-structured websites, it fails to extract data reliably from the BBB website. This is because:

The HTML/DOM structure of BBB is poorly tagged and lacks semantic clarity

There is no accessibility tree available for elements

Even with detailed natural-language instructions, Stagehand is unable to target and extract the correct content from BBB website

As a result:

The BBB data is extracted using Part A’s Python-based Playwright scraper as a fallback mechanism

The Books data is extracted entirely using Stagehand’s native approach, as the site is well-labeled and structurally clean

I Hope this hybrid setup still allows the project to demonstrate my understanding of Stagehand’s native integration and ensure robustness by falling back to a traditional scraper when necessary


## Part B: Stagehand Automation Module

### Goal
Enable the scraping process to be performed **programmatically via Stagehand**, a browser automation platform that integrates LLMs to control headless browsers.

---

### Key Files

- **`webapp/app/api/scrape/route.ts`**  
  Backend API route that:
  - Accepts `{ url, type }` from the frontend
  - Uses Stagehand’s AI-assisted `.goto()` and `.extract()` with schemas/instructions
  - Stores results to Supabase (current LLM model used: GPT-4o-mini)
  - Falls back to Part A's Python scraper if needed

- **`lib/runPythonScraper.ts`**  
  Runs the Python scraper from Part A via Node.js's `child_process.spawn()`  
  Ensures compatibility between the TS API and Python module.

---

### Prompt Format

In `route.ts`, we define the scraping prompts for Stagehand:

```ts
const instructions = {
  businesses: 'Extract each result card listing with its result business name, phone number, principal contact, address, accreditation, and URL.',
  books: 'Extract each book with its name, price, star-rating, and instock availability from the search results.',
};
```

These are paired with a `zod` schema for structured extraction using:

```ts
await page.extract({ instruction, schema });
```

---

### Example Invocation (via frontend)

1. User enters a BBB or Books URL on the frontend form
2. It posts to `/api/scrape` with `{ url, type }`
3. The backend runs Stagehand and writes output to Supabase
4. If Stagehand fails, Python scraper runs and fills the same DB

---

### Output Format

All extracted results follow a schema like:

```json
[
  {
    "name": "Acme Billing Co",
    "phone": "+13125551234",
    "principal_contact": "Jane Doe",
    "address": "123 Main St, Chicago",
    "accreditation": "Accredited",
    "url": "https://www.bbb.org/..."
  }
]
```

---

## Part C: Web App + Supabase Integration

### Goal

Create a **minimal web UI** to:
- Submit a target URL
- View scraping results (live from Supabase)
- Download results as CSV

---

### Tech Stack

- **Frontend**: React (Next.js 14 app dir)
- **Backend**: API route at `/api/scrape`
- **Database**: Supabase
- **AI-powered scraping** via Stagehand
- **Fallback Scraper** scraping via Python Playwright

---

### Key Files

#### `components/ScraperForm.tsx`

UI form that:
- Lets user submit a URL
- Displays results from Supabase in a table
- Allows CSV download of results

 It handles both:
- `type = 'businesses'` (BBB)
- `type = 'books'` (books.toscrape.com)

Frontend logic calls the `/api/scrape` backend and waits for the Supabase table to update.

#### `utils/csv.ts`

Converts array of objects → CSV using `papaparse` and triggers download in browser.

---

### UI Screenshots

**Initial View:**

![Initial Form](/webapp/public/pic1.jpg)

**After Scraping + Table Rendered:**

![After scraper](/webapp/public/pic2.jpg)

---

### How to Run and Test Locally

1. **Create `.env` file** in the project root  
   Include your `BROWSERBASE_API_KEY`, `PROJECT_ID`, and Supabase credentials.

2. **Install Python virtual environment** (Part A requirement)

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install
```

3. **Install Next.js dependencies & start dev server**

```bash
cd webapp
npm install
npm run dev
```

Then open: [http://localhost:3000](http://localhost:3000)

Note: the book scraper will take ~ 4min to finish.  The shorten BBB scraper will take ~5min to finish, both progress indiction will be logged to console.

---

## Summary of Features

| Feature                        | Status |
|-------------------------------|--------|
| Stagehand scraping module     | ✅     |
| Python fallback scraper       | ✅     |
| Supabase storage              | ✅     |
| Frontend form + results table | ✅     |
| CSV download button           | ✅     |

---

## Notes

- The full BBB scrape (15 pages) takes ~12–15 mins due to respectful delays.
- You can change the scrape amount by editing this line in `bbb_scraper.py`:

```python
for page_num in range(1, 16):  # change to e.g. range(1, 3)
```
