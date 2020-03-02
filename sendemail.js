const https = require('https')
const util = require('util')

exports.handler = async (event) => {
    
  console.log('lambda event: ' + JSON.stringify(event,'',4));

  return new Promise((resolve, reject) => {

  // mailgun set up (with ugly hardcoding of API key)
  const mailgunData = JSON.stringify({});
  const args = 
    'from=' + encodeURIComponent(event.from) +
    '&to=' + encodeURIComponent(event.to) +
    '&subject=' + encodeURIComponent(event.subject) +
    '&text=' + encodeURIComponent(event.text);
  const path = '/v3/sandbox8b3382a1513e4469bb47e174c94a9a31.mailgun.org/messages?' + args;
  const mailgunOptions = {
    hostname: 'api.mailgun.net',
    port: 443,
    path: path,
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from('api:e4928a4fdeeee8b2e692327b42a96081-9dda225e-6e16d731').toString('base64'),
      'Content-Type': 'application/json',
      'Content-Length': mailgunData.length
    }
  };
  console.log('mailgun request options: ' + JSON.stringify(mailgunOptions,'',4));
  console.log('mailgun data: ' + JSON.stringify(mailgunData,'',4));

  // sendgrid set up (with ugly hardcoding of API key)
  const sendgridData = JSON.stringify({"personalizations": [{"to": [{"email": event.to}]}],"from": {"email": event.from},"subject": event.subject,"content": [{"type": "text/plain", "value": event.text}]});
  const sendgridOptions = {
    hostname: 'api.sendgrid.com',
    port: 443,
    path: '/v3/mail/send',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer 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',
      'Content-Type': 'application/json',
      'Content-Length': sendgridData.length
    }
  }
  console.log('sendgrid request options: ' + JSON.stringify(sendgridOptions,'',4));
  console.log('sendgrid data: ' + JSON.stringify(sendgridData,'',4));

  // validate from (single email address only)
    if (ValidateEmail(event.from) == false) {
      console.log('from address is invalid: ' + event.from); 
      reject('from address is invalid: ' + event.from); 
    }
    // validate to (single email address only)
    else if (ValidateEmail(event.to) == false) {
      console.log('to address is invalid: ' + event.to); 
      reject('to address is invalid: ' + event.to); 
    }
    else {
      const mailgunRequest = https.request(mailgunOptions, (res) => {

      // if statusCode is not 200 then need to try alternative

        console.log('success via mailgun: ' + res.statusCode );
        //console.log('res = ' + util.inspect(res, false, null, true));
        resolve('Success');
      });

      mailgunRequest.on('error', (e) => {
        console.log('error sending via mailgun :' + e.message);

        return new Promise((resolve, reject) => {

          // try to send via sendgrid instead (ugly nested callback)
          const sendgridRequest = https.request(sendgridOptions, (res) => {
            console.log('success via sendgrid:' + res.statusCode);
            //console.log('res = ' + util.inspect(res, false, null, true ));
            resolve('Success');
          });

          sendgridRequest.on('error', (e2) => {
            console.log('error sending via sendgrid :' + e2.message);
            reject(e2.message);
          });

          // send the request via sendgrid
          console.log('sending via sendgrid: ' + JSON.stringify(sendgridData,'',4));
          sendgridRequest.write(sendgridData);
          sendgridRequest.end();
        });
      });

      // send the request via mailgun
      console.log('sending data via mailgun: ' + JSON.stringify(mailgunData,'',4));
      mailgunRequest.write(mailgunData);
      mailgunRequest.end();
    }
  });
    
};

function ValidateEmail(email) 
{
  console.log('validating email: ' + email);
  const expression = /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;

  const result = expression.test(String(email).toLowerCase());
  console.log('result = ' + result);

  return result;
}