# SM Solutions Architect Challenge

The challenge solution is deployed in AWS.

# Deployed example

The deployed example can be accessed via this cURL command :

curl --location --request POST 'https://e72oyfujtd.execute-api.ap-southeast-2.amazonaws.com/test/sendEmail' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-raw '{
    "from": "gavin@iinet.net.au",
    "to": "gavin@iinet.net.au",
    "subject": "Hello from API  (BasicTest)",
    "text": "Testing sendEmail API  (BasicTest)"
} '

It can be invoked via this Postman collection (TBC) :

Or via this web page (TBC) :

# Build and deploy instructions

## Create a lambda called "sendEmail"

Create a lambda using the AWS console as per the instructions here : https://docs.aws.amazon.com/lambda/latest/dg/code-editor.html

The code for the lambda is in sendemail-index.js

You will need to insert your API keys for both Mailgun and Sendgrid and the Domain for Mailgrid into the code in the marked places (these are not yet externalised to lambda environment variables).

## Expose the lambda via the AWS API Gateway

Create and deploy a REST API for the lambda function as per the instructions here : https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-getting-started-with-rest-apis.html

* The resource should be called /sendEmail
* A POST method should be created that invokes the sendEmail lambda via Lambda proxy integration.  

Logs should be generated to Cloudwatch for both the lambda and the API Gateway


