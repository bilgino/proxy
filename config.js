module.exports = {
  req: {
     hostname: 'google.com',
     host: 'google.com',
     port: 443,
     path: '/a/b/c',
     headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
        'Connection': 'keep-alive',
        'Cookie': '',
        'Host': 'google.com',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'x-broker-rest-version': '',
        'x-consumer-name': '',
        'x-correlation-id' : ''
     },
     method: 'GET'
  },
  apiBaseUrl : '/api',
  session: {
     expired : false
  },
  server: {
     host:'http://localhost:',
     env: 'development',
     port: 3000
  },
  cors: {
     // The Origin header is protected in the browser side.
     whitelist : ['http://localhost:8080', 'http://10.0.68.4:8080']
  }
};


