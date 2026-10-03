variable "project_id" {
  type        = string
  description = "GCP Projekt-ID"
}

variable "location" {
  type        = string
  description = "GCP Region"
}

variable "zone" {
  type        = string
  description = "GCP Zone"
}

variable "name_prefix" {
  type        = string
  description = "Prefix used for infrastructure resource names."
}

variable "repository" {
  type        = string
  description = "Name des google cloud Repositories."
}

variable "cors_allowed_origins" {
  type        = list(string)
  description = "Origins allowed to access the Cloud Storage bucket through CORS."
}

variable "domain" {
  type        = string
  description = "Serverdomain"
}

variable "user" {
  type        = string
  description = "Username"
}

variable "email" {
  type        = string
  description = "Email"
}
