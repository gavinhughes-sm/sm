
# TO DO list

- expand email address validation to support multiple email addresses and complex email addresses with name as well as address)
- create Postman tests (positive and negative scenarios)
- move config parameters to lambda environment variables
- use Elasticache to determine provider to try (update state if error occurs rather than simple Mailgun then Sendgrid attempts)
- generate Swagger for API
- create simple UI to call lambda and display response and deploy as an S3 hosted web site
- create Mocha unit tests
- create build and deploy pipeline for code
- create Terraform script for infrastructure
- add idempotency check to send (requires keeping state of sent messages)
- add structured logging to lambda and classes
