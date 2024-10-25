let textDisplay, textDisplay2, userInputDisplay, gameDone;
window.onload = function() {
    function createTypingGame(scene, textToType,timer) {
        let typedText = '';  
        let startTime = 0;
        let lettersMissed = {}
        let backspace = false;   // track if the user is still backspacing
        let currentSentence = textToType.split(' ').slice(0,6).join(' ');    // get first 6 words
        let nextSentence = textToType.split(' ').slice(6,12).join(' ');      //get next 6 words
        let wordIndex = 6;       // where the next line will start
        let curTyped = '';      // what the user has currently typed based on the line they're on
        let numWords = 0;
        let elapsedTime = 0;
        timer = parseInt(timer);

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
        if(textDisplay2){
            textDisplay2.destroy();
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
        textDisplay2 = scene.add.text(50, 200, nextSentence, { fontSize: '32px', fontFamily:'"Consolas", monospace', fill: '#808080', wordWrap: {width: 600, useAdvancedWrap: true} });
     
        userInputDisplay = scene.add.text(50, 300, curTyped, { fontSize: '32px', fontFamily:'"Consolas",monospace', fill: '#ffffff',wordWrap: {width: 600, useAdvancedWrap: true} });    // added monospace so each character is equilength
        
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

                    // if key is a space, count this as one word done
                    if (key == " ") {
                        numWords++;
                    }
                    
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
                currentSentence = nextSentence  //get next sentence
                nextSentence = textToType.split(' ').slice(wordIndex,wordIndex+6).join(' '); //get next next sentence
                textDisplay.setText(currentSentence);
                textDisplay2.setText(nextSentence);
                curTyped = '';
                typedText += ' ';
                numWords++;
            }

            // check if matches or timer has ran out
            if (startTime > 0)
                elapsedTime = (new Date().getTime() - startTime) / 1000;  // elapse time
            if (typedText === textToType || elapsedTime >= timer) {
                const elapsedTime = (new Date().getTime() - startTime) / 1000;  // elapse time
                const wpm = Math.floor((numWords*60) / timer)
                
                 // pass these statistics to the function to send them back to django
                passStatistics(wpm,lettersMissed,textToType);

                gameDone = scene.add.text(50, 350, `Well done! Time: ${elapsedTime.toFixed(2)}s. WPM: ${wpm}`, { fontSize: '32px Arial', fill: '#ff0000' });
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
            this.newgamebutton = this.add.text(50, 450, 'New Game', { fill: '#0f0'})
            .setInteractive()
            .on('pointerdown', () => getSen('easy','30').then(text => {
                this.newSentence(text,'30');

                // reset text on buttons
                const dropdownButton = document.getElementById('difficultyMenuButton');
                const timerButton = document.getElementById('timerMenuButton');
                dropdownButton.textContent = 'Easy';
                timerButton.textContent = '30s';

                // reset difficulty and timer
                difficulty = null;
                timer = null;

                
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

        
        newSentence(text,timer) {
            // asynchronously receive the sentence from the function that generates it from django
            let textToType = ''

                if (text) {
                    textToType = text;
                    createTypingGame(this, textToType,timer);
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

function getSen(difficulty,timer) {
    return fetch('/generateSentences/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'difficulty': difficulty,
            'timer': timer
        })
    }) 
    // get the data from the django view and parse it in javascript
    .then(response => response.json())
    .then(data => {
        // extract the sentence and return it
        return data.text;
        
    })

}

let difficulty = null;
let timer = null;
function getDifficulty(game) {
        

        // get difficulty level
        const dropdown = document.querySelectorAll('#difficultyMenu .dropdown-item');
        const dropdownButton = document.getElementById('difficultyMenuButton');
        dropdown.forEach(item => {
            item.addEventListener('click', (e)=> {
                e.preventDefault();
                difficulty = e.currentTarget.value;
                dropdownButton.textContent = e.currentTarget.value;

                const scene = game.scene.getScene('TypingScene');
                // if a value has been chosen for both difficulty and timer, send these values
                if(difficulty && timer) {
                    getSen(difficulty,timer).then(text => {
                        scene.newSentence(text,timer);
                    })
                }

            })
        })

        // get timer choice
        const timerDropdown = document.querySelectorAll('#timerMenu .dropdown-item');
        const timerButton = document.getElementById('timerMenuButton');
        timerDropdown.forEach(item => {
            item.addEventListener('click', (e)=> {
                e.preventDefault();
                timer = e.currentTarget.value;
                timerButton.textContent = e.currentTarget.value + 's';

                const scene = game.scene.getScene('TypingScene');
                // if a value has been chosen for both difficulty and timer, send these values
                if (difficulty && timer) {
                    getSen(difficulty,timer).then(text => {
                        scene.newSentence(text,timer);
                    })
                }  

            })
        })

    
}

