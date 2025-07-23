from playwright.sync_api import BrowserContext
from time import sleep
import random

def get_detail_info(context: BrowserContext, url: str) -> dict:
    """
    Visit a BBB company profile page and extract detailed info
    like principal_contact.
    
    Args:
        context: The browser context from Playwright (used to create new pages)
        url: The URL of the company detail page

    Returns:
        A dictionary with fields like principal_contact
    """
    result = {}

    try:
        page = context.new_page()
        page.goto(url, timeout=60000)
        page.wait_for_timeout(3000)  # Wait for JavaScript content to load

        # Principal contact selector:
        # Usually inside a section labeled "Business Details" or similar
        contact_element = page.query_selector("text=Principal Contact")
        if contact_element:
            # Look for the next sibling or following element
            possible_name = contact_element.evaluate("el => el.nextElementSibling?.innerText || ''")
            if possible_name:
                result["principal_contact"] = possible_name.strip()

        # Add optional politeness delay
        sleep(random.uniform(1, 2))

    except Exception as e:
        print(f"Error visiting detail page {url}: {e}")
    finally:
        page.close()

    return result
