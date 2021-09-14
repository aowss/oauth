const oauth = {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    authServerUrl: process.env.AUTH_SERVER_URL
}

const resource = {
    resourceServerUrl: process.env.RESOURCE_SERVER_URL
}

module.exports = { oauth, resource }