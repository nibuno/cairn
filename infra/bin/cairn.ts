#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';

import { CairnDomainStack } from '../lib/cairn-domain-stack';
import { CairnWebStack } from '../lib/cairn-web-stack';

const app = new cdk.App();
const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? 'ap-northeast-1',
};

const domainStack = new CairnDomainStack(app, 'CairnDomainStack', { env });
const webStack = new CairnWebStack(app, 'CairnWebStack', {
  env,
  hostedZone: domainStack.hostedZone,
});

webStack.addStackDependency(domainStack);

cdk.Tags.of(app).add('Project', 'cairn');
cdk.Tags.of(app).add('ManagedBy', 'aws-cdk');
