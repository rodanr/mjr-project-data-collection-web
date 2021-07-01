const { google } = require('googleapis');
const path = require('path');
const fs = require('fs-extra');

const CLIENT_ID =
  '425991307248-p93kkhatt8qgk7qqj4chh83prolcn7af.apps.googleusercontent.com';
const CLIENT_SECRET = 'gs71h1y506xfuItD4YoRsUWg';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground/';

const REFRESH_TOKEN =
  '1//04yv1C5kNFVG6CgYIARAAGAQSNwF-L9IrscrFqPPN5BnEd4ZeaSmPJYqIJLirA8hJ9hPOy7NIB_lKbElh0TZtsR2CSpiu6Mt4M2c';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: 'v3',
  auth: oauth2Client,
});

module.exports = (name) => {
  const dirPath = path.join(__dirname, '../audios');
  try {
    const filePath = path.join(dirPath, name);
    return new Promise((resolve, reject) => {
      drive.files.create(
        {
          requestBody: {
            name: name,
            mimeType: 'audio/wav',
            parents: ['1u6_4EijMdM8OZBFrcjNSQE9SqNgDP-e3'],
          },
          media: {
            mimeType: 'audio/wav',
            body: fs.createReadStream(filePath),
          },
        },
        (err, done) => {
          if (err) {
            reject(err);
          } else {
            fs.unlink(filePath, () => {
              console.log('file removed');
            });
            resolve(done.data);
          }
        }
      );
    });
  } catch (error) {
    console.log(error.message);
  }
};
