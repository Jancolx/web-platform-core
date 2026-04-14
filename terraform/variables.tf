variable "aws_region" {
  default = "ap-south-1"
}

variable "project_name" {
  default = "web"
}
#tag required for docker image/ecr
variable "image_tag" {
  type    = string
  default = "latest"
}

data "aws_ami" "latest_linux" {
  most_recent = true
  owners      = ["amazon"] # Official Amazon images

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }

  filter {
    name   = "state"
    values = ["available"]
  }
}
