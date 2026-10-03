resource "google_compute_instance" "app_vm" {
  name         = "${var.name_prefix}-vm"
  machine_type = "e2-micro"
  zone         = var.zone

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2404-lts-amd64"
      size  = 10
      type  = "pd-standard"
    }
  }

  network_interface {
    network = google_compute_network.custom_vpc.id
    subnetwork = google_compute_subnetwork.custom_subnet.id
    access_config {
      nat_ip = google_compute_address.static_ip.address
    }
  }

  service_account {
    email  = google_service_account.vm_custom_sa.email
    scopes = ["cloud-platform"]
  }

  metadata = {
    user-data = templatefile("${path.module}/cloud-init.yaml", {
      project_id  = var.project_id
      app_name    = var.name_prefix
      domain      = var.domain
      user        = var.user
      location    = var.location

      docker_compose_content = templatefile("${path.module}/docker-compose.yml", {
        project_id  = var.project_id
        location    = var.location
        repository  = var.repository
        app_name    = var.name_prefix
      })

      nginx_conf_content = templatefile("${path.module}/nginx.conf",{
        domain      = var.domain
      })
      
      env_file_content = file("${path.module}/.env")

      init_sh_content = templatefile("${path.module}/init.sh", {
        domain      = var.domain
        email       = var.email
        user        = var.user
        app_name    = var.name_prefix
      })
    })
  }

  tags = ["${var.name_prefix}-web", "allow-ssh-iap"]
}

resource "google_compute_address" "static_ip" {
  name   = "${var.name_prefix}-ip"
  region = var.location
}

