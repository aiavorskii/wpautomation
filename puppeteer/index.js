const puppeteer = require('puppeteer');
const http = require('http');
const {google} = require('googleapis');
const sheets = google.sheets('v4');

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

        const wpUrl = 'http://localhost:86';
        const setLogin = el => el.value = 'test';
        const setPass = el => el.value = 'q1w2e3r4';

        // make a screenshot before
        await page.goto(wpUrl, {waitUntil: 'networkidle2'});
        await page.screenshot({path: './theme-before.png'});

        // login
        await page.goto(`${wpUrl}/wp-admin/`, {waitUntil: 'networkidle2'});
        await page.$eval('#user_login', setLogin);
        await page.$eval('#user_pass', setPass);
        await Promise.all([
            page.click("#wp-submit"),
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
        ]);

        // changing theme
        await page.goto(`${wpUrl}/wp-admin/themes.php`, {waitUntil: 'networkidle2'});
        await Promise.all([
            page.click(".theme:nth-child(3) .button.activate"),
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
        ]);

        // make a screenshot after
        await page.goto(wpUrl, {waitUntil: 'networkidle2'});
        await page.screenshot({path: './theme-after.png'});
        await page.close();

        await browser.close();

        res.end("Theme changed");
    })();
}).listen(8009);


