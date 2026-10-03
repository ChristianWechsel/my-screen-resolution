resource "google_compute_network" "custom_vpc" {
  name                    = "${var.name_prefix}-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "custom_subnet" {
  name          = "${var.name_prefix}-subnet-ew3"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.location
  network       = google_compute_network.custom_vpc.id

  private_ip_google_access = true
}

resource "google_compute_firewall" "allow_web" {
  name    = "allow-http-https"
  network = google_compute_network.custom_vpc.id

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["${var.name_prefix}-web"]
}

resource "google_compute_firewall" "allow_iap_ssh" {
  name    = "allow-ssh-via-iap"
  network = google_compute_network.custom_vpc.id

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["35.235.240.0/20"]

  target_tags = ["allow-ssh-iap"]
}