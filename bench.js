const { Bench } = require("tinybench");
const jsdom = require("jsdom");
const cheerio = require("cheerio");
const htmlparser2 = require("htmlparser2");
const { parse: nodeHtmlParse } = require("node-html-parser");
const HtmlParser = require("./HtmlParser.js"); // this one

const { JSDOM } = jsdom;

async function runBenchmark() {
    let pagenum = 5;

    console.log(`Fetching sample data (${pagenum} pages)...`);
    
    // Fetch pagenum pages
    const pages = [];
    for (let i = 1; i <= pagenum; i++) {
        const res = await fetch(`https://hianime.to/az-list?page=${i}`);
        pages.push(await res.text());
        console.log(`  Page ${i}: ${(pages[i-1].length / 1024).toFixed(2)} KB`);
    }
    console.log();

    const results = {
        "htmlfunc (Regex)": [],
        "jsdom": [],
        "cheerio": [],
        "node-html-parser": [],
        "htmlparser2": []
    };

    // Test each page separately
    for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
        const html = pages[pageIdx];
        console.log(`Testing Page ${pageIdx + 1}...`);

        const bench = new Bench({ time: 1000 }); // Run each for 1 second

        // 1. YOUR REGEX PARSER
        bench.add("htmlfunc (Regex)", () => {
            const items = HtmlParser.getByClass(html, "flw-item");
            items.map(item => ({
                id: HtmlParser.getAttr(HtmlParser.querySelector(item, ".film-poster-ahref") || "", "data-id"),
                title: HtmlParser.getText(HtmlParser.querySelector(item, ".film-name") || ""),
                img: HtmlParser.getAttr(HtmlParser.querySelector(item, ".film-poster-img") || "", "src")
            }));
        });

        // 2. JSDOM
        bench.add("jsdom", () => {
            const dom = new JSDOM(html);
            const doc = dom.window.document;
            const items = Array.from(doc.querySelectorAll(".flw-item"));
            items.map(item => ({
                id: item.querySelector(".film-poster-ahref")?.getAttribute("data-id"),
                title: item.querySelector(".film-name")?.textContent.trim(),
                img: item.querySelector(".film-poster-img")?.getAttribute("src")
            }));
        });

        // 3. CHEERIO
        bench.add("cheerio", () => {
            const $ = cheerio.load(html);
            $(".flw-item").map((i, el) => ({
                id: $(el).find(".film-poster-ahref").attr("data-id"),
                title: $(el).find(".film-name").text().trim(),
                img: $(el).find(".film-poster-img").attr("src")
            })).get();
        });

        // 4. NODE-HTML-PARSER
        bench.add("node-html-parser", () => {
            const root = nodeHtmlParse(html);
            const items = root.querySelectorAll(".flw-item");
            items.map(item => ({
                id: item.querySelector(".film-poster-ahref")?.getAttribute("data-id"),
                title: item.querySelector(".film-name")?.text.trim(),
                img: item.querySelector(".film-poster-img")?.getAttribute("src")
            }));
        });

        // 5. HTMLPARSER2
        bench.add("htmlparser2", () => {
            const handler = new htmlparser2.DomHandler();
            const parser = new htmlparser2.Parser(handler);
            parser.write(html);
            parser.end();
        });

        await bench.run();

        // Collect results
        for (const task of bench.tasks) {
            const mean = task.result?.latency?.mean ?? 0; // Already in ms
            const min = task.result?.latency?.min ?? 0;
            const max = task.result?.latency?.max ?? 0;
            const p99 = task.result?.latency?.p99 ?? 0;
            const samples = task.result?.latency?.samplesCount ?? 0;
            results[task.name].push({ mean, min, max, p99, samples });
        }
    }

    // Print summary
    console.log("\n" + "=".repeat(70));
    console.log("Results Summary");
    console.log("=".repeat(70));

    for (const [method, measurements] of Object.entries(results)) {
        if (measurements.length === 0) {
            console.log(`${method.padEnd(25)}: No data collected`);
            continue;
        }
        const avgMean = measurements.reduce((sum, m) => sum + m.mean, 0) / measurements.length;
        const avgMin = measurements.reduce((sum, m) => sum + m.min, 0) / measurements.length;
        const avgMax = measurements.reduce((sum, m) => sum + m.max, 0) / measurements.length;
        const avgP99 = measurements.reduce((sum, m) => sum + m.p99, 0) / measurements.length;
        const totalSamples = measurements.reduce((sum, m) => sum + m.samples, 0);
        console.log(`${method.padEnd(25)}: ${avgMean.toFixed(2)}ms (min: ${avgMin.toFixed(2)}ms, max: ${avgMax.toFixed(2)}ms, p99: ${avgP99.toFixed(2)}ms) [${totalSamples} samples]`);
    }
}

runBenchmark().catch(console.error);