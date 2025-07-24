import { NextRequest, NextResponse } from 'next/server';
import { Stagehand } from '@browserbasehq/stagehand';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { runPythonScraper } from '@/lib/runPythonScraper';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const instructions = {
  businesses: 'Extract each result card listing with its result business name, phone number, principal contact, address, accreditation, and URL.',
  books: 'Extract each book with its name, price, star-rating, and instock availability from the search results.',
};

const csvFileNames = {
  businesses: 'BBB_scraper_output.csv',
  books: 'books_scraper_output.csv',
};

const tableNames = {
  businesses: 'businesses',
  books: 'books',
};

const schemas = {
  businesses: z.object({
    items: z.array(
      z.object({
        name: z.string(),
        phone: z.string().optional(),
        principal_contact: z.string().optional(),
        address: z.string().optional(),
        accreditation: z.string().optional(),
        url: z.string().optional(),
      })
    ),
  }),
  books: z.object({
    items: z.array(
      z.object({
        name: z.string(),
        price: z.string(),
        star_rating: z.string().optional(),
        instock_availability: z.string().optional(),
      })
    ),
  }),
};

export async function POST(req: NextRequest) {
  const { url, type } = await req.json();

  if (!url || typeof url !== 'string' || !(type in instructions)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const instruction = instructions[type as keyof typeof instructions];
  const outputFile = path.resolve(process.cwd(), '../data', csvFileNames[type as keyof typeof csvFileNames]);
  const table = tableNames[type as keyof typeof tableNames];
  const schema = schemas[type as keyof typeof schemas];

  const stagehand = new Stagehand({
    env: 'BROWSERBASE',
    // modelName: "gpt-40-mini",
    // modelClientOptions: {
    //   apiKey: process.env.OPENAI_API_KEY,
    // },
    apiKey: process.env.BROWSERBASE_API_KEY!,
    projectId: process.env.BROWSERBASE_PROJECT_ID!,

    verbose: 1,
  });

  try {
    await stagehand.init();
    const page = stagehand.page;
    const allResults: any[] = [];

    if (type === 'books') {
      // Loop through books.toscrape.com catalogue pages 1–3
      for (let i = 1; i <= 3; i++) {
        const pageUrl = `https://books.toscrape.com/catalogue/page-${i}.html`;
        await page.goto(pageUrl, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        const result = await page.extract({ instruction, schema });
        if (result.items?.length) {
          allResults.push(...result.items);
        } else {
          console.warn(`No items found on book page ${i}`);
        }
      }
    } else if (type === 'businesses') {
      // Just go to the user-provided business URL
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);

      const result = await page.extract({ instruction, schema });
      if (result.items?.length) {
        allResults.push(...result.items);
      } else {
        console.warn('No items found on business page');
      }
    }

    if (allResults.length > 0) {
      await supabaseAdmin.rpc('truncate_table', { table_name: table });
      const { error } = await supabaseAdmin.from(table).insert(allResults);
      if (error) throw error;

      return NextResponse.json({
        success: true,
        source: 'stagehand',
        count: allResults.length,
      });
    }

    console.warn('Stagehand returned no results, falling back to Python scraper...');
  } catch (err) {
    console.warn('Stagehand failed or returned nothing:', err);
  } finally {
    await stagehand.close();
  }

  // Fallback to Python scraper
  try {
    await runPythonScraper(url, outputFile);

    const rows: Record<string, any>[] = [];
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(outputFile)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    await supabaseAdmin.rpc('truncate_table', { table_name: table });
    const { error } = await supabaseAdmin.from(table).insert(rows);
    if (error) throw error;

    return NextResponse.json({
      success: true,
      source: 'python',
      count: rows.length,
    });
  } catch (err) {
    console.error('Python fallback failed:', err);
    return NextResponse.json({ success: false, error: 'Scraping failed.' }, { status: 500 });
  }
}








