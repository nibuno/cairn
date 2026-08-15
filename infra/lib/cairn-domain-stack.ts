import * as cdk from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

export class CairnDomainStack extends cdk.Stack {
  public readonly hostedZone: route53.PublicHostedZone;

  public constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.hostedZone = new route53.PublicHostedZone(this, 'HostedZone', {
      zoneName: 'cairn.nibuno.dev',
      comment: 'Delegated from the nibuno.dev Cloudflare zone',
    });
    this.hostedZone.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    new cdk.CfnOutput(this, 'HostedZoneId', {
      value: this.hostedZone.hostedZoneId,
      description: 'Route 53 hosted zone ID for cairn.nibuno.dev',
    });

    new cdk.CfnOutput(this, 'NameServers', {
      value: cdk.Fn.join(',', this.hostedZone.hostedZoneNameServers ?? []),
      description: 'Add these four NS records to Cloudflare with the name cairn',
    });
  }
}
