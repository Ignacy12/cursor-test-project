const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head><title>Cursor Test Project</title></head>
      <body style="font-family: system-ui; max-width: 600px; margin: 80px auto; padding: 0 20px;">
        <h1>It works!</h1>
        <p>Your Mac dev setup is running correctly.</p>
        <ul>
          <li>Node.js: ${process.version}</li>
          <li>Project: cursor-test-project</li>
          <li>Folder: ~/Developer/cursor-test-project</li>
        </ul>
        <p>Next: edit this page with Cursor Agent and push to GitHub.</p>
      </body>
    </html>
  `);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
