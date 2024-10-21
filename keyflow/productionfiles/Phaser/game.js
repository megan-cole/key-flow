let textDisplay, userInputDisplay, gameDone;
window.onload = function() {
    function createTypingGame(scene, textToType) {
        let typedText = '';  
        let startTime = 0;
        let lettersMissed = {}
        let backspace = false;   // track if the user is still backspacing
        let currentSentence = textToType.split(' ').slice(0,6).join(' ');    // get first 6 words
        let wordIndex = 0;       // where the next line will start
        let curTyped = '';      // what the user has currently typed based on the line they're on

        // initialize letters missed dictionary to 0 for a-z
        for (let i = 97; i <= 122; i++) {
            const letter = String.fromCharCode(i);
            lettersMissed[letter] = 0;
        }

        let puncCodes = [33,44,45,46,58,59,63];
        // add punctuation missed to dictionary
        for (let i = 33; i <= 63; i++) {
            if(puncCodes.includes(i)){
                const ch = String.fromCharCode(i);
                lettersMissed[ch] = 0;

            }
        }

        if(textDisplay) {
            textDisplay.destroy();

        }
        if(userInputDisplay) {
            userInputDisplay.destroy();
        }
        if(gameDone){
            gameDone.destroy();
        }
        if(scene.timeText) {
            scene.timeText.destroy();
        }
        if (scene.currentCharBox){
             scene.currentCharBox.destroy();
        }

        textDisplay = scene.add.text(50, 100, currentSentence, { fontSize: '32px', fontFamily:'"Consolas", monospace', fill: '#ffffff', wordWrap: {width: 600, useAdvancedWrap: true} });  // Correct color to '#ffffff'
     
        userInputDisplay = scene.add.text(50, 200, curTyped, { fontSize: '32px', fontFamily:'"Consolas",monospace', fill: '#ffffff',wordWrap: {width: 600, useAdvancedWrap: true} });    // added monospace so each character is equilength
        
        var timeTextStyle = {font: "32px Arial",  fill: '#99ffcc'};    // somethings are inevitable :)
        scene.timeText = scene.add.text(16,16, "Time Elapsed: ", timeTextStyle)

        scene.currentCharBox = scene.add.rectangle(
            textDisplay.x+8, 
            textDisplay.y + 20, 
            16, 
            32, 
            0x808080, 
            0.2
        );
        function startTyping() {
            if (startTime === 0) {
                startTime = new Date().getTime();  // Start timer
            }
        }

        function updateTime() {                     //updates timer
            if (startTime > 0) {
                const currentTime = new Date().getTime();
                const elapsedTime = (currentTime - startTime) / 1000;
                scene.timeText.setText("Time Elapsed: " + elapsedTime.toFixed(2) + " seconds");
            }
        }
        scene.updateTime = updateTime;

        // reset event listener for keys
        scene.input.keyboard.off('keydown');
        //user input
        scene.input.keyboard.on('keydown', function(event) {
            const key = event.key;
            
            if (key.length === 1) {  
                startTyping();

                const expectedChar = currentSentence[curTyped.length];
                if(key == expectedChar){
                    typedText += key;
                    curTyped += key;
                    backspace = false;
                    scene.currentCharBox.x +=  20;
                    
                    
                    //scene.currentCharBox.setFillStyle(0x808080);
                    //scene.setAlpha(0.2);
                }else {
                    lettersMissed[expectedChar] = (lettersMissed[expectedChar] || 0) + 1;
                    scene.currentCharBox.setFillStyle(0xffee8c);
                    scene.currentCharBox.setAlpha(0.2);
                }
           
            }
            userInputDisplay.setText(curTyped);

            // user has typed first line, then reset their text and move onto the next line
            if (curTyped === currentSentence && typedText != textToType) {
                userInputDisplay.setText('');
                wordIndex += 6;                 // move to next 6 words
                currentSentence = textToType.split(' ').slice(wordIndex,wordIndex+6).join(' ');
                textDisplay.setText(currentSentence);
                curTyped = '';
                typedText += ' ';
            }

            // check if matches
            if (typedText === textToType) {
                const elapsedTime = (new Date().getTime() - startTime) / 1000;  // elapse time
                const wpm = Math.floor((textToType.length / 5) / (elapsedTime / 60));  // wpm
                
                 // pass these statistics to the function to send them back to django
                passStatistics(wpm,lettersMissed,textToType);

                gameDone = scene.add.text(50, 300, `Well done! Time: ${elapsedTime.toFixed(2)}s. WPM: ${wpm}`, { fontSize: '32px Arial', fill: '#ff0000' });
                typedText = '';  //resets
                startTime = 0;
                scene.updateTime = null; 
                
                
            }
        });
    }

    class TypingScene extends Phaser.Scene {
        constructor() {
            super({ key: 'TypingScene' });
            this.timeText = null;
            this.updateTime = null;
            this.currentCharBox = null;
        }

        create() {
            this.newgamebutton = this.add.text(50, 400, 'New Game', { fill: '#0f0'})
            .setInteractive()
            .on('pointerdown', () => getSen('easy').then(text => {
                this.newSentence(text);
            }))
            .on('pointerover', () => this.hoverState())
            .on('pointerout', () => this.restState());

        }
        update(){
            if(this.updateTime)
            {
                this.updateTime();
            }
        }

        hoverState(){
            this.newgamebutton.setStyle({ fill: '#ff0'});
        }
        restState() {
            this.newgamebutton.setStyle({ fill: '#0f0' });
          }

        
        newSentence(text) {
            // asynchronously receive the sentence from the function that generates it from django
            let textToType = ''

                if (text) {
                    textToType = text;
                    createTypingGame(this, textToType);
                }
                
            };
        }

    // create phaser game
    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        backgroundColor: '#142733',  // sorry it was hurting my eyes >_< its okay i guess ;(
        scene: TypingScene  
    };

    const game = new Phaser.Game(config);  // initializing game

    getDifficulty(game);

    class NewGameButton extends Phaser.Scene{
        create(){
            const newgamebutton = this.add.text(100, 100, 'New Game', { fill: '#0f0'})
            .setInteractive()
            .on('pointerdown', () => createTypingGame());
        }
    }
};


// function to send the statistics from phaser js to django view
// "getStatistics"
function passStatistics(wpm, lettersMissed, sentence) {

    fetch('/getStatistics/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            wpm: wpm,
            lettersMissed: lettersMissed,
            sentence: sentence
        })
    })

}

function getSen(difficulty) {
    return fetch('/generateSentences/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'difficulty': difficulty
        })
    }) 
    // get the data from the django view and parse it in javascript
    .then(response => response.json())
    .then(data => {
        // extract the sentence and return it
        return data.text;
        
    })

}

function getDifficulty(game) {
        let selected = false;

        // get difficulty level
        const dropdown = document.querySelectorAll('.dropdown-item');
        const dropdownButton = document.getElementById('dropdownMenuButton');
        dropdown.forEach(item => {
            item.addEventListener('click', (e)=> {
                e.preventDefault();
                let difficulty = e.currentTarget.value;
                dropdownButton.textContent = e.currentTarget.value;
                selected = true;


                const scene = game.scene.getScene('TypingScene');
                getSen(difficulty).then(text => {
                    scene.newSentence(text);
                })

            })
        })
    
}

