# Main setup
provider "aws" {
  region  = "us-east-1"
  profile = "roleawsprod"
}

provider "aws" {
  alias   = "root"
  region  = "us-east-1"
  profile = "default" # default is root
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "3.23.0"
    }
  }

  backend "s3" {
    bucket  = "awsprod-infrastructure"
    key     = "terraform-state/kontent_custom.tfstate"
    region  = "us-east-1"
    profile = "roleawsprod"
  }
}

locals {
  name = "kontent-custom-${data.aws_caller_identity.current.account_id}"
  tags = {
    "app" = "kontent-custom-element"
    "project" = "next-arthrex"
  }
}

data "aws_caller_identity" "current" {}

data "aws_iam_policy_document" "kontent_custom_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.kontent_custom_bucket.arn}/*"]

    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
  }
}

resource "aws_s3_bucket_policy" "kontent_custom_bucket_policy" {
  bucket = aws_s3_bucket.kontent_custom_bucket.id
  policy = data.aws_iam_policy_document.kontent_custom_policy.json
}

resource "aws_s3_bucket" "kontent_custom_bucket" {
  bucket = local.name
  acl    = "public-read"
  tags   = local.tags
}

output "bucket" {
  value       = aws_s3_bucket.kontent_custom_bucket.id
  description = "Arthrex Kontent.ai Custom Element - Production"
  depends_on  = [aws_s3_bucket.kontent_custom_bucket]
}
