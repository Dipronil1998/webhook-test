const express = require('express');
const axios = require('axios');
const app = express()
const port = process.env.PORT || 3001;
app.use(express.json())

// { payloadUrl: 'url', secret: ''}
const webhooks = {
    COMMIT: [],
    PUSH: [],
    MERGE: [],
};

app.get('/', function (req, res) {
  res.send('Hello World');
})

app.post('/api/webhooks', (req, res) => {
    const { payloadUrl, secret, eventTypes } = req.body;
    // ['COMMIT', 'PUSH']
    eventTypes.forEach((eventType) => {
        webhooks[eventType].push({ payloadUrl, secret });
    });
    return res.sendStatus(201);
});

app.post('/api/event-emulate', (req, res) => {
    const { type, data } = req.body;
    // Business logic goes here...

    // Event trigger (Call Webhook)
    setTimeout(async () => {
        const webhookList = webhooks[type];
        for (let i = 0; i < webhookList.length; i++) {
            const webhook = webhookList[i];
            const { payloadUrl, secret } = webhook;

            try {
                await axios.post(payloadUrl, data, {
                    headers: {
                        'x-secret': secret,
                    },
                });
            } catch (err) {
                console.log(err);
            }
        }
    }, 0);

    res.sendStatus(200);
});

app.get('/api/db', (req, res) => {
    res.json(webhooks);
});

app.listen(port, ()=>{
    console.log(`Server started at ${port}`);
})