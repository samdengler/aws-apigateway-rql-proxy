# AWS API Gateway RQL Proxy Lambda Function

## Introduction

> AWS API Gateway currently (April, 2018) appends a `=` character to query parameters with no value (i.e. 'bare' parameters) when using [HTTP Proxy Integration](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-http.html).  For example,  a request to API Gateway with a request parameter of `limit(3,6)` will be mapped to `limit(3,6)=` in the integration request to an HTTP backend.  Appending a `=` character to the query parameter causes problems when the HTTP backend parses the request as a
[Resource Query Language (RQL)](https://github.com/persvr/rql) query expression.
>
> To workaround the current behavior, this Lambda function is used to transform requests by removing the `=` suffix for RQL query parameter keywords before proxying the request to a configured host.

## Configuration

> After installing the Lambda function, configure the API Gateway with a proxy resource and enter the Lambda function for the backend integration, selecting the Use Lambda Proxy integration checkbox.
>
> The proxied host and port are configured using the API Gateway Stage Variables, `proxyHost` and `proxyHost` respectively.

## Installation

> 1. Install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/installing.html)
> 2. Install [Node 8](https://nodejs.org/en/) (includes NPM)
> 3. Clone this repository to your workstation
> 4. Run `npm install` to install the **rql** dependency
> 5. If necessary, create an S3 Bucket in your AWS account for your Lambda code artifact
> 6. Run the [`cloudformation package`](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/package.html) command to package and upload the code artifact to S3.
> 7. Run the [`cloudformation deploy`](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/deploy/index.html) command to deploy the code artifact and create a new Lambda function.
> 8. Configure an API Gateway API as described above to integrate the Lambda function backend and configure the `proxyHost` and `proxyPort` StageVariables.
