// Copyright 2023 The Casdoor Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const url = require('url')
const { SDK } = require('casdoor-nodejs-sdk');
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors')

//init sdk
const cert = `
-----BEGIN CERTIFICATE-----
MIIEnjCCA4agAwIBAgIUN9IFS7Ki4sIk9wXZA2DwkKs7PG0wDQYJKoZIhvcNAQEL
BQAwgYsxCzAJBgNVBAYTAlVTMRkwFwYDVQQKExBDbG91ZEZsYXJlLCBJbmMuMTQw
MgYDVQQLEytDbG91ZEZsYXJlIE9yaWdpbiBTU0wgQ2VydGlmaWNhdGUgQXV0aG9y
aXR5MRYwFAYDVQQHEw1TYW4gRnJhbmNpc2NvMRMwEQYDVQQIEwpDYWxpZm9ybmlh
MB4XDTI0MTAyMTAyNTIwMFoXDTM5MTAxODAyNTIwMFowYjEZMBcGA1UEChMQQ2xv
dWRGbGFyZSwgSW5jLjEdMBsGA1UECxMUQ2xvdWRGbGFyZSBPcmlnaW4gQ0ExJjAk
BgNVBAMTHUNsb3VkRmxhcmUgT3JpZ2luIENlcnRpZmljYXRlMIIBIjANBgkqhkiG
9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2bp5lQF2mtr9uYdg+na7W0P/iOTzOVe2Kalv
dS2joDQC9n7ejiS6rPdGpV6ftnlHJK0UGv07DECTQAOtmrr8ZkQXEJrKXnsVZF3S
omV0S759Hev9ByAyBjnQk/PZB3KCaehmiuPVoBDWgayX2KA/Gbv9/rGgctbP0pcu
WNeRsc6qsvV00JPjnVhpUSfCJN0j9Od20gqJNkZUP862SWBHtVp81WwARKjrwXvd
wcp8U14kO9axCsNkjlyDksIhkt1tuLm4JjztC9OTc5htMCL1g0GV+w2Z+s32QjH4
uVgJgqzO2LEm6JNhz+vAg5XfU1MjljmUnm3SttJvC/uo4/qCFQIDAQABo4IBIDCC
ARwwDgYDVR0PAQH/BAQDAgWgMB0GA1UdJQQWMBQGCCsGAQUFBwMCBggrBgEFBQcD
ATAMBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBSDlSyJOS7yDjZYrLgWvunXFNSmwjAf
BgNVHSMEGDAWgBQk6FNXXXw0QIep65TbuuEWePwppDBABggrBgEFBQcBAQQ0MDIw
MAYIKwYBBQUHMAGGJGh0dHA6Ly9vY3NwLmNsb3VkZmxhcmUuY29tL29yaWdpbl9j
YTAhBgNVHREEGjAYggsqLmdhdWdhdS5pb4IJZ2F1Z2F1LmlvMDgGA1UdHwQxMC8w
LaAroCmGJ2h0dHA6Ly9jcmwuY2xvdWRmbGFyZS5jb20vb3JpZ2luX2NhLmNybDAN
BgkqhkiG9w0BAQsFAAOCAQEAHGBkB3pX6/bvXCz4mSJxSCZA5/mTl3UZTg98sfh/
8dZOUkT+8NIGVKGVqVbzffn4RkXl0fSZqTrD0NejjVlFcKH7CPZZVqMbFJSp+s04
0m3r0V+s4lmQ9e5dHN21K8/+5Hsk2Syo99E1LGKMPNihzbl2OAS0zzZuc7dU3Uje
P9WRnkQH+h00/Xvkm2HCoNZX1OZWDDM2VyP2z3377RJT6o9oQM4wKNvJWAJAuJEe
iwYTWchIES7ahTLglJvSjKW2dWk/EvI9rXGYGbQTf/zPIYYdDb6cLsrzpKEgyGk5
Owdj4iTD8GSza29ZoSSNOnsoteUYu2xW+478X2yRe151gw==
-----END CERTIFICATE-----
`;

const authCfg = {
  endpoint: 'https://id.gaugau.io',
  clientId: '496869095e93df96018c',
  clientSecret: '35d42f9b54691222ef34831defbeb83a5b9db33c',
  certificate: cert,
  orgName: 'Maverick',
  appName: 'app-dev',
}

const sdk = new SDK(authCfg);

const app = express();

app.use(cors({
  origin: 'http://localhost:9000',
  credentials: true
}))

app.get('/', (req, res) => {
  fs.readFile(path.resolve(__dirname, './index.html'), (err, data) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(data);
  });
});

app.get('/api/getUserInfo', (req, res) => {
  let urlObj = url.parse(req.url, true).query;
  console.log(urlObj)
  let user = sdk.parseJwtToken(urlObj.token);
  console.log(user)
  res.send(JSON.stringify(user));
});

app.post('*', (req, res) => {
  let urlObj = url.parse(req.url, true).query;
  sdk.getAuthToken(urlObj.code).then(response => {
    console.log(response)
    const accessToken = response.access_token;
    // const refresh_token = response.refresh_token;
    res.send(JSON.stringify({ token: accessToken }));
  });
});

app.listen(8080, () => {
  console.log('Server listening at http://localhost:8080');
});
