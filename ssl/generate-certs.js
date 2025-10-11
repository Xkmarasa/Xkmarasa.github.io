const fs = require('fs');
const { execSync } = require('child_process');

// Crear certificados usando Node.js crypto
const crypto = require('crypto');
const forge = require('node-forge');

console.log('🔐 Generando certificados SSL...');

try {
  // Generar clave privada
  const keyPair = forge.pki.rsa.generateKeyPair(2048);
  const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);
  
  // Crear certificado
  const cert = forge.pki.createCertificate();
  cert.publicKey = keyPair.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  
  const attrs = [{
    name: 'commonName',
    value: '93.189.91.62'
  }, {
    name: 'countryName',
    value: 'ES'
  }, {
    shortName: 'ST',
    value: 'Valencia'
  }, {
    name: 'localityName',
    value: 'Valencia'
  }, {
    name: 'organizationName',
    value: 'Mediterranean Blue'
  }];
  
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(keyPair.privateKey);
  
  const certPem = forge.pki.certificateToPem(cert);
  
  // Guardar archivos
  fs.writeFileSync('private.key', privateKeyPem);
  fs.writeFileSync('certificate.crt', certPem);
  
  console.log('✅ Certificados generados exitosamente:');
  console.log('   - private.key');
  console.log('   - certificate.crt');
  console.log('🔒 Certificado válido para: 93.189.91.62');
  
} catch (error) {
  console.error('❌ Error generando certificados:', error.message);
  console.log('💡 Instalando node-forge...');
  
  try {
    execSync('npm install node-forge', { stdio: 'inherit' });
    console.log('✅ node-forge instalado. Ejecuta el script nuevamente.');
  } catch (installError) {
    console.error('❌ Error instalando node-forge:', installError.message);
  }
}
