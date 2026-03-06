const fetch = require('node-fetch');
async function test() {
  const loginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST", headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ email: "admin@test.com", password: "password123" }) // or any generic user
  });
  console.log("LOGIN Status:", loginRes.status);
  console.log("LOGIN Body:", await loginRes.text());
}
test();
