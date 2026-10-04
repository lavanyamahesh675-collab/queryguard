const net = require('net');
const WebSocket = require('ws');

// Parse CLI arguments
const args = process.argv.slice(2);
const typeArg = args.find(a => a.startsWith('--type='))?.split('=')[1] || 'bad';

const PROXY_PORT = 5433;
const WS_PORT = 4000;

console.log(`\n\x1b[36m====================================================\x1b[0m`);
console.log(`\x1b[1m\x1b[35m 🚀 QueryGuard Simulation Generator\x1b[0m`);
console.log(`\x1b[36m Mode:\x1b[0m \x1b[33m${typeArg.toUpperCase()}\x1b[0m`);
console.log(`\x1b[36m====================================================\x1b[0m\n`);

/**
 * Build PostgreSQL Wire Protocol Simple Query ('Q') Packet
 */
function buildPostgresQueryPacket(sql) {
  const payload = Buffer.from(sql + '\0', 'utf8');
  const buf = Buffer.alloc(1 + 4 + payload.length);
  buf.writeUInt8(0x51, 0); // ASCII 'Q' (0x51)
  buf.writeInt32BE(4 + payload.length, 1); // Length includes length field itself
  payload.copy(buf, 5);
  return buf;
}

/**
 * Run direct TCP protocol injection onto Proxy Port 5433
 */
function runTcpSimulation() {
  const socket = net.connect({ port: PROXY_PORT, host: 'localhost' }, () => {
    console.log(`\x1b[32m[Simulate TCP]\x1b[0m Connected to QueryGuard Proxy on port ${PROXY_PORT}`);

    if (typeArg === 'bad') {
      console.log(`\x1b[31m[Simulate]\x1b[0m Executing N+1 Explosion Scenario (1 parent + 12 rapid child queries)...`);

      // 1. Parent query
      const parentSql = `SELECT * FROM posts WHERE status = 'published';`;
      socket.write(buildPostgresQueryPacket(parentSql));
      console.log(`\x1b[34m[Parent Query]\x1b[0m ${parentSql}`);

      // 2. 12 rapid child lookups
      let childIndex = 1;
      const interval = setInterval(() => {
        const childSql = `SELECT * FROM comments WHERE post_id = ${childIndex};`;
        socket.write(buildPostgresQueryPacket(childSql));
        console.log(`\x1b[31m[N+1 Child ${childIndex}/12]\x1b[0m ${childSql}`);
        childIndex++;

        if (childIndex > 12) {
          clearInterval(interval);
          setTimeout(() => {
            console.log(`\n\x1b[32m[Simulate]\x1b[0m Traffic burst finished. Check dashboard at http://localhost:3000\n`);
            socket.end();
            process.exit(0);
          }, 300);
        }
      }, 3);

    } else {
      // Good scenario
      console.log(`\x1b[32m[Simulate]\x1b[0m Executing Eager-Loaded JOIN Query Scenario...`);
      const eagerSql = `SELECT p.id, p.title, c.content FROM posts p LEFT JOIN comments c ON p.id = c.post_id WHERE p.status = 'published';`;
      socket.write(buildPostgresQueryPacket(eagerSql));
      console.log(`\x1b[32m[Eager Query]\x1b[0m ${eagerSql}`);

      setTimeout(() => {
        console.log(`\n\x1b[32m[Simulate]\x1b[0m Eager query sent cleanly. Check dashboard at http://localhost:3000\n`);
        socket.end();
        process.exit(0);
      }, 300);
    }
  });

  socket.on('error', (err) => {
    console.log(`\x1b[33m[Simulate TCP Warning]\x1b[0m TCP connection to 5433 refused (${err.message}). Falling back to WebSocket Command mode...`);
    runWsFallback();
  });
}

/**
 * Fallback to WebSocket triggers if TCP socket is not directly accepting
 */
function runWsFallback() {
  const ws = new WebSocket(`ws://localhost:${WS_PORT}`);

  ws.on('open', () => {
    console.log(`\x1b[32m[Simulate WS]\x1b[0m Connected to WebSocket hub on port ${WS_PORT}`);
    const action = typeArg === 'bad' ? 'TRIGGER_DEMO_BURST' : 'TRIGGER_DEMO_EAGER';
    ws.send(JSON.stringify({ action }));
    console.log(`\x1b[35m[Simulate WS]\x1b[0m Sent action command: ${action}`);
    
    setTimeout(() => {
      ws.close();
      process.exit(0);
    }, 500);
  });

  ws.on('error', (err) => {
    console.error(`\x1b[31m[Simulate Error]\x1b[0m Could not connect to proxy or WS server. Ensure 'npm run proxy' is running! Error: ${err.message}`);
    process.exit(1);
  });
}

// Start simulation execution
runTcpSimulation();
