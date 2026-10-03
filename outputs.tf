output "vm_public_ip" {
  value       = google_compute_address.static_ip.address
  description = "Public static IP of VM"
}

output "ssh_connect_command" {
  value       = "gcloud compute ssh ${google_compute_instance.app_vm.name} --zone=${var.zone} --project=${var.project_id} --tunnel-through-iap"
  description = "Command to connect interactively to the VM via SSH through IAP (no public port 22)"
}

output "ssl_init_command" {
  value       = "gcloud compute ssh ${google_compute_instance.app_vm.name} --zone=${var.zone} --project=${var.project_id} --tunnel-through-iap --command='sudo /opt/${var.name_prefix}/init.sh'"
  description = "Command to run the SSL initialization script on the VM via IAP after DNS is configured"
}