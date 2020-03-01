# Solution Architecture Challenge - Architecture

The architecture is a serverless architecture that leverages the AWS API Gateway with AWS lambdas written in Node.js.

This is a simple, low cost solution which scales well and is highly available.  

![Image of architecture](https://github.com/gavinhughes-sm/sm/blob/master/SM%20Challenge.png)

An alterative implementation based on the Express framework could also be implemented (with long running server components deployed in a container orchestrator like Kubernetes or EKS)

## Components

* API Gateway handles service requests and dispatches to lambda functions
* sendEmail lambda function handles requests to send emails
* setEmailProvider and getEmailProvider lambda functions set the default choice of email provider
* lambda functions log information to Cloudwatch
* lambda functions publish success / fail sendEmail events to Kinesis (for auditing)

## Constraints :

* An idempotency check could be included on the SendEmail service to avoid diplicate email sends. This would require a persistent store tracking sent message ids.
* Lambdas are limited to 1000 concurrent requests by default (this can be increased if required)
* The implementation provided Mailgun and Sendgrid have free accounts with sending volume limits 
* Mailgun can only send to whitelisted recipients

## Unimplemented components :

* Only the sendEmail lambda has been implemented - the lambdas to set and get the email provider are to be completed (the initial version simply tries one provider then the other if the first fails)
* The sendEmail lambda does not use Elasticache to determine provider to try (or update the provider if an error occurs)
* Events for success or failure of sending an email are not being sent to Kinesis
* The Elasticache and Kinesis services have not been set up
* Architecture doesn't support idempotency checks at this point (in order to prevent duplicate email sends)

Other items to complete (outside the architectural components) are listed in [TODO.md]()


