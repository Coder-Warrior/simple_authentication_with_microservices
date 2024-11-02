const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const connectMongo = require('connect-mongo');
const Consul = require('consul');
const cookieParser = require('cookie-parser');
const authRoute = require('./routes/auth_route');
const protectionMiddleWare = require('./middlewares/protectionMiddleWare.js');
const { centralized_session_store_dbURI } = require('./modules/centralized_session_store_dbURI.js');
const app = express();
const dbURI = "";
const port = 3002;
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
app.use(protectionMiddleWare);
app.use('/auth', authRoute);
app.set('view engine', 'ejs');

app.get('/checkHealth', (req, res) => {
    return res.status(200).send('nice');
});

mongoose.connect(dbURI)
.then(_ => {
    app.listen(port, async () => {
        console.log(`server listening on port ${port}`);
    
        await consul.agent.service.register({
                id: 'auth-service',
                name: 'auth-service',
                address: 'localhost',
                port,
                tags: ['express', 'node'],
                check: {
                    http: `http://localhost:${port}/checkHealth`,
                    interval: '10s', 
                    timeout: '5s'
                }
            }, (err) => {
                if (err) {
                    console.log('Error registering service with Consul:', err);
                } else {
                    console.log('Service registered with Consul successfully');
                }
            });
        });
        
        process.on('SIGINT', () => {
            consul.agent.service.deregister('auth-service', (err) => {
                if (err) {
                    console.log('Error deregistering service:', err);
                } else {
                    console.log('Service deregistered from Consul');
                }
                process.exit();
        });
    })
})
.catch(err => console.log(err));
