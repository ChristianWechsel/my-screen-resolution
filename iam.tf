# Account für Betrieb
resource "google_service_account" "vm_custom_sa" {
  account_id   = "${var.name_prefix}-vm-sa"
  display_name = "${var.name_prefix} VM Service Account"
}

resource "google_project_iam_member" "vm_artifact_reader" {
  project = var.project_id
  role    = "roles/artifactregistry.reader"
  member  = "serviceAccount:${google_service_account.vm_custom_sa.email}"
}

resource "google_project_iam_member" "vm_firestore_user" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.vm_custom_sa.email}"
}

resource "google_project_iam_member" "vm_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.vm_custom_sa.email}"
}

resource "google_project_iam_member" "vm_storage_user" {
  project = var.project_id
  role    = "roles/storage.objectUser"
  member  = "serviceAccount:${google_service_account.vm_custom_sa.email}"
}

resource "google_project_iam_member" "vm_token_creator" {
  project = var.project_id
  role    = "roles/iam.serviceAccountTokenCreator"
  member  = "serviceAccount:${google_service_account.vm_custom_sa.email}"
}