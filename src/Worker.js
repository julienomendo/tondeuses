import React, {useEffect, useState} from "react";
import * as PropTypes from "prop-types";


export default function Worker({index, config, currentWorkerIndex, rowDimensions, onFinish, garden, onGrassDelete}) {
    const [worker, updateWorker] = useState({});
    const [currentCommandIndex, setCurrentCommandIndex] = useState(0);

    useEffect(()=>{
        setCurrentCommandIndex(0);
        updateWorker(config);
    }, [config.id]);

    useEffect(()=>{
        if(currentWorkerIndex === index && worker.id !== undefined ){
            onGrassDelete({x: worker.position.x, y: ((garden.max.y-1) - worker.position.y)})
        }
        if(currentWorkerIndex === index && currentCommandIndex === 0 && worker.id !== undefined)
            doCommand();
        if(currentWorkerIndex === index && currentCommandIndex > 0)
            doCommand();
    }, [worker, currentCommandIndex, currentWorkerIndex])

    const doCommand = () => {
        if(currentCommandIndex === worker.commandsSequence.length){
            onFinish(worker);
        }
        else{
            let command = worker.commandsSequence[currentCommandIndex];
            let workerTmp = worker;
            switch(command){
                case 'R':
                    workerTmp.position.orientation = changeOrientation(workerTmp.position.orientation, true);
                    break;
                case 'L':
                    workerTmp.position.orientation = changeOrientation(workerTmp.position.orientation, false);
                    break;
                case 'F':
                    workerTmp.position = changePosition();
                break;
                default:
                    //nothing to do
                break;
            }
            updateWorker(workerTmp);

            setTimeout(()=>{
                setCurrentCommandIndex(currentCommandIndex+1);
            }, 200);
        }
    }

    const changeOrientation = (initialOrientation, wayTo) => {
        let newOrientation = initialOrientation;
        if(initialOrientation === 'N')
            newOrientation = wayTo ? 'E' : 'W';
        else if(initialOrientation === 'E')
            newOrientation = wayTo ? 'S' : 'N';
        else if(initialOrientation === 'W')
            newOrientation = wayTo ? 'N' : 'S';
        else if(initialOrientation === 'S')
            newOrientation = wayTo ? 'W' : 'E';
        return newOrientation;
    }

    const changePosition = (n) => {
        let newPosition = {x: worker.position.x, y: worker.position.y, orientation: worker.position.orientation};
        switch(worker.position.orientation){
            case 'N':
                newPosition.y = +newPosition.y + 1;
                if(newPosition.y >= garden.max.y)
                    newPosition.y-=1;
            break;
            case 'E':
                newPosition.x = +newPosition.x + 1;
                if(newPosition.x >= garden.max.x)
                    newPosition.x-=1;
            break;
            case 'W':
                newPosition.x = +newPosition.x - 1;
                if(newPosition.x < garden.min.x)
                    newPosition.x+=1;
            break;
            case 'S':
                newPosition.y = +newPosition.y - 1;
                if(newPosition.y < garden.min.y)
                    newPosition.y+=1;
            break;
            default:
                //nothing to do
            break;
        }

        return newPosition;
    }

    if(worker.id === undefined)
        return <></>;

    return <div className={`
    worker 
    ${index === currentWorkerIndex ? 'active' : (index < currentWorkerIndex ? 'finish' : 'inactive')}
    orientation-${worker.position.orientation}
    `}
        style={{
            bottom:'calc((' + rowDimensions.height + ') * ' + worker.position.y + ')',
            left:'calc((' + rowDimensions.width + ') * ' + worker.position.x + ' + 3px)',
            marginLeft:(worker.position.orientation === 'W' || worker.position.orientation === 'N' ? ('calc(('+rowDimensions.width+' - 50px) / 2)') : ''),
            marginRight:(worker.position.orientation === 'S' ? ('calc(('+rowDimensions.width+' - 50px) / 2)') : '')
        }}
                title={`Je suis à la position [${worker.position.x}, ${(worker.position.y)}] et orienté ${worker.position.orientation}`}
    >
        <b>T #{worker.id}</b>
    </div>;
}

Worker.propTypes = {config: PropTypes.any};