const { centralized_session_store_dbURI } = require('../modules/centralized_session_store_dbURI.js');
const { MongoClient } = require('mongodb');

async function authController(req, res) {
    const { sessionId } = req.body;
    const client = new MongoClient(centralized_session_store_dbURI);
    try {
        await client.connect(); 
        const database = client.db('centralized_session_store');
        const sessionsCollection = database.collection('sessions');

        // Query the sessions collection
        const session = await sessionsCollection.findOne({ _id: sessionId });

        if (session) {
            res.status(200).json({ authentic: true });
        } else {
            res.status(400).json({ error: "unAuthorized User" });
        }
    } catch (error) {
        console.error('Error querying session:', error);
    } finally {
        await client.close();
    }
}

module.exports = authController;
