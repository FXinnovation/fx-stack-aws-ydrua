# aws-ydrua
AWS You Dind't Remove User Access - Cloudformation Drift Detection System

## Description
This project aims to notify your system administrator of drift on your AWS Cloudformation stacks, and notify using outgoing webhooks and/or by sending mails.
It's written in Go and we try to follow Go best practices. It will be deployed under the form of an AWS Lambda Function.

## Name
The name of the tool comes from the fact that the tool itself should not exist, because in an ideal world, you do not make changes manually to a stack, but then reality shifts in.

## Deployment
You can find deployment configuration for `Cloudformation` and `Terraform` in the deployments directory of this repository.

*Note: The `Terraform` deployment code is a git sub-module that refers to another git repository. This is because we want to publish this module on the public terraform registry. So we don't have another choice.*

## Project Structure
The project is structured as described [here](https://github.com/golang-standards/project-layout)

## Contributing
Anyone can contribute to the project, but please take notice we try to have full test coverage and to keep the code simple, readable and maintainable.

## Versioning
This project follows [Semantic Versioning](https://semver.org/)

## License
MIT

## Contributing
Fork, make pull request
Please remain polite
