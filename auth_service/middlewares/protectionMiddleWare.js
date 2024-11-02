const { centralized_session_store_dbURI } = require('../modules/centralized_session_store_dbURI.js');
const { MongoClient } = require('mongodb');

async function protectionMiddleWare(req, res, next) {
    if (req.path === '/checkHealth' || req.path === '/auth') return next();
    const sessionId = req.sessionID;
    const client = new MongoClient(centralized_session_store_dbURI);
    try {
        await client.connect(); 
        const database = client.db('centralized_session_store');
        const sessionsCollection = database.collection('sessions');

        const session = await sessionsCollection.findOne({ _id: sessionId });

        if (session) {
            const discoveryResponse = await fetch(`http://localhost:3003/getServiceUrl/main_page_service`);
            const discoveryResponseData = await discoveryResponse.json();
            if (discoveryResponseData.serviceUrl) {
                return res.status(401).redirect(discoveryResponseData.serviceUrl);
            } else {
                console.log(data);
                return res.status(400).json({ error: data })
            }
        } else {
            console.log("asdw");
            return next();
        }
    } catch (error) {
        console.error('Error querying session:', error);
    } finally {
        await client.close();
    }
}

module.exports = protectionMiddleWare;