# Kontent Custom Element

- [Kontent Custom Element](#kontent-custom-element)
  - [Development](#development)
  - [Dependencies](#dependencies)
  - [Testing](#testing)
  - [Releasing](#releasing)
  - [Terraform](#terraform)
    This project is a custom element to be hosted as a plugin to the Kontent.ai headless CMS.

Kontent Custom element is a plugin element for Kontent.ai that supports multiple custom elements based on a `type` input that is received from Kontent.ai at the time it's rendered in an iFrame.
The current supported elements are:

- Usergroup exceptions
- World Region exceptions

## Development

This should be enough to start the application locally. Note that this will not use any existing data, since there is no direct tie-in to Kontent this way.

If you want to run against the production configuration, simply append `--prod` to the end of the `nx serve` command.

## Dependencies

The Custom Element requires the following specifically, in addition to the [shared/common dependencies](../../README.md#dependencies):

Dependencies:

- axios
- react-select

Dev Dependencies:

- @types/react-select
- gzipper

## Testing

Jest is used for unit testing

Run `nx test kontent-exception-element`

## Releasing

This application uses Github Actions to build, test, lint, and deploy to an AWS S3 bucket. Prior to syncing to S3, the application is gzipped using the [gzipper](https://www.npmjs.com/package/gzipper) library.

For the release process, see [Releasing](../../README.md#releasing)

## Terraform

[Terraform](https://www.terraform.io/) was used to bootstrap the AWS environments. See `main.tf` for examples of the environment layout and resources created.

If you have Terraform installed locally, as well as the appropriate AWS profiles, you should be able to do something like the following to build out an environment (using only one .tf file at a time in the directory):

```bash
terraform init
terraform apply -auto-approve
```
