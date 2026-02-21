# Debug script to see what the OS reports for Bluetooth and WiFi
Write-Host "--- WiFi Interfaces ---"
netsh wlan show interfaces

Write-Host "`n--- Bluetooth Devices (All) ---"
Get-PnpDevice -Class Bluetooth | Select-Object FriendlyName, Status, Present, InstanceId | Format-List

Write-Host "`n--- Bluetooth Devices (Filtered like Agent) ---"
$filtered = Get-PnpDevice -Class Bluetooth | Where-Object { $_.Status -eq 'OK' -and $_.Present -and $_.InstanceId -like 'BTHENUM*' }
Write-Host "Count: $($filtered.Count)"
$filtered | Select-Object FriendlyName, InstanceId | Format-List
