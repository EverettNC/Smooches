import WebSocket from 'ws';

// Test the full WebRTC signaling flow

const wsBroadcaster = new WebSocket('ws://localhost:8030/ws');
const wsViewer = new WebSocket('ws://localhost:8030/ws');

let broadcasterGotViewerConnected = false;
let viewerGotOffer = false;
let broadcasterGotAnswer = false;
let iceCount = 0;

wsBroadcaster.on('open', () => {
  console.log('[Broadcaster] Connected');
  wsBroadcaster.send(JSON.stringify({ type: 'broadcaster-ready', streamId: 'main-live' }));
});

wsBroadcaster.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  console.log('[Broadcaster] RECV:', msg.type);
  
  if (msg.type === 'viewer-connected' && !broadcasterGotViewerConnected) {
    broadcasterGotViewerConnected = true;
    console.log('[Broadcaster] Got viewer-connected, creating offer...');
    // Simulate creating offer and sending it
    wsBroadcaster.send(JSON.stringify({
      type: 'offer',
      offer: { type: 'offer', sdp: 'mock-offer-sdp' },
      viewerId: msg.viewerId,
      streamId: 'main-live'
    }));
  } else if (msg.type === 'answer') {
    broadcasterGotAnswer = true;
    console.log('[Broadcaster] Got answer from viewer');
  } else if (msg.type === 'ice-candidate') {
    iceCount++;
    console.log('[Broadcaster] RECV ice-candidate from viewer');
  }
});

wsViewer.on('open', () => {
  console.log('[Viewer] Connected');
  setTimeout(() => {
    wsViewer.send(JSON.stringify({ type: 'viewer-join', streamId: 'main-live', viewerId: 'test-viewer-1' }));
  }, 300);
});

wsViewer.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  console.log('[Viewer] RECV:', msg.type);
  
  if (msg.type === 'broadcaster-ready' && !viewerGotOffer) {
    // Already sent viewer-join, wait for offer
  } else if (msg.type === 'offer' && !viewerGotOffer) {
    viewerGotOffer = true;
    console.log('[Viewer] Got offer, sending answer...');
    wsViewer.send(JSON.stringify({
      type: 'answer',
      answer: { type: 'answer', sdp: 'mock-answer-sdp' },
      streamId: 'main-live',
      viewerId: 'test-viewer-1'
    }));
    // Send ICE candidate
    setTimeout(() => {
      wsViewer.send(JSON.stringify({
        type: 'ice-candidate',
        candidate: { candidate: 'mock-candidate', sdpMid: '0', sdpMLineIndex: 0 },
        streamId: 'main-live',
        viewerId: 'test-viewer-1'
      }));
    }, 200);
  } else if (msg.type === 'ice-candidate') {
    iceCount++;
    console.log('[Viewer] RECV ice-candidate from broadcaster');
  }
});

wsBroadcaster.on('close', () => console.log('[Broadcaster] WS Closed'));
wsViewer.on('close', () => console.log('[Viewer] WS Closed'));

setTimeout(() => {
  console.log('\n--- FLOW SUMMARY ---');
  console.log('Broadcaster got viewer-connected:', broadcasterGotViewerConnected);
  console.log('Viewer got offer:', viewerGotOffer);
  console.log('Broadcaster got answer:', broadcasterGotAnswer);
  console.log('ICE candidates exchanged:', iceCount);
  console.log('\n--- TEST COMPLETE ---');
  process.exit(0);
}, 8000);