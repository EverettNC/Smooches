import WebSocket from 'ws';

console.log('=== TEST: Full signaling flow (extended) ===');

let viewerId = 'test-viewer-1';
let broadcasterReady = false;
let viewerGotOffer = false;

const ws1 = new WebSocket('ws://127.0.0.1:8030/ws');
ws1.on('open', () => {
  console.log('[VIEWER] Connected, sending viewer-join');
  ws1.send(JSON.stringify({ type: 'viewer-join', streamId: 'main-live', viewerId }));
});
ws1.on('message', (data) => {
  const msg = JSON.parse(data);
  console.log('[VIEWER] RECV:', JSON.stringify(msg));
  if (msg.type === 'offer') {
    console.log('[VIEWER] Got offer, sending answer with viewerId');
    ws1.send(JSON.stringify({ 
      type: 'answer', 
      answer: msg.offer, 
      streamId: 'main-live', 
      viewerId: 'viewer-test-1'  // Send viewerId back
    }));
  } else if (msg.type === 'broadcaster-ready') {
    console.log('[VIEWER] Got broadcaster-ready');
  } else if (msg.type === 'ice-candidate') {
    console.log('[VIEWER] Got ICE candidate');
  }
});
ws1.on('close', (code) => console.log('[VIEWER] Closed:', code));
ws1.on('error', (e) => console.log('[VIEWER] Error:', e.message));

setTimeout(() => {
  console.log('\n=== Broadcaster joins ===');
  const ws2 = new WebSocket('ws://127.0.0.1:8030/ws');
  ws2.on('open', () => {
    console.log('[BROADCASTER] Connected, sending broadcaster-ready');
    ws2.send(JSON.stringify({ type: 'broadcaster-ready', streamId: 'main-live' }));
  });
  ws2.on('message', (data) => {
    const msg = JSON.parse(data);
    console.log('[BROADCASTER] RECV:', JSON.stringify(msg));
    if (msg.type === 'viewer-connected') {
      console.log('[BROADCASTER] Viewer connected:', msg.viewerId, '- sending offer');
      ws2.send(JSON.stringify({ 
        type: 'offer', 
        offer: { type: 'offer', sdp: 'mock-sdp' }, 
        streamId: 'main-live', 
        viewerId: msg.viewerId 
      }));
    } else if (msg.type === 'answer') {
      console.log('[BROADCASTER] Got answer for viewer:', msg.viewerId);
    } else if (msg.type === 'ice-candidate') {
      console.log('[BROADCASTER] Got ICE candidate for viewer:', msg.viewerId || 'unknown');
    }
  });
  ws2.on('close', (code) => console.log('[BROADCASTER] Closed:', code));
  ws2.on('error', (e) => console.log('[BROADCASTER] Error:', e.message));
}, 1000);

setTimeout(() => process.exit(0), 20000);