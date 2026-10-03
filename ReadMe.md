# Express TypeScript Backend for Google Cloud

A production-ready TypeScript Express backend application pre-configured with strict TypeScript compilation, Jest test suites, containerization (Docker & Docker Compose), automated CI/CD via Google Cloud Build, and full infrastructure provisioning using Terraform on Google Cloud Platform (GCP).

---

## Features

- **TypeScript with ESM**: Modern ES modules setup with strict compiler checks (`tsconfig.json`, `tsconfig.prod.json`, `tsconfig.test.json`).
- **Express & Security Baseline**: Hardened with Helmet security headers, proxy trust configuration, JSON / URL-encoded body parsing, structured logging, and static frontend asset delivery (`public/`).
- **GCP Services Integration with Local Adapters**:
  - **Firestore**: Native Firestore database in production, fast in-memory adapter for local development and testing.
  - **Cloud Storage**: Google Cloud Storage bucket with CORS in production, in-memory storage adapter for local testing.
  - **Secret Manager**: Secure runtime secret and configuration access.
  - **Session Management**: Session store with Firestore adapter for production and in-memory adapter for development.
- **Containerization & Nginx Reverse Proxy**:
  - Multi-stage `Dockerfile` (`node:24-slim`) with non-root security.
  - `docker-compose.yml` orchestrating the Express server and an Nginx reverse proxy.
  - Nginx pre-configured with rate limiting, SSL/TLS termination, and automated Let's Encrypt / Certbot certificate provisioning.
- **Infrastructure as Code (Terraform)**:
  - Assumes an existing GCP project provisioned with the `server-infrastructure` template (which enables APIs and shared services).
  - Compute Engine VM (`e2-micro`) with Ubuntu 24.04 LTS and automated bootstrapping via `cloud-init.yaml`.
  - Custom VPC and dedicated subnet with firewall rules (HTTP 80, HTTPS 443, IAP SSH 22).
  - Dedicated IAM service accounts and least-privilege role bindings.
  - Hardened SSH access exclusively via Google Identity-Aware Proxy (IAP) without public port 22 exposure.
- **Automated CI/CD (Cloud Build)**: Pre-configured `cloudbuild.yaml` with dependency audits (`npm audit`), test runs, multi-stage Docker build, and automated push to GCP Artifact Registry.
- **Jest Test Framework**: Separated unit testing (`*.test.unit.ts`) and integration testing (`*.test.int.ts`).

---

## Project Structure

```text
├── bin/
│   └── clean.sh                 # Cleans dist/ build outputs
├── public/                      # Static frontend assets
│   ├── css/
│   ├── js/
│   └── index.html
├── src/
│   ├── container.ts             # Dependency injection container & service wiring
│   ├── index.ts                 # Application entry point & lifecycle
│   ├── server.ts                # Express application factory & middleware
│   ├── core/                    # Environment variables, error handling, secrets
│   ├── database/                # Firestore & in-memory database adapters
│   ├── middleware/              # Request logging and custom middleware
│   ├── routes/                  # Express route handlers
│   ├── storage/                 # Cloud Storage & in-memory storage adapters
│   └── integration/             # Integration tests
├── cloud-init.yaml              # Cloud-init configuration for VM bootstrapping
├── cloudbuild.yaml              # Cloud Build CI/CD pipeline
├── compute.tf                   # Compute Engine VM and static IP
├── docker-compose.yml           # Docker Compose definition (Server + Nginx)
├── Dockerfile                   # Multi-stage production container build
├── iam.tf                       # Service accounts and IAM role bindings
├── init.sh                      # Remote script to acquire SSL & start containers
├── jest.config.mjs              # Jest project configuration
├── nginx.conf                   # Nginx reverse proxy, rate limiting & SSL
├── outputs.tf                   # Terraform output values (IP, IAP SSH & SSL command)
├── provider.tf                  # Terraform Google provider config
├── terraform.tfvars             # Terraform variables (pre-populated by generator)
├── tsconfig.json                # Base TypeScript compiler options
├── tsconfig.prod.json           # Production build options
├── tsconfig.test.json           # Test build options
├── variables.tf                 # Terraform variable definitions
└── vpc.tf                       # Custom VPC, subnet, and firewall rules
```

---

## Getting Started

### 1. Install Dependencies

```shell
npm install
```

### 2. Local Development

Start the development server with live reload:

```shell
npm run dev
```

In development mode (`NODE_ENV=development`), the application automatically uses in-memory mock adapters for Firestore, Cloud Storage, and sessions, enabling local development without active GCP credentials.

### 3. Review Configuration

Configuration values are saved to `.env`, `terraform.tfvars`, and `.npmrc`. These values should be filled using the outputs produced by your baseline **`server-infrastructure`** Terraform run (`terraform output`):

- **`terraform.tfvars`**:
  - `project_id`: From `server-infrastructure` output `project_id`.
  - `location`: From `server-infrastructure` output `location` (e.g. `europe-west3`).
  - `zone`: From `server-infrastructure` output `zone` (e.g. `europe-west3-a`).
  - `repository`: From `server-infrastructure` output `docker_repository` (`docker-repo`).
  - `name_prefix`, `domain`, `user`, `email`, `cors_allowed_origins`: Server-specific parameters.
- **`.env`**:
  - `GOOGLE_PROJECT_ID`: From `server-infrastructure` output `project_id`.
  - `BUCKET_NAME`: From `server-infrastructure` output `storage_bucket_name`.
  - `PORT`, `IS_DOCKER`, `APP_NAME`, `GOOGLE_CLIENT_ID`: Server-specific runtime parameters.
- **`.npmrc`** (if using private artifact packages):
  - Uses the `location` and `project_id` matching your GCP infrastructure.

> **Security Note:** `.env` and `terraform.tfvars` contain sensitive configuration and are excluded by `.gitignore`. Do not commit these files to Git.

### 4. Deploy Infrastructure (Terraform)

#### Prerequisites

This template requires an existing GCP project provisioned with the **`server-infrastructure`** baseline template. Ensure that:

1. `server-infrastructure` has been applied for your GCP project (APIs, Firestore, Artifact Registry, etc. are ready).
2. Your local `gcloud` CLI is logged in and configured:

   ```shell
   gcloud auth login
   gcloud auth application-default login
   ```

3. Your GCP user account has permission to access VMs via Identity-Aware Proxy (IAP): `roles/iap.tunnelResourceAccessor` and `roles/compute.instanceAdmin.v1` (or `roles/compute.osLogin`).

#### Provisioning

Run Terraform to create the VPC, static IP, VM, and IAM service accounts:

```shell
terraform init
terraform apply
```

After Terraform successfully finishes, check the outputs:

- **`vm_public_ip`**: The public static IPv4 address reserved for your server.
- **`ssh_connect_command`**: The `gcloud` command to connect to the VM via IAP SSH.
- **`ssl_init_command`**: The remote execution command to fetch the SSL certificate and start the app.

---

### 5. DNS Configuration & SSL / Container Startup

Because Let's Encrypt requires domain verification on Port 80 before issuing a certificate, follow these steps:

#### Step 1: Configure DNS A-Record

In your DNS provider (e.g. Cloudflare, Route53, Namecheap):

- Create an **A-Record** pointing your domain (e.g. `api.example.com`) to the IP address from `vm_public_ip`.
- If using Cloudflare, make sure the proxy status is set to **DNS only (grey cloud)** during initial certificate provisioning, or set SSL/TLS mode to "Full".

#### Step 2: Initialize SSL and Start Application

Run the command generated in Terraform output `ssl_init_command` directly from your local terminal:

```shell
gcloud compute ssh <vm-name> --zone=<zone> --project=<project-id> --tunnel-through-iap --command="sudo /opt/<app-name>/init.sh"
```

This command runs [init.sh](init.sh) on the VM via secure IAP tunnel without exposing SSH port 22 to the public internet:

1. Acquires a Let's Encrypt TLS certificate via `certbot certonly --standalone`.
2. Starts the Docker Compose stack (Express application + Nginx reverse proxy).

#### Step 3: Interactive SSH Access (Optional)

To connect interactively to the VM without opening port 22 to the public internet:

```shell
gcloud compute ssh <vm-name> --zone=<zone> --project=<project-id> --tunnel-through-iap
```

Once connected, you can inspect logs and Docker status:

```shell
# View cloud-init bootstrap progress
sudo tail -f /var/log/cloud-init-output.log

# Check running containers
sudo docker ps

# Follow container logs
cd /opt/<app-name>
sudo docker compose logs -f
```

---

## Development Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the server in development mode with hot-reloading (`tsx watch`). |
| `npm run build` | Compiles TypeScript using `tsconfig.json` into `dist/`. |
| `npm run build-prod` | Performs a clean production build (`tsconfig.prod.json`). |
| `npm start` | Starts the compiled production application (`node dist/index.js`). |
| `npm run debug` | Starts Node.js with the debugging inspector enabled (`--inspect-brk`). |
| `npm test` | Runs the full Jest test suite (unit + integration). |
| `npm run test:unit` | Runs only unit tests (`*.test.unit.ts`). |
| `npm run test:int` | Runs only integration tests (`*.test.int.ts`). |
| `npm run clean` | Deletes build outputs in `dist/`. |

---

## CI/CD & Deployment Workflow

The included [cloudbuild.yaml](cloudbuild.yaml) pipeline automates testing and container deployment:

1. **Vulnerability Audit**: Runs `npm audit --audit-level=high`.
2. **Authentication & Dependencies**: Authenticates with Artifact Registry via `google-artifactregistry-auth` and runs `npm ci`.
3. **Automated Testing**: Runs `npm test` across all test suites.
4. **Container Build & Tag**: Builds the production Docker image and tags it with both the version from `package.json` and `latest`.
5. **Registry Deployment**: Pushes the Docker image to your private GCP Artifact Registry Docker repository.

---

## License

[MIT](LICENSE)

> **Note:** Update the [LICENSE](LICENSE) file manually with the current year and your name or organization (replace `<YEAR>` and `<AUTHOR_OR_ORGANIZATION>`).
