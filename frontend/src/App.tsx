import {socket} from "./socket.ts";
import {useEffect, useState} from "react";

function App() {
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        };
    }, []);

    return (
        <div className="">
            <h1>{socket.id}</h1>
            <h2>{isConnected ? "Connected" : "Disconnected"}</h2>
        </div>
    )
}

export default App
