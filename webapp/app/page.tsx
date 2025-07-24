import ScraperForm from './components/ScraperForm';

export default function Home() {
  return (
    <main className="flex flex-col gap-10">
      <ScraperForm type="books" title="Books Scraper" />
      <ScraperForm type="businesses" title="BBB Scraper" />
    </main>
  );
}

