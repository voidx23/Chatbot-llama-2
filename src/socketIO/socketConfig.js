import { Server } from 'socket.io'

const configureSocketIO = (httpServer) =>{
    const io = new Server(httpServer);

    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });

        socket.on('chat message', (msg) => {
            console.log('Message from client: ' + msg);
            io.emit('chat message', msg);
        });

       
      
    });
    return io
}

export default configureSocketIO;