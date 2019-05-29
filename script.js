const Mbox = require('node-mbox');
const mbox = new Mbox();
const fs = require('fs');
require('iconv');

// wait for message events
const messages = {

};
mbox.on('message', async function (msg) {
    const MailParser = require('mailparser').MailParser;
    let parser = new MailParser();
    let mailobj = {};

    parser.on('headers', headers => {
        let headerObj = {};
        for (let [k, v] of headers) {
            // We don’t escape the key '__proto__'
            // which can cause problems on older engines
            headerObj[k] = v;
        }

        mailobj.email_from = headerObj.from.value[0].address;
        mailobj.name_from = headerObj.from.value[0].name;
        mailobj.subject = headerObj.subject;
    });

    parser.on('data', data => {
        if (data.type !== 'attachment') {
            mailobj.text = data.text;
        }
    });

    parser.on('end', () => {
        // process.stdout.write(JSON.stringify(mailobj, (k, v) => (k === 'content' || k === 'release' ? undefined : v), 3));
        fs.appendFile('to_train.json', JSON.stringify(mailobj) + "\n", (err) => {
            // throws an error, you could also catch it here
            if (err) throw err;
            // success case, the file was saved
            // console.log('json updated!');
        });
    });
    parser.write(msg);
    parser.end();
});

// pipe stdin to mbox parser
const handle = fs.createReadStream("Inbox.mbox");
handle.pipe(mbox);