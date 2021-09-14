const express = require('express')

const axios = require('axios')
const querystring = require('querystring')

const env = require('dotenv')
env.config()
const config = require('./config')

const app = express()
app.use(express.static('public'))

const port = 3000

const getToken = (client_id, client_secret, code, authServerUrl) => {
    const body = { client_id, client_secret, code, grant_type: 'authorization_code', redirect_uri: 'http://localhost:3000/oauth-callback' }
    const opts = { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
    console.log(`OAuth client -> OAuth authorization server [ token endpoint ]: exchanging authorization code for access token [ body = ${JSON.stringify(body)} ]`)
    return axios
        .post(`${authServerUrl}/token`, querystring.stringify(body))
        .then(res => {
            console.log(`OAuth client <- OAuth authorization server [ token endpoint ]: [ body = ${JSON.stringify(res.data)} ]`)
            return  res.data['access_token']
        })
}

const getResources = resourceServerUrl => token => {
    const opts = { headers: { accept: 'application/json', authorization: `Bearer ${token}` } }
    console.log('OAuth client -> OAuth resource server: fetching the resource')
    return axios
        .get(`${resourceServerUrl}/accounts`, opts)
        .then(res => {
            console.log(`OAuth client <- OAuth resource server: [ body = ${JSON.stringify(res.data)} ]`)
            return  res.data
        })
}

app.get('/accounts', (req, res) => {
    console.log('user agent -> OAuth client [ client ]: initial call')
    const redirectUrl = `${config.oauth.authServerUrl}/auth?client_id=${config.oauth.clientId}&redirect_uri=http://localhost:3000/oauth-callback&response_type=code&scope=accounts`
    console.log(`OAuth client -> OAuth authorization server [ authorization endpoint ]: redirecting to ${redirectUrl}`)
    res.redirect(redirectUrl)
})


app.get('/oauth-callback', (req, res) => {
    console.log(`user agent -> OAuth client [ redirection endpoint ]: callback [ authorization code = ${req.query.code} ]`)
    return getToken(config.oauth.clientId, config.oauth.clientSecret, req.query.code, config.oauth.authServerUrl)
        .then(getResources(config.resource.resourceServerUrl))
        .then(data => {
            if (!data || data.length === 0) return res.status(204).send()
            return res.status(200).send(data)
        })
        .catch(err => res.status(500).json({ message: err.message }))
})

app.listen(port, () => {
    console.log(`OAuth client listening on port ${port}`)
})