let worddisplay, userInputDisplay, gameTimer, index, typedWord, wordToType, timer;
window.onload = function(){
    function createSnowFall(scene, wordbank){
        //remove start game button
        scene.startgamebutton.destroy();
        scene.difficultybutton.destroy();
        typedWord = '';
        wordToType = '';
        let gameGo = true;
        let accuracy = 0;
        let difficultyDelays = new Array([1700, 18000, 1900], [1300, 1100, 900], [1000, 700, 500])

        //index tracker for wordbank
        var word = 0;
        var curwords = wordbank;
        scene.pointsText = scene.add.text(16,16,
            'Points: 0', 
            {fontSize: '32px', 
            fontFamily:'"Consolas"', 
            fill: '#FFFFFF'});
        
        let delayVal = difficultyDelays[scene.difficulty][0];
        timer = 60;
        timeDisplay = scene.add.text(16,46,
            `${timer}`, 
            {fontSize: '32px', 
            fontFamily:'"Consolas"', 
            fill: '#FFFFFF'});

        gameTimer = scene.time.addEvent({
            delay: 1000,
            callback: () =>{
                --timer;
                timeDisplay.setText(`${timer}`);

                if(timer == 20)
                    delayVal = difficultyDelays[scene.difficulty][1];

                if(timer == 40)
                    delayVal = difficultyDelays[scene.difficulty][2];

                if(timer <= 0){
                    timeDisplay.destroy();
                    scene.gameUpdate = false;
                    gameGo = false;
                    for(let i = 0; i < scene.wordsOnScreen.length; ++i){
                        scene.wordsOnScreen[i].destroy();
                    }
                    if(userInputDisplay)
                        userInputDisplay.destroy();
                    scene.pointsText.destroy();
                    scene.add.text((window.innerWidth/2)-100, (window.innerHeight/2)-70, 
                    'Game Over',
                    {fontSize: '36px', 
                    fontFamily:'"Consolas"', 
                    fill: '#00008B'});

                    scene.add.text((window.innerWidth/2)-100, (window.innerHeight/2)-10,
                    `Score: ${scene.points}`,
                    {fontSize: '24px', 
                    fontFamily:'"Consolas"', 
                    fill: '#0096FF'});

                    accuracy = (scene.wordsCorrect / word) * 100;
                    scene.add.text((window.innerWidth/2)-100, (window.innerHeight/2)+20,
                    `Accuracy: ${accuracy.toFixed(0)}%`,
                    {fontSize: '24px', 
                    fontFamily:'"Consolas"', 
                    fill: '#0096FF'});

                    //scene.newgamebutton.visible = true;
                }
                
            },

            repeat: 60
        });
                 
        //place new word on screen
        scene.time.addEvent({
            delay: delayVal,
            callback: () =>{
                    if(timer > 0){
                    //generate random x postion for word
                    let xpos = Math.floor(Math.random() * ((window.innerWidth - 150) - 100) + 100);   
                    worddisplay = scene.add.text(xpos, 10, curwords[word], { 
                            fontSize: '24px', 
                            fontFamily:'"Consolas"', 
                            fill: '#00008b'});
                    ++word;
                    scene.wordsOnScreen.push(worddisplay);
                    }
                    
                },

                loop: true

            }); 
            
            userInputDisplay = scene.add.text((window.innerWidth/2) - 50, 400, typedWord, { fontSize: '24px', fontFamily:'"Courier New",monospace', fill: '#0096FF'}); 
            scene.input.keyboard.off('keydown');

            scene.input.keyboard.on('keydown', function(event) {
                if(!gameGo) 
                    return;
                const key = event.key;
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
                                ++scene.wordsCorrect;
                                for(let i = 0; i < scene.wordsOnScreen.length; ++i){
                                    if(wordToType == scene.wordsOnScreen[i].text){
                                        index = i;
                                        break;
                                    }
                                }
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
            this.difficulty = 0;
            this.difficultyText = new Array("Normal", "Hard", "Crazy");
            this.gameUpdate = true;
            this.wordsOnScreen = [];
            this.points = 0;
            this.missedWords = [];
            this.wordsCorrect = 0;
            this.startdisplay();

            /*this.newgamebutton = this.add.text((window.innerWidth/2)-100, (window.innerHeight/2)+50,
                    "New Game",
                    {fontSize: '24px', 
                    fontFamily:'"Consolas"', 
                    fill: '#00008B'})
                    .setInteractive()
                    .on('pointerdown', () => getWords().then(words => { this.newbank(words)}))
                    .on('pointerover', () => this.hoverState(this.newgamebutton))
                    .on('pointerout', () => this.restState(this.newgamebutton));
            this.newgamebutton.visible = false*/
            
        }

        startdisplay(){
            if(this.normalbutton){
                this.normalbutton.destroy();
                this.hardbutton.destroy();
                this.crazybutton.destroy();
            }
            this.startgamebutton = this.add.text((window.innerWidth/2)-100, (window.innerHeight/2)-50, 
                'Start Game', 
                {fontSize: '36px', 
                fontFamily:'"Consolas"', 
                fill: '#00008B'})
            .setInteractive()
            .on('pointerdown', () => getWords().then(words => { this.newbank(words)}))
            .on('pointerover', () => this.hoverState(this.startgamebutton))
            .on('pointerout', () => this.restState(this.startgamebutton));

            this.difficultybutton = this.add.text((window.innerWidth/2)-100, (window.innerHeight/2), 
                `Difficulty: ${this.difficultyText[this.difficulty]}`, 
                {fontSize: '24px', 
                fontFamily:'"Consolas"', 
                fill: '#00008B'})
            .setInteractive()
            .on('pointerdown', () => this.getDifficulty())
            .on('pointerover', () => this.hoverState(this.difficultybutton))
            .on('pointerout', () => this.restState(this.difficultybutton));
        }

        getDifficulty(){
            this.difficultybutton.destroy();
            this.startgamebutton.destroy();
            this.normalbutton = this.add.text((window.innerWidth/2)-125, (window.innerHeight/2), 
                'Normal', 
                {fontSize: '24px', 
                fontFamily:'"Consolas"', 
                fill: '#00008B'})
            .setInteractive()
            .on('pointerdown', () => { this.difficulty = 0; this.startdisplay(); })
            .on('pointerover', () => this.hoverState(this.normalbutton))
            .on('pointerout', () => this.restState(this.normalbutton));

            this.hardbutton = this.add.text((window.innerWidth/2)-20, (window.innerHeight/2), 
                'Hard', 
                {fontSize: '24px', 
                fontFamily:'"Consolas"', 
                fill: '#00008B'})
            .setInteractive()
            .on('pointerdown', () => { this.difficulty = 1; this.startdisplay(); })
            .on('pointerover', () => this.hoverState(this.hardbutton))
            .on('pointerout', () => this.restState(this.hardbutton));

            this.crazybutton = this.add.text((window.innerWidth/2)+60, (window.innerHeight/2), 
                'Crazy', 
                {fontSize: '24px', 
                fontFamily:'"Consolas"', 
                fill: '#00008B'})
            .setInteractive()
            .on('pointerdown', () => { this.difficulty = 2; this.startdisplay(); })
            .on('pointerover', () => this.hoverState(this.crazybutton))
            .on('pointerout', () => this.restState(this.crazybutton));
        }
        

        hoverState(button){
            button.setStyle({ fill: '#ffffff'});
        }

        restState(button) {
            button.setStyle({ fill: '#00008B' });
          
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
                
                if(word.text === wordToType){
                    typedWord = '';
                    userInputDisplay.setText(typedWord);
                }

                // remove word from wordsOnScreen
                this.wordsOnScreen.splice(i,1);

                // add word to missedWords (idk if we even need this)
                this.missedWords.push(word.text);

                // calculate points lost for missing word
                this.calcPoints(speed,'miss');
                
            }
        }

            calcPoints(speed,pointsChange) {
    
                if(timer > 40){
                    if(speed < 5)
                        speed = 1.75;
                    else if(speed <=7)
                        speed = 1.25;   
                    else
                        speed = .75;
                }
                else if(timer > 20){
                    if(speed < 5)
                        speed = 2.5;
                    else if(speed <=7)
                        speed = 2;   
                    else
                        speed = 1.5;
                }
                else{
                    if(speed < 5)
                        speed = 2.25;
                    else if(speed <=7)
                        speed = 2.27;   
                    else
                        speed = 2.25;
                }
                // lose points
                if (pointsChange === 'miss') {
                    this.flashPoints();
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

            flashPoints(){
                this.pointsText.setColor('#ff0000');

                this.time.delayedCall(150, () => { this.pointsText.setColor('#ffffff')});
            }

        //continously move words down the screen
        update(){
            if(this.gameUpdate == true){
                let speed = 1;
                for(let i = 0; i < this.wordsOnScreen.length; ++i){
                    if(timer > 40){
                        if(this.wordsOnScreen[i].text.length < 5)
                            speed = 1.75;
                        else if(this.wordsOnScreen[i].text.length <=7)
                            speed = 1.25;   
                        else
                            speed = .75;
                    }
                    else if(timer > 20){
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
        
    }

    const config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: '#add8e6',
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: GameScene
    };

    const game = new Phaser.Game(config);
};


//retrieve words from python file
function getWords() {
    return fetch('/generateWordBank/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
    }) 
    // get the data from the django view and parse it in javascript
    .then(response => response.json())
    .then(data => {
        // extract the words and return it
        return data.words;
        
    })

}
