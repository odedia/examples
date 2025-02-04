import * as aws from '@pulumi/aws';
import { PolicyDocument } from '@pulumi/aws/iam';
import { Instance } from '@theniledev/js';

export const pulumiS3 = (instance?: Instance) => {
  return async () => {
    // Create a bucket and expose a website index document.
    const siteBucket = new aws.s3.Bucket('nile-demo', {
      website: {
        indexDocument: 'index.html',
      },
    });

    const instanceProps = instance?.properties as { [key: string]: unknown };
    const { instanceName } = require(`../../../../../../../usecases/${instance?.type}/init/entity_utils.js`);
    let uniqueValue = "dummy";
    if (String(instanceProps[instanceName]) !== "undefined") {
      uniqueValue = String(instanceProps[instanceName]);
    }

    const indexContent = `<html><head>
<title>Hello S3</title><meta charset="UTF-8">
</head>
<body>
<h1>${uniqueValue}</h1>
<p>Built with ❤️  on <a href="https://www.thenile.dev">Nile</a></p>
<h2>Instance Details</h2>
<p>${JSON.stringify(instance, null, 2)}</p>
</body></html>
`;

    // Write our index.html into the site bucket.
    const object = new aws.s3.BucketObject('index', {
      bucket: siteBucket,
      content: indexContent,
      contentType: 'text/html; charset=utf-8',
      key: 'index.html',
    });

    // Create an S3 Bucket Policy to allow public read of all objects in bucket.
    function publicReadPolicyForBucket(bucketName: string): PolicyDocument {
      return {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/*`],
          },
        ],
      };
    }

    // Set the access policy for the bucket so all objects are readable.
    const bucketPolicy = new aws.s3.BucketPolicy('bucketPolicy', {
      bucket: siteBucket.bucket, // Refer to the bucket created earlier.
      policy: siteBucket.bucket.apply(publicReadPolicyForBucket), // Use output property `siteBucket.bucket`.
    });

    return {
      websiteUrl: siteBucket.websiteEndpoint,
      object,
      bucketPolicy,
    };
  };
};
