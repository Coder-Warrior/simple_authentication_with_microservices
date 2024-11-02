const express = require('express');
const Consul = require('consul');
const cors = require('cors');

const app = express();
const consul = new Consul();
const port = 3003;

app.use(cors());
app.use(express.json());

async function getServiceInstance(serviceName) {
    try {
        // Fetch all healthy instances of the specified service
        const services = await consul.health.service({
            service: serviceName,
            passing: true
        });

        if (services.length === 0) {
            throw new Error(`Service ${serviceName} is not available`);
        }

        // Choose one of the available service instances
        const instance = services[Math.floor(Math.random() * services.length)].Service;

        // Construct the service URL
        const serviceUrl = `http://${instance.Address}:${instance.Port}`;
        return serviceUrl;

    } catch (error) {
        console.error(`Error retrieving ${serviceName}:`, error.message);
        throw error;
    }
}

app.get('/getServiceUrl/:serviceName', async (req, res) => {
    const serviceName = req.params.serviceName;
    try {
    const serviceUrl = await getServiceInstance(serviceName);
    res.status(200).json({ serviceUrl });
    } catch (e) {
        console.log('error in get service name')
        console.log(e);
    }
});

app.post('/check-user-authentication', async (req, res) => {
    const { sessionId } = req.body;
    try {
        const authServiceUrl = await getServiceInstance('auth-service');
        console.log(authServiceUrl)
        const response = await fetch(`${authServiceUrl}/auth`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ sessionId })
        });
        const data = await response.json();
        if (data.authentic) {
            return res.status(200).json({ authentic: true });
        } else {
            return res.status(400).json({ error: "unAuthorized User" });
        }
    } catch (e) {
        console.log('error in check user auth')
        console.log(e);
    }
});

app.listen(port, _ => {
    console.log(`server listening on port: ${port}`);
});