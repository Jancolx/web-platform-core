variable "aws_region" {
  default = "us-east-1"
}

variable "project_name" {
  default = "web"
}

variable "cf_dist_id" {
  description = "Existing CloudFront ID"
  default     = "EMO2YYIZBBT1L"
}
