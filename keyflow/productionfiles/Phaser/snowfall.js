let worddisplay;
window.onload = function(){
    function createSnowFall(scene, wordbank){
        //remove start game button
        scene.startgamebutton.destroy();
        var timespent = 0;

        //index tracker for wordbank
        var word = 0;
        var curwords = wordbank.split(' ').slice(0, 8);

        //place new word on screen every 2 seconds
        scene.time.addEvent({
            delay: 2000,
            callback: () =>{
                    //generate random x postion for word
                    let xpos = Math.floor(Math.random() * ((window.innerWidth - 100) - 100) + 100);
                    worddisplay = scene.add.text(xpos, 10, curwords[word], { 
                            fontSize: '24px', 
                            fontFamily:'"Consolas"', 
                            fill: '#00008b'});
                    scene.wordsOnScreen.push(worddisplay);
                    ++word;
                    timespent += 2;
                    /*if(word % 8 == 0){
                        curwords = wordbank.split(' ').slice(word,word+8);
                    }*/
                },

                loop: true

            });       
    }

    class GameScene extends Phaser.Scene{
        create(){
            this.wordsOnScreen = [];

            this.startgamebutton = this.add.text((window.innerWidth/2)-100, (window.innerHeight/2)-50, 
                'Start Game', 
                {fontSize: '36px', 
                fontFamily:'"Consolas"', 
                fill: '#00008B'})

            .setInteractive()
            .on('pointerdown', () => getWords().then(words => { this.newbank(words)}))
            .on('pointerover', () => this.hoverState())
            .on('pointerout', () => this.restState());
        }

        hoverState(){
            this.startgamebutton.setStyle({ fill: '#ffffff'});
        }

        restState() {
            this.startgamebutton.setStyle({ fill: '#00008B' });
          
        }

        newbank(words){
            let wordbank = ''
            if(words){
                wordbank = words;
                createSnowFall(this, wordbank);
            }
        }

        moveword(word, speed){
            word.y += speed;
        }

        //continously move words down the screen
        update(){
            let speed = 1;
            for(let i = 0; i < this.wordsOnScreen.length; ++i){
                if(this.wordsOnScreen[i].text.length < 5)
                    speed = 1.75;
                else if(this.wordsOnScreen[i].text.length <=7)
                    speed = 1.25;   
                else
                    speed = .75;
                this.moveword(this.wordsOnScreen[i], speed);
            }
        }
        
    }

    const config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: '#add8e6',
        scene: GameScene
    };

    const game = new Phaser.Game(config);
};


//retrieve words from python file
function getWords() {
    return fetch('/generateWordBank/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    }) 
    // get the data from the django view and parse it in javascript
    .then(response => response.json())
    .then(data => {
        // extract the words and return it
        return data.words;
        
    })

}
