let worddisplay, gameTimer, index, typedWord, wordToType, timer;
window.onload = function() {
    function createObstacle(scene) {

        scene.startgamebutton.destroy();
        scene.startTime = scene.time.now;
        typedWord = '';
        wordToType = '';
        
        scene.livesText = scene.add.text(5,5, `Lives: ${scene.lives}`,
            {fontSize: '26px', 
                fontFamily:'"Consolas"', 
                fill: '#b51926'}
        );

        scene.penguinText = scene.add.text((window.innerWidth/2)-75, (window.innerHeight/2)+175, 'Penguin',
            { fontSize: '26px', 
                fontFamily:'"Consolas"', 
                fill: '#858483'}
        );

        scene.timeText = scene.add.text(0,5, 'Time: ', 
            { fontSize: '26px', 
            fontFamily:'"Consolas"', 
            fill: '#858483'});
        scene.timeText.setOrigin(1,0);
        scene.timeText.setPosition(window.innerWidth-5,5);

        scene.newRound();


        scene.userInputDisplay = scene.add.text((window.innerWidth/2)-75, 5, typedWord, { fontSize: '24px', fontFamily:'"Courier New",monospace', fill: '#0096FF'}); 
        scene.input.keyboard.off('keydown');

        scene.input.keyboard.on('keydown', function(event) {
            if (scene.curwords) {
                const key = event.key;

                if (key == 'Backspace') {
                    typedWord = typedWord.slice(0,-1);
                    scene.userInputDisplay.setText(typedWord);
                } else if (key.length === 1){
                    typedWord += key;
                    scene.userInputDisplay.setText(typedWord);
                }
                                        

                // typed word must match the correct (green) word
                if(typedWord == scene.roundsOnScreen[0][scene.correctPosition].text){
                    
                    // word from this round was typed correctly, so mark as correct
                    scene.typedCorrectly = true;

                    // move penguin to correct side
                    if (scene.correctPosition === 0) {
                        scene.penguinText.setOrigin(0,0);
                        scene.penguinText.setPosition(5, (window.innerHeight/2)+175);

                    }
                    else if (scene.correctPosition === 1) {
                        scene.penguinText.setOrigin(0,0);
                        scene.penguinText.setPosition((window.innerWidth/2)-75, (window.innerHeight/2)+175);

                    }
                    else if (scene.correctPosition === 2) {
                        scene.penguinText.setOrigin(1,0);
                        scene.penguinText.setPosition(window.innerWidth-5, (window.innerHeight/2)+175);
                    }

                    // destroy the round
                    scene.roundsOnScreen[0][0].destroy();
                    scene.roundsOnScreen[0][1].destroy();
                    scene.roundsOnScreen[0][2].destroy();
                    scene.roundsOnScreen = [];
                    typedWord = '';
                    scene.userInputDisplay.setText(typedWord);

                    scene.newRound();
                }
                // typed wrong word
                else if (typedWord == scene.roundsOnScreen[0][0].text || typedWord == scene.roundsOnScreen[0][1].text || typedWord == scene.roundsOnScreen[0][2].text) {
                    scene.lives--;

                    if(scene.lives===0) {
                        console.log('lives 0, typing');
                        scene.clearGame();
                    }
                    else {
                        scene.roundsOnScreen[0][0].destroy();
                        scene.roundsOnScreen[0][1].destroy();
                        scene.roundsOnScreen[0][2].destroy();
                        scene.roundsOnScreen = [];
                        scene.lifeLost = true;
                        scene.livesText.setText(`Lives: ${scene.lives}`);
                        typedWord = '';
                        scene.userInputDisplay.setText(typedWord);

                        scene.newRound();
                    }

                }
                
            }
            
        })

        

        scene.scale.on('resize', () => {
            centerText();
        });


        function centerText() {

            if(scene.leftText) {
                scene.leftText.setPosition(5,(window.innerHeight/2)*0.6);
                scene.rightText.setPosition(window.innerWidth-5, (window.innerHeight/2)*0.6);
                scene.middleText.setPosition((window.innerWidth/2)-75, (window.innerHeight/2)*0.6);
                scene.livesText.setPosition(5,5);
                scene.penguinText.setPosition((window.innerWidth/2)-75, (window.innerHeight/2)+175);
                scene.timeText.setPosition(window.innerWidth-5,5);
            }
        };



    }

    class GameScene extends Phaser.Scene{
        create(){
            this.difficulty = 0;
            this.difficultyText = new Array("Normal", "Hard", "Crazy");
            this.gameUpdate = true;
            this.gameOver = false;
            this.roundsOnScreen = [];
            this.points = 0;
            this.missedWords = [];
            this.typedCorrectly = false;
            this.startdisplay();
            this.changedOnce = false;
            this.lives = 3;
            this.lifeLost = false;
            this.startTime = 0;

            this.prevCorrectPosition = -1;
            this.correctPosition = 0;


            // index tracker for word bank
            this.word = 0;
            this.wordbank = '';
            this.curwords = '';
            

            this.scale.on('resize',this.centerButton,this);
            
        }

        // recenter buttons when screen is resized
        centerButton() {

            this.startgamebutton.setPosition((window.innerWidth/2)-100,(window.innerHeight/2)-50);

        }

        startdisplay(){

            this.startgamebutton = this.add.text((window.innerWidth/2)-100, (window.innerHeight/2)-50, 
                'Start Game', 
                {fontSize: '36px', 
                fontFamily:'"Consolas"', 
                fill: '#89c3d6'})
            .setInteractive()
            .on('pointerdown', () => getWords().then(words => { this.newbank(words)}))
            .on('pointerover', () => this.hoverState(this.startgamebutton))
            .on('pointerout', () => this.restState(this.startgamebutton));
        }

        hoverState(button){
            button.setStyle({ fill: '#858483'});
        }

        restState(button) {
            button.setStyle({ fill: '#89c3d6' });
          
        }

        newbank(words){
            if(words){
                this.wordbank = words;
                this.curwords = this.wordbank;
                createObstacle(this);
            }
        }

        // move words down and centered and bigger
        update() {

            if(this.gameUpdate == true) {

                const elapsedTime = (this.time.now - this.startTime) / 1000;
                if (this.timeText)
                    this.timeText.setText("Time: " + elapsedTime.toFixed(2) + " seconds");

                // move words
                for(let i = 0; i < this.roundsOnScreen.length; i++) {
                    this.moveWords(this.roundsOnScreen[i],i);
                }

            }

        }

        // move words and increase size as they go down
        moveWords(words,i) {

            if (this.gameOver)
                return;

            // increase font size at halfway
            let currentSize = words[0].fontSize;
            let newSize = currentSize + 0.07;
            this.lifeLost = false;
            let moveSpeed = 0.7;        // base move speed

            // increase speed every 15s based on the timer
            const elapsedTime = (this.time.now - this.startTime) / 1000;
            if (elapsedTime >= 15 && elapsedTime < 30) {
                moveSpeed += 0.3;
            }
            else if (elapsedTime >= 30 && elapsedTime < 45) {
                moveSpeed += 0.5;
            }
            else if (elapsedTime >= 45) {
                moveSpeed += 0.7;
            }

            // move left word down and to the right
            words[0].y += moveSpeed;

            if (words[0].x < (window.innerWidth/2)-100)
                words[0].x += 0.1;

            words[0].setStyle({fontSize:`${newSize}px`});
            words[0].fontSize = newSize;

            // move middle word down
            words[1].y += moveSpeed;
            words[1].setStyle({fontSize:`${newSize}px`});
            words[1].fontSize = newSize;
            
            // move right word down and to the left
            words[2].y += moveSpeed;

            if (words[2].x > (window.innerWidth/2)-100)
                words[2].x -= 0.1;

            words[2].setStyle({fontSize:`${newSize}px`});
            words[2].fontSize = newSize;

            // word has hit the penguin
            if (words[0].y + words[0].height >= this.penguinText.y) {

                this.lives--;

                if (this.lives === 0) {
                    this.clearGame();
                }
                else {

                    this.roundsOnScreen[i][0].destroy();
                    this.roundsOnScreen[i][1].destroy();
                    this.roundsOnScreen[i][2].destroy();
                    this.roundsOnScreen.splice(i,1);
                    this.lifeLost = true;
                    this.livesText.setText(`Lives: ${this.lives}`);
      
                    this.newRound();
                
                }
                
            }
            



        }

        clearGame() {
            console.log('clearGame');
            this.gameUpdate = false;
            this.gameOver = true;
            for(let i = 0; i < this.roundsOnScreen.length; i++) {
                for (let j = 0; j < this.roundsOnScreen[i].length;j++) {
                    this.roundsOnScreen[i][j].destroy();
                    this.livesText.destroy();
                }
            }
            this.userInputDisplay.destroy();
            this.penguinText.destroy();
            this.roundsOnScreen = [];
            this.time.removeAllEvents();

            const gameOverText = this.add.text((window.innerWidth/2), (window.innerHeight/2)-50, 
                        'Game Over :(',
                        {fontSize: '36px', 
                        fontFamily:'"Consolas"', 
                        fill: '#b51926'});
            gameOverText.setOrigin(0.5);

            const elapsedTime = (this.time.now - this.startTime) / 1000;
            const survivedTimeText = this.add.text((window.innerWidth/2), (window.innerHeight/2)+10, 
                `You Survived: ${elapsedTime.toFixed(2)} seconds`,
                {fontSize: '36px', 
                fontFamily:'"Consolas"', 
                fill: '#499c4c'});
            survivedTimeText.setOrigin(0.5);

        }

        newRound() {

            if(this.gameOver)
                return;

            let currentRound = [];

            // first round
            if (this.prevCorrectPosition === -1) {
                // pick position left (0), middle (1), right(2) to be correct word
                this.correctPosition = Math.floor(Math.random() * 3);
            }
            else if (this.prevCorrectPosition === 0) {
                // next correct is either middle or right
                this.correctPosition = Math.floor(Math.random() * 2) + 1;
            }
            else if (this.prevCorrectPosition === 1) {
                // either left or right
                this.correctPosition = Math.floor(Math.random() * 2) * 2;
            }
            else {
                this.correctPosition = Math.floor(Math.random() * 2);
            }

            // left corner
            this.leftText = this.add.text(5,(window.innerHeight/2)*0.6, this.curwords[this.word], {
                fontSize: '24px', 
                fontFamily:'"Consolas"', 
                fill: '#00008b'
            });
            this.word++;
            currentRound[0] = this.leftText;
            // store the leftText and if it is an obstacle or not
            if (this.correctPosition === 0) {
                this.leftText.setStyle({fill:'#3a9937'});
            }
            else {
                this.leftText.setStyle({fill:'#ccbe3f'});
            }
            this.leftText.fontSize = 24;


            // right corner
            this.rightText = this.add.text(0,(window.innerHeight/2)*0.6,this.curwords[this.word], {
                fontSize: '24px', 
                fontFamily:'"Consolas"', 
                fill: '#00008b'
            });
            this.rightText.setOrigin(1,0);
            this.rightText.setPosition(window.innerWidth-5,(window.innerHeight/2)*0.6);
            this.word++;
            currentRound[2] = this.rightText;
            // store the rightText and if it is an obstacle or not
            if (this.correctPosition === 2) {
                this.rightText.setStyle({fill:'#3a9937'});
            }
            else {
                this.rightText.setStyle({fill:'#ccbe3f'});
            }
            this.rightText.fontSize = 24;

            // middle
            this.middleText = this.add.text((window.innerWidth/2)-75, (window.innerHeight/2)*0.6, this.curwords[this.word], {
                fontSize: '24px', 
                fontFamily:'"Consolas"', 
                fill: '#00008b'
            });
            this.word++;
            currentRound[1] = this.middleText;
            // store the middleText and if it is an obstacle or not
            if (this.correctPosition === 1) {
                this.middleText.setStyle({fill:'#3a9937'});
            }
            else {
                this.middleText.setStyle({fill:'#ccbe3f'});
            }
            this.middleText.fontSize = 24;

            this.prevCorrectPosition = this.correctPosition;
            this.roundsOnScreen.push(currentRound);
        }

    }

    const config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: '#FFFAFA',
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: GameScene
    };

    const game = new Phaser.Game(config);

}

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
