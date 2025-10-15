export default function WebSocketConnector() {
  //! creating a new websocket connection
  const websocket = new WebSocket(
    "ws://127.0.0.1:8000/ws/conversation/e6b50a41-bc8a-481f-95eb-0fb0a6addad4/"
  );
  //!When connection opens
  websocket.onopen = function (event) {
    console.log("Connected to WebSocket server");
    // we can send a message right away
    // websocket.send(JSON.stringify({ message: "Hello from client!" }));
  };
  //! When recieving a message :
  websocket.onmessage = function (event) {
    const data = event.data;
    console.log(`Message received + ${data}`);
  };
  //! Handle errors
  websocket.onerror = function (error) {
    console.error("WebSocket error:", error);
  };

  //! When connection closes
  websocket.onclose = function (event) {
    console.log("WebSocket closed:", event);
  };
  return (
    <div className="ws-conainter h-[200px] w-full bg-blue-800 flex justify-center items-center">
      <h1 className="text text-xl font-bold text-white">
        websockets connecion
      </h1>
    </div>
  );
}
