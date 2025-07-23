from playwright.sync_api import sync_playwright
from time import sleep
import random
from detail_scraper import get_detail_info
from data_cleaner import clean_listing_data
from utils import deduplicate, respectful_delay

BASE_URL = "https://www.bbb.org"

def scrape_medical_billing_listings(start_url):
    listings = []
    seen_keys = set()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(user_agent="Mozilla/5.0")
        page = context.new_page()

        for page_num in range(1, 3):
            url = f"{start_url}&page={page_num}"
            print(f"Fetching: {url}")
            page.goto(url, timeout=10000) # maximum 10 seconds for the page load
            
            try:
                print("Waiting for company cards to appear...")
                page.wait_for_selector('.result-card', timeout=5000)
            except:
                print(f"No listings found on page {page_num}")
                break


            company_cards = page.query_selector_all('.card.result-card')
            if not company_cards:
                print(f"No listings found on page {page_num}")
                break

            for card in company_cards:
                try:
                    name = card.query_selector('h3.result-business-name a').inner_text().strip()
                    print(f"Current scraping company: {name}")
                    relative_url = card.query_selector('h3.result-business-name a').get_attribute('href')
                    url = BASE_URL + relative_url
                    phone_elem = card.query_selector('a[href^="tel:"]')
                    phone = phone_elem.inner_text().strip() if phone_elem else None
                    address_elem = card.query_selector('p.text-size-5.text-gray-70')
                    address = address_elem.inner_text().strip() if address_elem else None
                    accreditation_img = card.query_selector('img[alt="Accredited Business"]')
                    accreditation = "Accredited" if accreditation_img else "Not Accredited"
                    detail_info = get_detail_info(context, url)

                    item = {
                        "name": name,
                        "url": url,
                        "phone": phone,
                        "address": address,
                        "accreditation": accreditation,
                        "principal_contact": detail_info.get("principal_contact", None)
                    }

                    cleaned = clean_listing_data(item)
                    if deduplicate(cleaned, seen_keys):
                        listings.append(cleaned)

                except Exception as e:
                    print(f"Error scraping card: {e}")

            respectful_delay()
        
        browser.close()

    return listings
