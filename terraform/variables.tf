variable "aws_region" {
  default = "us-east-1"
}

variable "project_name" {
  default = "web"
}
#tag required for docker image/ecr
variable "image_tag" {
  type    = string
  default = "latest"
}
