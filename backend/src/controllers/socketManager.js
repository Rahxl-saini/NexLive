import { Server } from "socket.io";

let connections = {};
let messages = {};   // yaha message -> messages kiya
let timeOnline = {};

const connectToSocket = (server) => {
    const io = new Server(server);

    io.on("connection", (socket) => {

        socket.on("join-call", (path) => {

            if (connections[path] === undefined) {
                connections[path] = [];
            }

            connections[path].push(socket.id);
            timeOnline[socket.id] = Date.now();

            // notify all users in same room
            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit("user-joined", socket.id);
            }

            // old messages send karo
            if (messages[path] !== undefined) {
                for (let a = 0; a < messages[path].length; a++) {
                    io.to(socket.id).emit(
                        "chat-message",
                        messages[path][a].data,
                        messages[path][a].sender,
                        messages[path][a].socketIdSender
                    );
                }
            }

        });
 
        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", (data, sender) => {
            
            const [machingSchema, found] = Object.entries(connections).reduce(([room, isFound], [roomkey, roomValue])=>{
                if(!isFound && roomValue.includes(socket.id)){
                    return [roomkey, true];
                }
                return [room, isFound];
            }, ["", false]);

            if(found === true){
                if(messages[machingRoom]=== undefined){
                    messages[machingRoom] = [];
                }
                messages[machingRoom].push({'sender': sender, 'data': data, 'socketIdSender': socket.id});
                console.log("messages", key, ":", sender, data)

                connections[machingRoom].forEach(elem => {
                    io.to(elem).emit("chat-message", data, sender, socket.id);
                });
            }
        });

        socket.on("disconnect", () => {
            var diffTime = Math.abs(timeOnline[socket.id] - new Date());

            var key

            for(const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))){
                if(v.includes(socket.id)){
                    key = k;

                    for(let a = 0; a < connections[key].length; a++) {
                        io.to(connections[key][a]).emit("user-left", socket.id);
                    }
                    
                    var index = connections[key].indexOf(socket.id);

                    connections[key].splice(index, 1);

                    if(connections[key].length === 0){
                        delete connections[key];
                    }
                }
            }
        });

    });

    return io;
};

export default connectToSocket;
