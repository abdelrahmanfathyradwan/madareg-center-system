const { exec } = require('child_process');
const http = require('http');

const server = exec('node index.js', { env: { ...process.env, PORT: 5001 } });

server.stdout.on('data', (data) => {
  console.log(data);
  if (data.includes('Server running')) {
    setTimeout(() => {
      console.log('Sending first request...');
      http.get('http://localhost:5001/api/dashboard', {
        headers: { Authorization: "Bearer madarej_admin_token_valid" }
      }, (res) => {
        res.on('data', () => {});
        res.on('end', () => {
          console.log('First request done. Sending second request...');
          http.get('http://localhost:5001/api/dashboard', {
            headers: { Authorization: "Bearer madarej_admin_token_valid" }
          }, (res2) => {
            res2.on('data', () => {});
            res2.on('end', () => {
              console.log('Second request done. Exiting.');
              server.kill();
              process.exit(0);
            });
          });
        });
      });
    }, 2000); // give it time to connect to mongo
  }
});

server.stderr.on('data', (data) => console.error(data));
