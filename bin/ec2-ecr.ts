#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { Ec2EcrStack } from '../lib/ec2-ecr-stack';

const app = new cdk.App();
new Ec2EcrStack(app, 'Ec2EcrStack');
