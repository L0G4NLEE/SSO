import { Meteor } from 'meteor/meteor';
import { LinksCollection } from '/imports/api/links';
import { ServiceConfiguration } from 'meteor/service-configuration';
import { WebApp } from 'meteor/webapp';

import axios from 'axios';
import qs from 'qs';
import crypto from 'crypto';

async function insertLink({ title, url }) {
  await LinksCollection.insertAsync({ title, url, createdAt: new Date() });
}

Meteor.startup(async () => {
  // Nếu collection Links trống, thêm một số dữ liệu
  if (await LinksCollection.find().countAsync() === 0) {
    await insertLink({
      title: 'Do the Tutorial',
      url: 'https://www.meteor.com/tutorials/react/creating-an-app',
    });

    await insertLink({
      title: 'Follow the Guide',
      url: 'https://guide.meteor.com',
    });

    await insertLink({
      title: 'Read the Docs',
      url: 'https://docs.meteor.com',
    });

    await insertLink({
      title: 'Discussions',
      url: 'https://forums.meteor.com',
    });
  }

  // Publish toàn bộ collection Links tới tất cả các client
  Meteor.publish("links", function () {
    return LinksCollection.find();
  });

  // Cấu hình Google OAuth
  await ServiceConfiguration.configurations.updateAsync(
    { service: 'google' },
    {
      $set: {
        clientId: '',
        secret: '',
        loginStyle: 'popup',
      },
    },
    { upsert: true }
  );
  await ServiceConfiguration.configurations.updateAsync(
    { service: 'facebook' },
    {
      $set: {
        appId: '',
        secret: '',
        loginStyle: 'popup',
      },
    },
    { upsert: true }
  );


  // OpenID Configuration URL
  const openidConfigUrl = 'https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_thFz3qEPe/.well-known/openid-configuration';

  // Client details
  const clientId = '2bbsh5gqfp0shgaht49b5j2kuq'; // by trustID provide

  //------
  //const redirectUri = 'http://localhost:3000/callback'; // ==> error
  const redirectUri = 'http://localhost';
  //------


  // Generate PKCE challenge and verifier => codeChallenge
  const codeVerifier = crypto.randomBytes(32).toString('hex');
  const codeChallenge = base64URLEncode(sha256(codeVerifier));

  function base64URLEncode(str) {
    return str.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  function sha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest();
  }

  // Get OpenID config from OpenID Configuration URL
  let openidConfig;
  try {
    const response = await fetch(openidConfigUrl);
    openidConfig = await response.json();
  } catch (error) {
    console.error('Error fetching OpenID configuration:', error);
    return;
  }

  // Handle '/login-trustid' => endpoint to SSO login with trustId
  WebApp.connectHandlers.use('/login-trustid', (req, res, next) => {

    if (!openidConfig) return res.status(500).send('OpenID configuration not loaded');

    // Authorization Url => Auth => Route to '<trustid>/login' endpoint
    const authorizationUrl = `${openidConfig.authorization_endpoint}?` + qs.stringify({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'openid email profile',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });
    console.log(authorizationUrl);
    res.redirect(authorizationUrl);
  });

  // Endpoint to callback with code after login
  WebApp.connectHandlers.use('/callback', async (req, res, next) => {

    const code = req.query.code;

    if (!code) return res.status(400).send('Authorization code is missing');

    try {
      const tokenResponse = await axios.post(openidConfig.token_endpoint, qs.stringify({
        grant_type: 'authorization_code',
        client_id: clientId,
        redirect_uri: redirectUri,
        code: code,
        code_verifier: codeVerifier
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { id_token, access_token } = tokenResponse.data;

      // Use access token to get user info
      const userInfoResponse = await axios.get(openidConfig.userinfo_endpoint, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      // Respose
      res.json({
        id_token,
        access_token,
        user_info: userInfoResponse.data
      });

    } catch (error) {
      console.error('Error during authentication:', error.response ? error.response.data : error.message);
      res.status(500).send('Authentication failed');
    }

  });


});
Meteor.startup(() => {
  // Cấu hình trustid OAuth
  ServiceConfiguration.configurations.upsert(
    { service: 'trustid' },
    {
      $set: {
        clientId: '<Your trustid Client ID>',
        secret: '<Your trustid Client Secret>',
        loginStyle: 'popup',
      },
    }
  );
});
