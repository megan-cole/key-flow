let worddisplay, userInputDisplay;
window.onload = function(){
    function createSnowFall(scene, wordbank){
        //remove start game button
        scene.startgamebutton.destroy();
        let typedWord = '';
        let wordToType = '';

        //index tracker for wordbank
        var word = 0;
        var curwords = wordbank.split(' ').slice(0, 100);
        scene.pointsText = scene.add.text(16,16,
            'Points: 0', 
            {fontSize: '32px', 
            fontFamily:'"Consolas"', 
            fill: '#FFFFFF'})
        

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
                    scene.timespent += 2;
                },

                loop: true

            });  
            userInputDisplay = scene.add.text((window.innerWidth/2) - 50, 500, typedWord, { fontSize: '24px', fontFamily:'"Courier New",monospace', fill: '#0096FF'}); 
            scene.input.keyboard.off('keydown');

            scene.input.keyboard.on('keydown', function(event) {
                const key = event.key;
                let index = 0;
                    if(typedWord.length == 0){
                        let letter = 0;
                        for(let i = 0; i < scene.wordsOnScreen.length; ++i){
                            if(key == scene.wordsOnScreen[i].text[0]){
                                letter = 1;
                                index = i;
                                break;
                            }
                        }
                        if(letter){
                            typedWord += key;
                            scene.wordsOnScreen[index].setColor('#0096FF');
                            userInputDisplay.setText(typedWord);
                            wordToType = scene.wordsOnScreen[index].text;
                        }
                    }
                    else{
                        
                            const expectedChar = wordToType[typedWord.length];
                            if(key === expectedChar){
                                typedWord += key;
                                userInputDisplay.setText(typedWord);
                            }

                            if(typedWord == wordToType){
                                scene.wordsOnScreen[index].destroy();
                                scene.wordsOnScreen.splice(index, 1);
                                typedWord = '';
                                scene.calcPoints(wordToType.length, '');
                                userInputDisplay.setText(typedWord);
                            }
                }
                
            })
    }

    class GameScene extends Phaser.Scene{
        create(){
            this.wordsOnScreen = [];
            this.timespent = 0;
            this.points = 0;
            this.missedWords = [];
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

        moveword(word, speed, i){
            word.y += speed;

            // word has hit the bottom, lose points
            if (word.y >= window.innerHeight) {
                    
                // remove word from wordsOnScreen
                this.wordsOnScreen.splice(i,1);

                // add word to missedWords (idk if we even need this)
                this.missedWords.push(word.text);

                // calculate points lost for missing word
                this.calcPoints(speed,'miss');
                
            }
        }

            calcPoints(speed,pointsChange) {
    
                // lose points
                if (pointsChange === 'miss') {
                    
                    // lose half the amount of points you would get from typing it correctly
                    
                    this.points -= Math.floor((7*speed)/2);

                    // only lose points if user has more points to not go negative
                    this.points = Math.max(0,this.points);
                        

                }
                // gain points based on speed b/c speed takes into acc word size and stage
                else {

                    // multiplier of 7 * speed for points
                    this.points += Math.floor(7*speed);
    
                }
                this.pointsText.setText('Points: ' + this.points);

            }

        //continously move words down the screen
        update(){
            let speed = 1;
            for(let i = 0; i < this.wordsOnScreen.length; ++i){
                if(this.timespent < 20){
                    if(this.wordsOnScreen[i].text.length < 5)
                        speed = 1.75;
                    else if(this.wordsOnScreen[i].text.length <=7)
                        speed = 1.25;   
                    else
                        speed = .75;
                }
                else if(this.timespent < 40){
                    if(this.wordsOnScreen[i].text.length < 5)
                        speed = 2.5;
                    else if(this.wordsOnScreen[i].text.length <=7)
                        speed = 2;   
                    else
                        speed = 1.5;
                }
                else{
                    if(this.wordsOnScreen[i].text.length < 5)
                        speed = 2.25;
                    else if(this.wordsOnScreen[i].text.length <=7)
                        speed = 2.27;   
                    else
                        speed = 2.25;
                }
                this.moveword(this.wordsOnScreen[i], speed, i);

            }
        }
        
    }

    const config = {
        type: Phaser.AUTO,
        width: window.innerWidth-10,
        height: window.innerHeight-10,
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
