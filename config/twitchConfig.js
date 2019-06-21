let twtichConfig = {
    clientID: '61ostgw84bsm1apwlstum1mzvkui03',
    redirectURI: 'http://hatomu.kro.kr:3000/user/redirect',
    scopes: 'user_read+channel_read',
    clientSecret: '8w1vgt2duw1rv1qs7sjt8mad5d7dn9',
}

twtichConfig.authAddress = `https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${twtichConfig.clientID}&redirect_uri=${twtichConfig.redirectURI}&scope=${twtichConfig.scopes}`

module.exports = twtichConfig