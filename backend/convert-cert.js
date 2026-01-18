// convert-cert.js
const fs = require("fs");
const path = require("path");

const certPath = path.join(__dirname, "certs/ca.pem");
const certContent = fs.readFileSync(certPath, "utf-8");

// Thay thế newline bằng \n
const envCert = certContent.replace(/\r?\n/g, "\\n");

console.log("📋 Copy this to Render SSL_CERTIFICATE variable:");
console.log("=".repeat(50));
console.log(envCert);
console.log("=".repeat(50));
