import WebSocket from 'ws';

console.log('=== TEST 1: Viewer joins ===');
const ws1 = new WebSocket('ws://127.0.0.1:8030/ws');
ws1.on('open', () => {
  console.log('[WS1] Connected, sending viewer-join');
  ws1.send(JSON.stringify({ type: 'viewer-join', streamId: 'main-live', viewerId: 'viewer-test-1' }));
});
ws1.on('message', (data) => {
  const msg = JSON.parse(data);
  console.log('[WS1] RECV:', JSON.stringify(msg));
});
ws1.on('close', (code) => console.log('[WS1] Closed:', code));
ws1.on('error', (e) => console.log('[WS1] Error:', e.message));

setTimeout(() => {
  console.log('=== TEST 2: Broadcaster joins ===');
  const ws2 = new WebSocket('ws://127.0.0.1:8030/ws');
  ws2.on('open', () => {
    console.log('[WS2] Connected, sending broadcaster-ready');
    ws2.send(JSON.stringify({ type: 'broadcaster-ready', streamId: 'main-live' }));
  });
  ws2.on('message', (data) => {
    const msg = JSON.parse(data);
    console.log('[WS2] RECV:', JSON.stringify(msg));
  });
  ws2.on('close', (code) => console.log('[WS2] Closed:', code));

  setTimeout(() => process.exit(0), 5000);
}, 2000);

setTimeout(() => process.exit(0), 15000);