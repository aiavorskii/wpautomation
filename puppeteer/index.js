const puppeteer = require('puppeteer');
const http = require('http');

http.createServer(function (req, res) {
    if (req.url === '/favicon.ico') {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write('Ok');
        res.end();
        return;
    }

    (async() => {

        const browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        });

        const page = await browser.newPage();

        // make a screenshot before
        await page.goto('http://localhost:86', {waitUntil: 'networkidle2'});
        await page.screenshot({path: './theme-before.png'});

        await page.goto('http://localhost:86/wp-admin/', {waitUntil: 'networkidle2'});

        // login
        await page.$eval('#user_login', el => el.value = 'test');
        await page.$eval('#user_pass', el => el.value = 'q1w2e3r4');
        await Promise.all([
            page.click("#wp-submit"),
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
        ]);

        // changing theme
        await page.goto('http://localhost:86/wp-admin/themes.php', {waitUntil: 'networkidle2'});
        await Promise.all([
            page.click(".theme:nth-child(3) .button.activate"),
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
        ]);

        // make a screenshot after
        await page.goto('http://localhost:86', {waitUntil: 'networkidle2'});
        await page.screenshot({path: './theme-after.png'});
        await page.close();

        await browser.close();
    })();

    res.end("Theme changed");
}).listen(8009);


