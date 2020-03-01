
# TO DO list

## Bare minimum

- create api for lambda 
  - accept request with data and return response
  - deploy to API Gateway
  - create Postman tests
- switch from one provider to another on error
  - return error if second provider also errors
  - return provider used in response 
- write input validations and return appropriate errors
  - expand validation to support multiple email addresses and complex email addresses with name as well as address)

- create README.md with setup and deploy instructions
  - include link to running version on AWS
  - Cloudwatch / Cloudtrail
  - Elasticache (set up and seed)
  - Lambdas
  - API Gateway including stages / routes for lambdas

- upload everything to Github


## Extras

- move config parameters to environment variables
- use Elasticache to determine provider to try (update state if error occurs)
- create simple UI to call lambda and display response (which should include provider email sent by) ?
- create Mocha unit tests
- create build and deploy pipeline for code
- create Terraform script for infrastructure
- add idempotency check to send (requires keeping state of sent messages)
- add structured logging to lambda and classes
