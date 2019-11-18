# Proxy

## Description ##

The Node.js-based (Express.js) proxy enables to bypass the CORS restrictions and to use 3rd-Party Services in a
HTML5 web application. 

## Run the proxy on your local machine ##

**Prerequisites:**
-  Node.js  v10.16.0
-  npm 6.9.0

**Task flow**

After cloning this project `cd` to the project root folder and CLI:

` npm install `


` npm run start:proxy `   


Open your web browser and redirect to localhost:3000. The proxy will initially host a Web UI for managing session data!

**API Documentation**

Loads index.html (homepage)
```
/
```
Respond with a pong if proxy is available
```
/ping
```
Retrieve the current proxy config object (DEV MODE)
```
/config
```
Validate a preflight OPTIONS request (DEV MODE)
```
/delete
```
Update session data in the in-memory config object
```
/update
```
Suffix for the API gateway
```
/api
```

**CORS Activation**

The local development environments hosted on localhost:8080 must be able to hit against the proxy. Hence a whitelist is managed that includes clients requesting from http://localhost:8080.

