import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { test } from 'node:test';

import { CairnDomainStack } from '../lib/cairn-domain-stack';
import { CairnWebStack } from '../lib/cairn-web-stack';

function createTemplates() {
  const app = new cdk.App();
  const domainStack = new CairnDomainStack(app, 'TestDomainStack');
  const webStack = new CairnWebStack(app, 'TestWebStack', {
    hostedZone: domainStack.hostedZone,
  });

  return {
    domain: Template.fromStack(domainStack),
    web: Template.fromStack(webStack),
  };
}

test('domain stack retains the delegated public hosted zone', () => {
  const { domain } = createTemplates();

  domain.hasResource('AWS::Route53::HostedZone', {
    DeletionPolicy: 'Retain',
    UpdateReplacePolicy: 'Retain',
    Properties: {
      Name: 'cairn.nibuno.dev.',
    },
  });
});

test('web stack protects every application request with Cognito', () => {
  const { web } = createTemplates();

  web.hasResourceProperties('AWS::Cognito::UserPool', {
    AdminCreateUserConfig: {
      AllowAdminCreateUserOnly: true,
    },
    UsernameAttributes: ['email'],
  });
  web.hasResourceProperties('AWS::Cognito::UserPoolClient', {
    GenerateSecret: true,
    AllowedOAuthFlows: ['code'],
    CallbackURLs: ['https://cairn.nibuno.dev/oauth2/idpresponse'],
  });
  web.hasResourceProperties('AWS::ElasticLoadBalancingV2::Listener', {
    Port: 443,
    Protocol: 'HTTPS',
    DefaultActions: Match.arrayWith([
      Match.objectLike({ Type: 'authenticate-cognito' }),
      Match.objectLike({ Type: 'forward' }),
    ]),
  });
});

test('web stack runs one private ARM64 task and contains no database', () => {
  const { web } = createTemplates();

  web.hasResourceProperties('AWS::ECS::TaskDefinition', {
    Cpu: '256',
    Memory: '512',
    RuntimePlatform: {
      CpuArchitecture: 'ARM64',
      OperatingSystemFamily: 'LINUX',
    },
  });
  web.hasResourceProperties('AWS::ECS::Service', {
    DesiredCount: 1,
    DeploymentConfiguration: Match.objectLike({
      DeploymentCircuitBreaker: {
        Enable: true,
        Rollback: true,
      },
    }),
  });
  web.resourceCountIs('AWS::RDS::DBInstance', 0);
  web.resourceCountIs('AWS::EC2::NatGateway', 1);
});
