import argparse
from bbb_scraper import scrape_medical_billing_listings
from exporter import export_to_csv

def main():
    parser = argparse.ArgumentParser(description="Scrape BBB A-rated Medical Billing listings")
    parser.add_argument('--url', required=True, help='Starting BBB search URL')
    parser.add_argument('--out', required=True, help='Path to output CSV file')

    args = parser.parse_args()

    print(f"Scraping: {args.url}")
    data = scrape_medical_billing_listings(args.url)

    export_to_csv(data, args.out)

if __name__ == '__main__':
    main()
