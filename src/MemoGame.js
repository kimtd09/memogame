import React, { useRef, useState, useEffect } from "react";
import cards from "./memogame-cards";
import MemoGameMask from "./MemoGameMask";
import "./assets/css/memogame.css";

const MemoGame = () => {

    // Value to win a game
    // 2 ^ number of cards - 1
    const WIN = Math.pow(2, cards[0].data.length) - 1;

    function computeNewGrid(array) {
        // const c1 = array.map((e) => {
        //     return { name: e.name, value: e.value, id: 1 };
        // });

        const c1 = array.map((e, i) => {
            return { name: e, value: 1 << i, id: 1 };
        });

        const c2 = array.map((e, i) => {
            return { name: e, value: 1 << i, id: 2 };
        });

        const _cards = c1.concat(c2);

        return shuffleCards(_cards);
    }

    /*
    https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    */
    function shuffleCards(_cards) {
        return _cards
            .map((value) => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
    }

    const [themeId, setThemeId] = useState(0);
    const [newGame, setNewGame] = useState(computeNewGrid(cards[themeId].data));
    const clicks = useState({ card1: [], card2: [] })[0];
    const [refresh, setRefresh] = useState(false);
    const [cardsFound, setFound] = useState([]);
    const [message, setMessage] = useState("");
    const [timer, setTimer] = useState(false);
    const [count, setCount] = useState(0);
    const [win, setWin] = useState(0);
    const [debug, setDebug] = useState(false);
    const [cheat, setCheat] = useState(false);
    const [countDown, setCountDown] = useState(false);
    const [theme, setTheme] = useState(false);
    const [progressBarValue, setProgressBarValue] = useState(0);
    const [difficulty,setDifficulty] = useState("easy");

    const refInterval = useRef(0);
    const refCountDown = useRef(0);
    const refProgress = useRef(0);

    // duration of opened cards
    // let duration = 5000;
    const [duration,setDuration] = useState(5000);

    // Toggle Thme Menu
    useEffect(() => {
        reset();
        setTheme(false);
    }, [themeId])

    // Elapsed time counter    
    useEffect(() => {
        refInterval.current = setInterval(() => {
            if (timer === true)
                setCount((count) => count + 1);
        }, 1000);
    }, [timer])

    // Countdown to hide cards
    useEffect(() => {
        refCountDown.current = setTimeout(() => {
            clearList();
            setProgressBarValue(0);
            clearInterval(refProgress.current);
            // setRefresh(!refresh);
        }, duration)
    }, [countDown])

    // Update progress bar
    const progress_timer = 200;
    const increment = 100 / (duration / progress_timer);
    // console.log(increment);
    useEffect(() => {
        refProgress.current = setInterval(() => {
            setProgressBarValue((progressBarValue) => {
                const i = progressBarValue - increment;
                return (i < 0) ? 0 : i
            });
        }, progress_timer);
    }, [countDown])

    function callbackFunction(card) {
        if (timer === false) {
            setTimer(true);
        }

        if (refCountDown.current != 0) {
            clearTimeout(refCountDown.current);
        }

        if (refProgress.current != 0) {
            setProgressBarValue(100);
            clearInterval(refProgress.current);
        }

        setCountDown(!countDown);

        if (clicks.card1.length === 0) {
            clicks.card1 = [card.name, card.id, card.value];
        } else if (clicks.card2.length === 0) {
            clicks.card2 = [card.name, card.id, card.value];
            checkCardMatching();
        }
        else {
            clicks.card1 = [card.name, card.id, card.value];
            clicks.card2 = [];
        }

        setRefresh(!refresh);
    }

    function clearList() {
        clicks.card1 = [];
        clicks.card2 = [];
    }

    function checkCardMatching() {
        if (clicks.card1[0] === clicks.card2[0] && clicks.card1[1] !== clicks.card2[1]) {
            if (!cardsFound.includes(clicks.card1[0])) {
                setWin(win ^ clicks.card1[2]);
                cardsFound.push(clicks.card1[0]);
                clearInterval(refProgress.current); // nor working?
                setProgressBarValue(0);
                checkWin(clicks.card1[2]);
                clearList();
            }
        }
    }

    function checkWin(currentClickValue) {
        // slow checking would be to compare each item of the array and set a boolean
        // cardsFound.forEach()  

        // fast checking
        // if (cardsFound.length === 8) { 

        // It doesn't work because of late refresh
        // if(win === WIN) {

        // very fast checking by binary comparison
        if ((win | currentClickValue) === WIN) {
            setTimer(false);
            // setMessage("bingo");
            clearInterval(refInterval.current);
        }
    }

    function reset() {
        clearList();
        setFound([]);
        setMessage("");
        setCount(0);
        setWin(0);
        setTheme(false);
        setProgressBarValue(0);
        setTimer(false);
        clearInterval(refInterval.current);
        clearInterval(refProgress.current);
        setNewGame(computeNewGrid(cards[themeId].data));
    }

    return (
        <div>
            <div className="memogame-page-container">

                <h1><span>M</span><span>e</span><span>m</span>
                    <span>o</span> <span>G</span><span>a</span><span>m</span><span>e</span></h1>
                {debugMessage()}
                <div className="memogame-main-container">
                    {buttons()}
                    {progressBar()}
                    <div className="memogame-grid-container">
                        <div className="memogame-grid">
                            {newGame.map((card) => {
                                return <div className="memogame-card">{card.name}</div>
                            })}

                        </div>
                        <MemoGameMask arr={newGame} cards_found={cardsFound} clicks={clicks} callback={callbackFunction} cheat={cheat} />
                        {winMessage()}
                        {themePopup()}
                    </div>
                    <button className="memogame-newgame-button" onClick={() => {
                        reset();
                    }}>New Game</button>
                </div>
            </div>
        </div>
    );

    function progressBar() {
        return <div className="memogame-progressbar-container"><progress max="100" value={progressBarValue}></progress></div>
    }

    function buttons() {
        return <div className="memogame-toolbox">
            <div className="memogame-buttons">
                <div>
                <button className={debug === true ? "memogame-buttons-on" : "memogame-buttons-off"} onClick={() => { setDebug(!debug) }}>debug</button>
                <button className={cheat === true ? "memogame-buttons-on" : "memogame-buttons-off"} onClick={() => { setCheat(!cheat) }}>cheat</button>
                </div>
                <button className="memogame-button-difficulty" onClick={toggleDifficulty}>{difficulty}</button>
                <button className={"memogame-button-theme"} onClick={() => { setTheme(!theme) }}>theme</button>
            </div>
            <div><span>time:</span><span>{formatTimer()}</span></div>
        </div>
    }

    function toggleDifficulty() {
        if(difficulty === "easy") {
            setDifficulty("normal");
            setDuration(2000);
        }
        else if( difficulty === "normal") {
            setDifficulty("hard");
            setDuration(500);
        }
        else {
            setDifficulty("easy");
            setDuration(5000);
        }
    }

    function debugMessage() {
        return <div className={debug === false ? " memogame-debugmessage hidden2" : "memogame-debugmessage"}>
            <h2>[{clicks.card1},{clicks.card2}]</h2>
            <h2>[{cardsFound.toString()}]</h2>
            {/* <h2>{win}</h2> */}
            {/* <h2>{message}</h2> */}
        </div>
    }

    function winMessage() {
        return <div className={win != WIN ? "hidden" : "memogame-win-container"}>
            <div className="memogame-win-popup">Vous avez gagné!</div></div>;
    }

    function addZeroDigit(s) {
        return ("0" + s).slice(-2);
    }

    function formatTimer() {
        if (count < 60) {
            return addZeroDigit(count) + "s";
        }

        let _time = new Date(null);
        _time.setSeconds(count);
        return addZeroDigit(_time.getMinutes()) + "m " + addZeroDigit(_time.getSeconds()) + "s";
    }

    function themePopup() {
        return <div className={theme === true ? "memogame-theme-container" : "memogame-theme-container memogame-theme-container-hidden"}>
            <div>
                {cards.map((item, i) => {
                    return <div className={themeId === i ? "memogame-theme-row memogame-theme-row-selected" : "memogame-theme-row"} onClick={() => { setThemeId(i) }}>
                        <h3>{item.name}</h3>
                        {item.data.map((item) => { return item })}
                    </div>
                })}
            </div>
        </div>
    }
}

export default MemoGame;