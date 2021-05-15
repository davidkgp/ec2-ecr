import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as iam from "@aws-cdk/aws-iam";
import { IRepository } from "@aws-cdk/aws-ecr";
import * as path from "path";
import { Asset } from "@aws-cdk/aws-s3-assets";
import { UserData } from "@aws-cdk/aws-ec2";

interface SimpleEC2Props {
  ecrRepo: IRepository;
  ec2InstanceName: string;
}

export class SimpleEC2 extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, ec2props: SimpleEC2Props) {
    super(scope, id);

    const vpc = new ec2.Vpc(this, "VPCSimple", {
      maxAzs: 1,
      subnetConfiguration: [
        {
          // 'subnetType' controls Internet access, as described above.
          subnetType: ec2.SubnetType.PUBLIC,

          name: "Ingress",

          cidrMask: 24,
        },
      ],
    });

    const ecrGetTokenPolicy = new iam.PolicyStatement();
    ecrGetTokenPolicy.addAllResources();
    ecrGetTokenPolicy.addActions(`ecr:GetAuthorizationToken`);

    const ecrReadPolicy = new iam.PolicyStatement();
    ecrReadPolicy.addResources(ec2props.ecrRepo.repositoryArn);
    ecrReadPolicy.addActions(`ecr:GetDownloadUrlForLayer`,`ecr:BatchGetImage`);

    const ec2PolicyDocument = new iam.PolicyDocument();
    ec2PolicyDocument.addStatements(ecrGetTokenPolicy,ecrReadPolicy)


    const role = new iam.Role(this, `${ec2props.ec2InstanceName}-role`, {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
      inlinePolicies:{
        Ec2PolicyDocument:ec2PolicyDocument
      }
    });





    const securityGroup = new ec2.SecurityGroup(
      this,
      `${ec2props.ec2InstanceName}-sg`,
      {
        vpc: vpc,
        allowAllOutbound: true, // will let your instance send outboud traffic
        securityGroupName: `${ec2props.ec2InstanceName}-sg`,
      }
    );

    // lets use the security group to allow inbound traffic on specific ports
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      "Allows SSH access from Internet"
    );

    

    // define a user data script to install & launch our web server
    const userData = UserData.forLinux();

    userData.addCommands(
      "sudo apt-get remove docker docker-engine docker.io containerd runc"
    );
    userData.addCommands("sudo apt-get update");
    userData.addCommands(
      "sudo apt-get -y install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release"
    );
    userData.addCommands(
      "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg"
    );
    userData.addCommands(
      "echo \
      \"deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable\" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null"
    );
    userData.addCommands(
      "sudo apt-get update"
    );
    userData.addCommands(
      "sudo apt-get -y install docker-ce docker-ce-cli containerd.io"
    );

    userData.addCommands(
      "sudo usermod -aG docker $USER"
    );

    

    // Finally lets provision our ec2 instance
    const instance = new ec2.Instance(this, ec2props.ec2InstanceName, {
      keyName: "simple-key",
      vpc: vpc,
      role: role,
      securityGroup: securityGroup,
      instanceName: ec2props.ec2InstanceName,
      instanceType: ec2.InstanceType.of(
        // t2.micro has free tier usage in aws
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      // machineImage: ec2.MachineImage.latestAmazonLinux({
      //   generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      //   cpuType: ec2.AmazonLinuxCpuType.X86_64,
      // })
      //https://cloud-images.ubuntu.com/locator/ec2/
      machineImage: ec2.MachineImage.genericLinux({
        "eu-central-1": "ami-0423663b8ab29a638",
      }),
      userData: userData,
    });



    // cdk lets us output prperties of the resources we create after they are created
    // we want the ip address of this new instance so we can ssh into it later
    new cdk.CfnOutput(this, `${ec2props.ec2InstanceName}-output`, {
      value: instance.instancePublicIp,
    });
  }
}
