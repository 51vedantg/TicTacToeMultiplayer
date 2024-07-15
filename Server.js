
const { createServer } = require("http");
const { platform } = require("process");


const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: "http://localhost:5173/",
});

const allUsers = {};
const allRooms = [];


io.on("connection", (socket) => {

  //console.log(socket);
  //console.log("New user joined the socket : " + socket.id);

  allUsers[socket.id] = {
    socket: socket,
    online: true,
   
    
  }

  socket.on("request_to_play", (data) => {


    const currentUser = allUsers[socket.id]
    currentUser.playerName = data.playerName;

    

    let opponentPlayer=null;
    for (const key in allUsers) {
      const user = allUsers[key]
      if (user.online && !user.playing && socket.id !== key ) {
        opponentPlayer = user;
       
        break;
      }
    }
    console.log(opponentPlayer)

      if (opponentPlayer) {
      
        currentUser.playing = true;
        opponentPlayer.playing = true;

        allRooms.push({
         
          player2 : currentUser,
          player1 : opponentPlayer,
        });
    
        opponentPlayer.socket.emit("Opponent_found",{
          opponentName :currentUser.playerName,
          playingAs: "circle"
      });

        currentUser.socket.emit("Opponent_found",{
            opponentName :opponentPlayer.playerName,
            playingAs: "cross"

        });

       

        opponentPlayer.socket.on("playerMoveFromClient",(data) =>{
          currentUser.socket.emit("playerMoveFromServer",{
            ...data
          });
      
        });
      

      currentUser.socket.on("playerMoveFromClient",(data) =>{

        opponentPlayer.socket.emit("playerMoveFromServer",{
         ...data
        });
    
      });

     
    


        console.log("Opponent found");

        opponentPlayer.socket.on('requestRematch', () => {
          currentUser.socket.emit('rematchRequest');
        });
  
        currentUser.socket.on('requestRematch', () => {
          opponentPlayer.socket.emit('rematchRequest');
        });
  
        opponentPlayer.socket.on('acceptRematch', () => {
          currentUser.socket.emit('startNewGame');
          opponentPlayer.socket.emit('startNewGame');
        });
  
        currentUser.socket.on('acceptRematch', () => {
          currentUser.socket.emit('startNewGame');
          opponentPlayer.socket.emit('startNewGame');
        });
  
      }

      else {
       
        currentUser.socket.emit("Opponent_not_found") ;
        console.log("Opponent not found");
      }
    
  });

  socket.on('disconnect', function () {
    // socket[socket.id] = {
    //   socket: { ...socket, online: false },
    //   online: true,

    const currentUser = allUsers[socket.id];
    currentUser.online = false;
    currentUser.playing = false;

    // for(let i=0;i<allRooms.length;i++)
    //   {
    //     const [player1, player2] = allRooms[i];
    //     if(player1.socket.id===socket.id)
    //       {
    //           player2.socket.emit("opponentLeftMatch");
    //           break;
    //       }

    //       if(player2.socket.id===socket.id)
    //         {
    //           player1.socket.emit("opponentLeftMatch");
    //           break;
    //         }
    //   }

    });
  });




httpServer.listen(3000);







