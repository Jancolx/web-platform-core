# ExamEdge — Dockerized Deployment on AWS

![Terraform](https://img.shields.io/badge/Terraform-7B42BC?style=flat-square&logo=terraform&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=flat-square&logo=amazonwebservices&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)

A Node.js exam portal containerized with Docker and deployed to AWS using Terraform + GitHub Actions.  
The app was vibe-coded — this repo is about the **DevOps pipeline**, not the application code.

---

## Architecture

```
GitHub Actions
  ├── infra.yml   → Terraform → AWS (ALB, EC2, ASG, ECR, IAM)
  └── app.yml     → Docker Build → Push to ECR
```

**AWS setup:** ALB → Auto Scaling Group (1–2 × t3.micro) → Docker container on EC2  
**State:** Terraform remote backend on S3 (encrypted)

---

## Project Structure

```
├── .github/workflows/
│   ├── infra.yml          # Provision/destroy AWS infra
│   └── app.yml            # Build & push Docker image
├── terraform/
│   ├── main.tf            # Provider, backend, ECR
│   ├── compute.tf         # IAM, EC2 launch template, ASG
│   ├── network.tf         # ALB, target group, listener
│   └── variables.tf       # Region, project name, image tag
├── src/                   # Node.js app (Express)
├── Dockerfile
└── README.md
```

---

## Setup

### GitHub Secrets Required

| Secret                  | What                          |
| ----------------------- | ----------------------------- |
| `AWS_ACCESS_KEY_ID`     | IAM access key                |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key                |
| `BUCKET_NAME`           | S3 bucket for Terraform state |

### Deploy

1. **Infrastructure** — Actions tab → _"1. AWS Infrastructure (Terraform)"_ → Run with `all`
2. **App** — Actions tab → _"2. Build & Deploy App"_ → Run

The infra workflow also supports targeted deploys (`network`, `ECR & EC2`) and `DESTROY ALL`.

### Local Dev

```bash
cd src && npm install && npm run dev     # http://localhost:3000
```

```bash
docker build -t examedge . && docker run -p 80:80 examedge
```

---

## Security Notes

- EC2 only accepts traffic from ALB (no public access)
- IAM role scoped to ECR pull only
- App uses Helmet, CORS whitelist, and rate limiting
- No SSH keys on instances — deploy only through CI/CD
- Terraform state encrypted at rest in S3
