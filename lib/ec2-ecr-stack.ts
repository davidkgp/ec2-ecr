import * as cdk from '@aws-cdk/core';
import { RemovalPolicy, Tags } from '@aws-cdk/core';
import { SimpleEC2 } from './ec2';
import * as ecr from "@aws-cdk/aws-ecr";

export class Ec2EcrStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const ecr_registry = new ecr.Repository(this, "sample_repo", {
      imageScanOnPush: true,
      imageTagMutability: ecr.TagMutability.IMMUTABLE,
      removalPolicy: RemovalPolicy.DESTROY
    });


    Tags.of(ecr_registry).add("Repo","SampleRepo");


    const ec2 = new SimpleEC2(this,"MyECR",{
      ec2InstanceName: 'simple-instance',
      ecrRepo: ecr_registry

    });

    Tags.of(ec2).add("EC2","SimpleEC2");
  }
}
