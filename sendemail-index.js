const https = require('https')
const util = require('util')

exports.handler = async (event) => {
    
  console.log('lambda event: ' + JSON.stringify(event,'',4));

  return new Promise((resolve, reject) => {

    const body = JSON.parse(event.body);

    var response = {
      statusCode: 200,
      headers: {},
      body: 'success'
    };


    // mailgun set up (with ugly hardcoding of API key)
    const mailgunData = JSON.stringify({});
    const args = 
      'from=' + encodeURIComponent(body.from) +
      '&to=' + encodeURIComponent(body.to) +
      '&subject=' + encodeURIComponent(body.subject) +
      '&text=' + encodeURIComponent(body.text);
    const path = '/v3/DOMAIN.mailgun.org/messages?' + args;
    const mailgunOptions = {
      hostname: 'api.mailgun.net',
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from('api:MAILGUN_API_KEY').toString('base64'),
        'Content-Type': 'application/json',
        'Content-Length': mailgunData.length
      }
    };
    console.log('mailgun request options: ' + JSON.stringify(mailgunOptions,'',4));
    console.log('mailgun data: ' + JSON.stringify(mailgunData,'',4));

    // sendgrid set up (with ugly hardcoding of API key)
    const sendgridData = JSON.stringify({"personalizations": [{"to": [{"email": body.to}]}],"from": {"email": body.from},"subject": body.subject,"content": [{"type": "text/plain", "value": body.text}]});
    const sendgridOptions = {
      hostname: 'api.sendgrid.com',
      port: 443,
      path: '/v3/mail/send',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer SENDGRID_API_KEY',
        'Content-Type': 'application/json',
        'Content-Length': sendgridData.length
      }
    }
    console.log('sendgrid request options: ' + JSON.stringify(sendgridOptions,'',4));
    console.log('sendgrid data: ' + JSON.stringify(sendgridData,'',4));

    // validate from (single email address only)
    if (ValidateEmail(body.from) == false) {
      console.log('from address is invalid: ' + body.from); 
      response.statusCode = 400;
      response.body = 'from address is invalid: ' +  JSON.stringify(event,'',4);
      resolve(response); 
    }
    // validate to (single email address only)
    else if (ValidateEmail(body.to) == false) {
      console.log('to address is invalid: ' + body.to); 
      response.statusCode = 400;
      response.body = 'to address is invalid: ' + body.to;
      resolve(response); 
    }
    else {
      const mailgunRequest = https.request(mailgunOptions, (res) => {

      // if statusCode is not 200 then need to try alternative
      if (res.statusCode == 200) {
        console.log('success via mailgun: ' + res.statusCode );
        resolve(response);
      } else {
        console.log('error sending via mailgun (' + res.statusCode + ') - sending via sendgrid :');

        return new Promise((resolve, reject) => {
  
          // try to send via sendgrid instead (ugly nested callback)
          const sendgridRequest = https.request(sendgridOptions, (res) => {
            if (res.statusCode == 200) {
              console.log('success via sendgrid:' + res.statusCode);
              resolve(response);
            } else {
              console.log('failure via sendgrid:' + res.statusCode);
              response.statusCode = res.statusCode;
              response.body = 'failure via sendgrid';
              resolve(resonse);
            }
          });
  
          sendgridRequest.on('error', (e2) => {
            console.log('error sending via sendgrid :' + e2.message);
            response.statusCode = res.statusCode;
            response.body = 'Error :' + e2.message;
            resolve(response);
          });
  
          // send the request via sendgrid
          console.log('sending via sendgrid: ' + JSON.stringify(sendgridData,'',4));
          sendgridRequest.write(sendgridData);
          sendgridRequest.end();
        });

      }

    });

    mailgunRequest.on('error', (e) => {
      console.log('error sending via mailgun :' + e.message);
      response.statusCode = res.statusCode;
      response.body = 'Error :' + e2.message;
      resolve(response);
    });

    // send the request via mailgun
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