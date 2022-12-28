import React, {useEffect, useState} from "react";
import workCommandsFile from './config.txt';
import Arena from "./Arena";

function App() {
  const [initialisationState, setInitialisationState] = useState(true);
  const [message, setMessage] = useState(null);
  const [workCommands, setWorkCommands] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [restartEnable, setRestartEnable] = useState(false);

  useEffect(()=>{
    if(workCommands === null){
      fetch(workCommandsFile)
          .then(r => r.text())
          .then(text => {
            //console.log('text decoded:', text);
            if(text === undefined || text === null || text.length === 0)
              setMessage("Ordre de chantier de tonte inconnu ou incompréhensible; Les tondeuses sont contraintes de rester en charge jusqu'à nouvel ordre.");
            else {
              let lineBreaker = (text.indexOf('\r\n')>0 ? '\r\n' : (text.indexOf('\r')>0 ? '\r' : '\n'));
              let lines = text.split(lineBreaker);
              if(lines.length <= 1)
                setMessage("Aucune surface à tondre; veuillez fournir une position maximale (haut-droit) de surface.");
              else if(lines.length < 3)
                setMessage("Aucune tondeuse n'est invitée à travailler sur la surface à tondre. Veuillez identifier au moins une position de départ et une séquences d'ordre d'itinéraire.");
              else
                understandCommands(lines);
            }
          });
    }
    else {
      setMessage(null);
      setInitialisationState(false);
    }
  }, [workCommands]);

  const understandCommands = (lines) => {
    let commandsLines = lines;
    let surfaceMaxCoordinates = {
      x: +lines[0][0] + 1,
      y: +lines[0][1] + 1
    };
    commandsLines.shift();

    let workersTmp = [];
    for(let w=0; w<commandsLines.length; w+=2){
      let positionLine = commandsLines[w].trim();
      positionLine = positionLine.replaceAll(' ', '');

      let commandsSequenceLine = commandsLines[w+1].trim();
      workersTmp.push({
        id: workersTmp.length+1,
        position: {
          x: positionLine[0],
          y: positionLine[1],
          orientation: positionLine[2]
        },
        commandsSequence: [...commandsSequenceLine]
      });
    }

    setWorkCommands({
      gardenPerimeter: {min: {x:0,y:0}, max:surfaceMaxCoordinates},
      workersConfig: workersTmp
    });
  }

  useEffect(()=> {
    setMessage("Le chantier de jardinage est lancé.");
  }, [isStarted]);

  const start = () => {
    setIsStarted(!isStarted);
  }
  const finish = () => {
    setMessage("La tonte est terminée, toutes les tondeuses sont arrivées à bon port.");
    setRestartEnable(true);
  }
  const restart = () => {
    setRestartEnable(false);
    setInitialisationState(true);
    setIsStarted(false);
    setWorkCommands(null);
  }

  return (
    <div className="App">
      {initialisationState ?
          <div className="loadingContainer">
            Réunion de chantier en cours...
          </div>
          :
          <>
            <Arena garden={workCommands.gardenPerimeter} workers={workCommands.workersConfig} isStarted={isStarted} onFinish={finish}/>
            {!isStarted &&
                <button style={{marginTop: '2rem'}} onClick={start}>Lancer la tonte</button>
            }
            {restartEnable &&
                <button style={{marginTop: '2rem'}} onClick={restart}>Relancer la tonte</button>
            }
          </>
      }
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;
