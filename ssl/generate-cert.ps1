# Script para generar certificados SSL autofirmados
$cert = New-SelfSignedCertificate -DnsName "93.189.91.62", "localhost" -CertStoreLocation "cert:\LocalMachine\My" -KeyLength 2048 -KeyAlgorithm RSA -HashAlgorithm SHA256

# Exportar certificado
$certPath = "certificate.crt"
$keyPath = "private.key"

# Exportar certificado público
$certBytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
[System.IO.File]::WriteAllBytes($certPath, $certBytes)

# Exportar clave privada
$privateKey = $cert.PrivateKey
$keyBytes = $privateKey.ExportCspBlob($true)
[System.IO.File]::WriteAllBytes($keyPath, $keyBytes)

Write-Host "Certificados generados:"
Write-Host "   - $certPath"
Write-Host "   - $keyPath"
Write-Host "Certificado valido para: 93.189.91.62 y localhost"