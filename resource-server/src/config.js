const jwt = {
    publicKey: process.env.PUBLIC_KEY,
    iss: process.env.ISSUER
}

module.exports = { jwt }