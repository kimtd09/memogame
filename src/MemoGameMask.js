import "./assets/css/memogamemask.css";
import "./assets/css/memogame.css"

const MemoGameMask = (args) => {

    function setClick(e) {
        args.callback(e.target.dataset);
    }

    return (
        <div className="memogame-grid memogamemask-container">

            {/* 
                Main grid
            */}
            {
                args.arr.map((card) => {
                    return <div
                        className={
                            args.cards_found.includes(card.name) ? "memogame-maskcard-hide" :

                            ((args.clicks.card1[0] == card.name) && (args.clicks.card1[1] == card.id)) || 
                            ((args.clicks.card2[0] == card.name) && (args.clicks.card2[1] == card.id)) ?
                             "memogame-maskcard memogame-maskcard-hide" : "memogame-maskcard" } 
                        
                        onClick={setClick} data-name={card.name} data-value={card.value} data-id={card.id} 
                        style={args.cheat == false ? {opacity: "1"}: {opacity: "0.5"} }  
                        >
                    </div>
                })
            }

        </div>
    );
}



export default MemoGameMask;