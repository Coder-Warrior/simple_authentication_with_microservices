const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const connectMongo = require('connect-mongo');
const Consul = require('consul');
const cookieParser = require('cookie-parser');
const { centralized_session_store_dbURI } = require('./modules/centralized_session_store_dbURI.js');

const app = express();
const port = 3001;
const consul = new Consul();

app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: "secret",
    saveUninitialized: false,
    resave: false,
    store: connectMongo.create({
        mongoUrl: centralized_session_store_dbURI,
        collectionName: "sessions"
    }),
    cookie: {
        maxAge: 2 * 24 * 60 * 60 * 1000
    },
}));
app.use(express.json());
app.set('view engine', 'ejs');

app.get('/check-health', (req, res) => {
    res.status(200).send("hi");
});

app.get('/', async (req, res) => {
    const response = await fetch('http://localhost:3003/check-user-authentication', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ sessionId: req.sessionID })
    });
    const data = await response.json();
    if (data.authentic) {
        res.render('index');
    } else {
        const discoveryResponse = await fetch('http://localhost:3003/getServiceUrl/auth-service');
        const data_of_discovery_response = await discoveryResponse.json();
        if (data_of_discovery_response.serviceUrl) {
            return res.status(401).redirect(`${data_of_discovery_response.serviceUrl}/auth/register`);
        } else {
            console.log(data_of_discovery_response);
        }
    }
});

app.listen(port, async () => {
    console.log(`server listening on port ${port}`);

    await consul.agent.service.register({
            id: 'main-page-service', // Unique ID for this service instance
            name: 'main_page_service',
            address: 'localhost', // Replace with actual service address if running in a different environment
            port,
            tags: ['express', 'node'],
            check: {
                http: `http://localhost:${port}/check-health`, // Health check URL
                interval: '10s', // Health check interval
                timeout: '5s'
            }
        }, (err) => {
            if (err) {
                console.error('Error registering service with Consul:', err);
            } else {
                console.log('Service registered with Consul successfully');
            }
        });
    });
    
    process.on('SIGINT', () => {
        consul.agent.service.deregister('main-page-service', (err) => {
            if (err) {
                console.error('Error deregistering service:', err);
            } else {
                console.log('Service deregistered from Consul');
            }
            process.exit();
    });
})