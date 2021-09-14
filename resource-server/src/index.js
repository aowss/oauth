const express = require('express')
const env = require('dotenv')
const jwt = require("jsonwebtoken")

env.config()
const config = require('./config')
const db = require('./db')

const app = express()
const port = 3001

const parseToken = req => {
    try {
        const authHeader = req.header('Authorization')
        console.log(`OAuth resource server: [ Authorization header = ${authHeader} ]`)
        const token = authHeader.split(' ')[1]
        if (!authHeader || !authHeader.startsWith('Bearer ') || !token) {
            throw new Error(`OAuth resource server: missing / invalid Authorization header [ Authorization header = ${authHeader} ]`)
        }
        jwt.verify(token, config.jwt.publicKey, { algorithms: ['RS256'], issuer: config.jwt.iss })
        return jwt.decode(token)
    } catch (e) {
        throw new Error(`OAuth resource server: invalid OAuth token [ reason = ${e.message}, token = ${token} ]`)
    }
}

const checkScope = (token, scope) => {
    const scopes = token.scope
    if (!scopes || scopes.length === 0) {
        throw new Error('OAuth resource server: no scopes in the OAuth token')
    }
    if (!scopes.includes(scope)) {
        throw new Error(`OAuth resource server: ${scope} scope not in the OAuth token [ token = ${token} ]`)
    }
}

app.get('/accounts', (req, res) => {
    try {
        const token = parseToken(req)
        checkScope(token, 'accounts')
        const userId = token.sub
        console.log(`OAuth resource server: [ user = ${userId} ]`)
        const accounts = db.accounts[userId]
        if (!accounts || accounts.length === 0) {
            return res.status(204).send()
        }
        return res.status(200).send(accounts)
    } catch (e) {
        console.log(`OAuth resource server: authorization error [ error = ${e.message} ]`)
        return res.status(401).send()
    }
})

app.listen(port, () => {
    console.log(`OAuth resource server listening on port ${port}`)
})