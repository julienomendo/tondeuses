import React, {useEffect, useState} from "react";
import * as PropTypes from "prop-types";
import Worker from "./Worker";

export default function Arena({garden, workers, isStarted, onFinish}) {
    const initialGrid = () => {
        let tempGrid = [];
        for(let i=garden.min.x; i<garden.max.x; i++){
            let yArr = [];
            for(let j=garden.min.y; j<garden.max.y; j++){
                yArr.push({
                    name: i+''+((garden.max.y-1) - j),
                    class: 'long'
                });
            }
            tempGrid.push(yArr)
        }
        return tempGrid;
    }

    const [grid, setGrid] = useState(initialGrid());
    const [random, setRandom] = useState(0);
    const [currentWorkerIndex, setCurrentWorkerIndex] = useState(null);
    const [updatedWorkers, setUpdatedWorkers] = useState(workers);

    useEffect(()=>{
        if(isStarted && currentWorkerIndex===null) {
            setCurrentWorkerIndex(0);
            setUpdatedWorkers(workers);
        }
        else if(!isStarted){
            setUpdatedWorkers([]);
            setCurrentWorkerIndex(null);
            setGrid(initialGrid());
        }
    }, [isStarted]);

    const saveAWorker = (worker) => {
        let workersTmp = updatedWorkers;
        workersTmp[currentWorkerIndex] = worker;
        setUpdatedWorkers(workersTmp);
        setCurrentWorkerIndex(currentWorkerIndex+1);
    }
    useEffect(()=>{
        if(currentWorkerIndex >= workers.length)
            onFinish();
    }, [currentWorkerIndex]);

    const addGrassDeleted = (grass) => {
        let gridTmp = grid;
        gridTmp[grass.x][grass.y].class = 'short';
        setGrid(gridTmp);
        setRandom(Math.random())
    }


    return <div className="arena">
        {random>=0 && grid.map((column, CIndex) => {
            let nbRows = column.length;
            return <div key={CIndex} style={{width: 'calc(100% / '+grid.length+')'}}>
                {column.map((row, rIndex) => {
                    return <div key={rIndex} className={`grass ${row.class}`}
                                style={{height:'calc(100% / '+nbRows+')'}}>
                        {row.name}
                    </div>
                })}
            </div>
        })}

        {currentWorkerIndex !== null && updatedWorkers.length>0 &&
            updatedWorkers.map((worker, index) => <Worker
                currentWorkerIndex={currentWorkerIndex} key={index} index={index}
                rowDimensions={{width:'100% / '+grid.length, height:'100% / '+grid[0].length}}
                garden={garden}
                config={worker}
                onFinish={saveAWorker}
                onGrassDelete={addGrassDeleted}
            />)}

    </div>;
}

Arena.propTypes = {
    garden: PropTypes.any,
    workers: PropTypes.arrayOf(PropTypes.any)
};