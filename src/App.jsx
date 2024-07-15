import React, { useEffect, useState } from 'react'
import './App.css'
import Square from './Square/Square'
import io from 'socket.io-client'
import Swal from 'sweetalert2'


const renderFrom = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
]


let c = 0;
let winner = ''


const App = () => {
  const [gameState, setGameState] = useState(renderFrom);
  const [currentPlayer, setCurrentPlayer] = useState('circle');
  const [finishedState, setFinishedState] = useState(false);
  const [finishedArrayState, setFinishedArrayState] = useState([]);
  const [playOnline, setPlayOnline] = useState(false);
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState(null);
  const [opponentName, setOpponentName] = useState(null);
  const [playingAs , setPlayingAs] = useState(null)
  const [isClick , setIsClick] = useState(false);



  const takePlayerName = async () => {
    const result = await Swal.fire({
      
      title:" Enter the Player Name " ,
      input: "text",
      showCancelButton: true,
      customClass: {
        popup: 'my-custom-font' // Apply custom CSS class to the popup
      },
      inputValidator: (value) => {
        if (!value) {
          return "Plaese give your name";

        }
      }
    });

    return result;
  }

  const checkWinner = () => {

    for (let row = 0; row < gameState.length; row++) {
      if (gameState[row][0] === gameState[row][1] && gameState[row][0] === gameState[row][2]) {
        setFinishedArrayState([row * 3 + 0, row * 3 + 1, row * 3 + 2]);
        return gameState[row][0];

      }



    }

    for (let row = 0; row < gameState.length; row++) {

      if (gameState[0][row] === gameState[1][row] && gameState[0][row] === gameState[2][row]) {
        setFinishedArrayState([0 * 3 + row, 1 * 3 + row, 2 * 3 + row]);
        return gameState[0][row];
      }



    }

    if (gameState[0][0] === gameState[1][1] && gameState[0][0] === gameState[2][2]) {
      setFinishedArrayState([0, 4, 8])
      return gameState[0][0];
    }

    if (gameState[0][2] === gameState[1][1] && gameState[0][2] === gameState[2][0]) {
      setFinishedArrayState([2, 4, 6])
      return gameState[0][2];
    }


    const isDraw = gameState.flat().every((e) => {
      if (e === 'circle' || e === 'cross') return true;
    }
    );

    if (isDraw) return 'draw';

    return null;

  };



  useEffect(() => {
    const winner = checkWinner();

    if (winner == 'draw') {
      // console.log(winner);
    }
    if (winner) {
      setFinishedState(winner);

    }
   
  },

    [gameState]);

 



    socket?.on("playerMoveFromServer",(data) => {

        const id = data.state.id;
        setGameState((prevState)=>{
        let newState = [...prevState];
        const r = Math.floor(id/3)
        const c = id%3;
        newState[r][c] = data.state.sign;
        return newState;

      });
      setCurrentPlayer(data.state.sign === 'circle' ? 'cross' : 'circle');
   })

  socket?.on('connect', function () {

    setPlayOnline(true);


  });




  socket?.on('Opponent_not_found', function () {

    setOpponentName(false);


  });

  socket?.on('Opponent_found', function (data) {
    setPlayingAs(data.playingAs);
    setOpponentName(data.opponentName);
   
  });




  async function playOnlineClick() {

    const result = await takePlayerName();
    if (!result.isConfirmed) {
      return;
    }
    const username = result.value;
    setPlayerName(username);


    const newSocket = io('http://localhost:3000', {
      autoConnect: true
    });

    newSocket?.emit("request_to_play", {
      playerName: username
    });
    setSocket(newSocket);
  }

  if (!playOnline) {
    return (
      <div className='main-div'>
        <button onClick={playOnlineClick} className='startButton'>
          Play With Friends
        </button>
      </div>
    );
  }

  function showState() {

     setIsClick(!isClick);
  }

  
  
  if(playOnline && !opponentName)
    {
      return(
        <div className='waiting'>
          <div className='waiting1'> </div>


        </div>
       
      );
       
    }
    if(!isClick)
      {
        return <div className='showSign'>  <h2>{playerName} : {currentPlayer===playingAs ? "Circle" : "Cross"  }</h2><h2>{opponentName} : {playingAs ==="circle" ? "Cross" : "Circle"}</h2> 
        <button className="isButton" onClick={showState}> Let's Start </button></div>
      }

  return (
    <div className='mainDiv'>

      <div className='move-detection'>
        <div className= {`left ${currentPlayer === playingAs ? 'current-move-' + currentPlayer : ''}`} >{playerName} </div>
        <div className={`right ${currentPlayer !== playingAs ? 'current-move-' + currentPlayer : ''}`}> {opponentName} </div>
      </div>


      <div>

        <h1 className='game-heading water-background'>
          Tic Tac Toe
        </h1>

        <div className='square-wrapper'>
          {
            gameState.map((arr, r) =>

              arr.map((e, c) => {
                return <Square
                   gameState={gameState}
                   playingAs={playingAs}
                  socket = {socket}
                  finishedArrayState={finishedArrayState}
                  finishedState={finishedState}
                  currentPlayer={currentPlayer}
                  setCurrentPlayer={setCurrentPlayer}
                  setGameState={setGameState}
                  id={r * 3 + c}
                  key={r * 3 + c}
                  currentElement={e}
                />;

              })

            )
          }

        </div>



      </div>
      
       

     
      {finishedState && finishedState !== 'draw' ?  playingAs === finishedState   ? <p className='opponentState'>  {"You won the game." } </p> : <p className='opponentState' > { "Opponent won the game." }</p> : '' }


      {finishedState && finishedState === 'draw' ? <p className='opponentState'>Fuck-Off, No one wins the match</p> : ''}


      {opponentName &&!finishedState ? <p className='opponentState'>You are playing against {opponentName} </p> : ''}
      

      {opponentName &&  finishedState ? <p className='opponentState'>You are playing against {opponentName} </p> : ''}



    </div>
  )
}
export default App






















// import React, { useEffect, useState } from 'react';
// import './App.css';
// import Square from './Square/Square';
// import io from 'socket.io-client';
// import Swal from 'sweetalert2';

// const initialGameState = [
//   ['1', '2', '3'],
//   ['4', '5', '6'],
//   ['7', '8', '9'],
// ];

// const App = () => {
//   const [gameState, setGameState] = useState(initialGameState);
//   const [currentPlayer, setCurrentPlayer] = useState('circle');
//   const [finishedState, setFinishedState] = useState(false);
//   const [finishedArrayState, setFinishedArrayState] = useState([]);
//   const [playOnline, setPlayOnline] = useState(false);
//   const [socket, setSocket] = useState(null);
//   const [playerName, setPlayerName] = useState(null);
//   const [opponentName, setOpponentName] = useState(null);
//   const [playingAs, setPlayingAs] = useState(null);
//   const [isClick, setIsClick] = useState(false);
//   const [rematch, setRematch] = useState(false);

//   const takePlayerName = async () => {
//     const result = await Swal.fire({
//       title: "Enter the Player Name",
//       input: "text",
//       showCancelButton: true,
//       customClass: {
//         popup: 'my-custom-font'
//       },
//       inputValidator: (value) => {
//         if (!value) {
//           return "Please give your name";
//         }
//       }
//     });
//     return result;
//   };

//   const checkWinner = () => {
//     for (let row = 0; row < gameState.length; row++) {
//       if (gameState[row][0] === gameState[row][1] && gameState[row][0] === gameState[row][2] && gameState[row][0] !== '') {
//         setFinishedArrayState([row * 3 + 0, row * 3 + 1, row * 3 + 2]);
//         return gameState[row][0];
//       }
//     }

//     for (let row = 0; row < gameState.length; row++) {
//       if (gameState[0][row] === gameState[1][row] && gameState[0][row] === gameState[2][row] && gameState[0][row] !== '') {
//         setFinishedArrayState([0 * 3 + row, 1 * 3 + row, 2 * 3 + row]);
//         return gameState[0][row];
//       }
//     }

//     if (gameState[0][0] === gameState[1][1] && gameState[0][0] === gameState[2][2] && gameState[0][0] !== '') {
//       setFinishedArrayState([0, 4, 8]);
//       return gameState[0][0];
//     }

//     if (gameState[0][2] === gameState[1][1] && gameState[0][2] === gameState[2][0] && gameState[0][2] !== '') {
//       setFinishedArrayState([2, 4, 6]);
//       return gameState[0][2];
//     }

//     const isDraw = gameState.flat().every((e) => e === 'circle' || e === 'cross');
//     if (isDraw) return 'draw';

//     return null;
//   };

//   useEffect(() => {
//     const winner = checkWinner();
//     if (winner) {
//       setFinishedState(winner);
//     }
//   }, [gameState]);

//   useEffect(() => {
//     socket?.on("playerMoveFromServer", (data) => {
//       const id = data.state.id;
//       setGameState((prevState) => {
//         let newState = [...prevState];
//         const r = Math.floor(id / 3);
//         const c = id % 3;
//         newState[r][c] = data.state.sign;
//         return newState;
//       });
//       setCurrentPlayer(data.state.sign === 'circle' ? 'cross' : 'circle');
//     });

//     socket?.on('connect', function () {
//       setPlayOnline(true);
//     });

//     socket?.on('Opponent_not_found', function () {
//       setOpponentName(false);
//     });

//     socket?.on('Opponent_found', function (data) {
//       setPlayingAs(data.playingAs);
//       setOpponentName(data.opponentName);
//     });

//     socket?.on('rematchRequest', () => {
//       Swal.fire({
//         title: 'Rematch?',
//         text: 'Your opponent wants to play again. Do you accept?',
//         showCancelButton: true,
//       }).then((result) => {
//         if (result.isConfirmed) {
//           socket.emit('acceptRematch');
//         }
//       });
//     });

//     socket?.on('startNewGame', () => {
//       resetGame();
//     });

//     return () => {
//       socket?.off('playerMoveFromServer');
//       socket?.off('connect');
//       socket?.off('Opponent_not_found');
//       socket?.off('Opponent_found');
//       socket?.off('rematchRequest');
//       socket?.off('startNewGame');
//     };
//   }, [socket]);

//   const resetGame = () => {
//     setGameState(initialGameState);
//     setCurrentPlayer('circle');
//     setFinishedState(false);
//     setFinishedArrayState([]);
//     setIsClick(false);
//   };

//   async function playOnlineClick() {
//     const result = await takePlayerName();
//     if (!result.isConfirmed) {
//       return;
//     }
//     const username = result.value;
//     setPlayerName(username);

//     const newSocket = io('http://localhost:3000', {
//       autoConnect: true
//     });
//     newSocket.emit("request_to_play", {
//       playerName: username
//     });
//     setSocket(newSocket);
//   }

//   if (!playOnline) {
//     return (
//       <div className='main-div'>
//         <button onClick={playOnlineClick} className='startButton'>
//           Play With Friends
//         </button>
//       </div>
//     );
//   }

//   function showState() {
//     setIsClick(!isClick);
//   }

//   const requestRematch = () => {
//     socket.emit('requestRematch');
//     setRematch(true);
//   };

//   if (playOnline && !opponentName) {
//     return (
//       <div className='waiting'>
//         <div className='waiting1'></div>
//       </div>
//     );
//   }

//   if (!isClick) {
//     return (
//       <div className='showSign'>
//         <h2>{playerName} : {playingAs === 'circle' ? "Circle" : "Cross"}</h2>
//         <h2>{opponentName} : {playingAs === "circle" ? "Cross" : "Circle"}</h2>
//         <button className="isButton" onClick={showState}>Let's Start</button>
//       </div>
//     );
//   }

//   return (
//     <div className='mainDiv'>
//       <div className='move-detection'>
//         <div className={`left ${currentPlayer === playingAs ? 'current-move-' + currentPlayer : ''}`}>{playerName}</div>
//         <div className={`right ${currentPlayer !== playingAs ? 'current-move-' + currentPlayer : ''}`}>{opponentName}</div>
//       </div>
//       <div>
//         <h1 className='game-heading water-background'>Tic Tac Toe</h1>
//         <div className='square-wrapper'>
//           {gameState.map((arr, r) =>
//             arr.map((e, c) => {
//               return (
//                 <Square
//                  rematch={rematch}
//                   gameState={gameState}
//                   playingAs={playingAs}
//                   socket={socket}
                  
//                   finishedArrayState={finishedArrayState}
//                   finishedState={finishedState}
//                   currentPlayer={currentPlayer}
//                   setCurrentPlayer={setCurrentPlayer}
//                   setGameState={setGameState}
//                   id={r * 3 + c}
//                   key={r * 3 + c}
//                   currentElement={e}
//                 />
//               );
//             })
//           )}
//         </div>
//       </div>
//       {finishedState && finishedState !== 'draw' ? playingAs === finishedState ? <p className='opponentState'>{"You won the game."}</p> : <p className='opponentState'>{"Opponent won the game."}</p> : ''}
//       {finishedState && finishedState === 'draw' ? <p className='opponentState'>Draw! No one wins the match.</p> : ''}
//       {opponentName && !finishedState ? <p className='opponentState'>You are playing against {opponentName}</p> : ''}
//       {opponentName && finishedState ? <p className='opponentState'>You are playing against {opponentName}</p> : ''}
//       {finishedState ? <button onClick={requestRematch} className='rematchButton'>Request Rematch</button> : ''}
//     </div>
//   );
// };

// export default App;
