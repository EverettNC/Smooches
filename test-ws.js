import WebSocket from 'ws';

const wsBroadcaster = new WebSocket('ws://localhost:8030/ws');
const wsViewer = new WebSocket('ws://localhost:8030/ws');

wsBroadcaster.on('open', () => {
  console.log('[Broadcaster] Connected');
  wsBroadcaster.send(JSON.stringify({ type: 'broadcaster-ready', streamId: 'main-live' }));
});

wsBroadcaster.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  console.log('[Broadcaster] RECV:', msg.type, JSON.stringify(msg).slice(0, 200));
});

wsViewer.on('open', () => {
  console.log('[Viewer] Connected');
  setTimeout(() => {
    wsViewer.send(JSON.stringify({ type: 'viewer-join', streamId: 'main-live', viewerId: 'test-viewer-1' }));
  }, 500);
});

wsViewer.on('message', async (data) => {
  const msg = JSON.parse(data.toString());
  console.log('[Viewer] RECV:', msg.type, JSON.stringify(msg).slice(0, 200));
  
  if (msg.type === 'offer') {
    console.log('[Viewer] Got offer, sending answer + ICE');
    wsViewer.send(JSON.stringify({ 
      type: 'answer', 
      answer: { type: 'answer', sdp: 'mock-answer' },
      streamId: 'main-live',
      viewerId: 'test-viewer-1'
    }));
    setTimeout(() => {
      wsViewer.send(JSON.stringify({
        type: 'ice-candidate',
        candidate: { candidate: 'mock-candidate', sdpMid: '0', sdpMLineIndex: 0 },
        streamId: 'main-live',
        viewerId: 'test-viewer-1'
      }));
    }, 200);
  }
});

wsBroadcaster.on('close', () => console.log('[Broadcaster] WS Closed'));
wsViewer.on('close', () => console.log('[Viewer] WS Closed'));

setTimeout(() => {
  console.log('\n--- TEST COMPLETE ---');
  process.exit(0);
}, 10000);