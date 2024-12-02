let textDisplay, textDisplay2, userInputDisplay, gameDone;
let isPersonalizedActive = false;
window.onload = function() {
    function createTypingGame(scene, textToType,timer) {
        let typedText = '';  
        let startTime = 0;
        let lettersMissed = {}
        let backspace = false;   // track if the user is still backspacing
        let currentSentence = textToType.split(' ').slice(0,6).join(' ');    // get first 6 words
        currentSentence += ' ';
        let nextSentence = textToType.split(' ').slice(6,12).join(' ');      //get next 6 words
        nextSentence += ' ';
        let wordIndex = 6;       // where the next line will start
        let curTyped = '';      // what the user has currently typed based on the line they're on
        let numWords = 0;
        let elapsedTime = 0;
        let flag = false
        timer = parseInt(timer);
        scene.newgamebutton.visible = false;
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
        textDisplay = scene.add.text(50, 100, currentSentence, { fontSize: '24px', fontFamily:'"Courier New", monospace', fill: '#ffffff'});  // Correct color to '#ffffff'
        textDisplay2 = scene.add.text(50, 200, nextSentence, { fontSize: '24px', fontFamily:'"Courier New", monospace', fill: '#808080'});    //got rid of word wrapping
     
        userInputDisplay = scene.add.text(50, 300, curTyped, { fontSize: '24px', fontFamily:'"Courier New",monospace', fill: '#ffffff'});    // added monospace so each character is equilength


        // Clean up by removing the temporary text objects
        var timeTextStyle = {font: "32px Arial",  fill: '#99ffcc'};    // somethings are inevitable :)
        scene.timeText = scene.add.text(16,16, "Time Elapsed: ", timeTextStyle)

        scene.currentCharBox = scene.add.rectangle(
            textDisplay.x+8, 
            textDisplay.y+12, 
            14, 
            28, 
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
                if (elapsedTime >= timer & !flag) {
                    const elapsedTime = (new Date().getTime() - startTime) / 1000;  // elapse time
                    const wpm = Math.floor((numWords*60) / timer)
                    
                     // pass these statistics to the function to send them back to django
                    passStatistics(wpm,lettersMissed,textToType);
    
                    gameDone = scene.add.text(50, 350, `Well done! Time: ${elapsedTime.toFixed(2)}s. WPM: ${wpm}`, { fontSize: '32px Arial', fill: '#ff0000' });
                    typedText = '';  //resets
                    startTime = 0;
                    scene.updateTime = null;
                    flag = true
                    scene.newgamebutton.visible = true;
                    
                    
                }
            }

        }
        scene.updateTime = updateTime;
        let xPosition = textDisplay.x + 8;
        // reset event listener for keys
        scene.input.keyboard.off('keydown');
        //user input
        scene.input.keyboard.on('keydown', function(event) {
            const key = event.key;
            
            if (key.length === 1 && !flag) {  
                startTyping();

                const expectedChar = currentSentence[curTyped.length];
                
                if(key == expectedChar){
                    typedText += key;
                    curTyped += key;
                    backspace = false;
                    userInputDisplay.setText(curTyped);
                    offset = 4
                    let totalTextWidth = userInputDisplay.width + textDisplay.x + offset
                    xPosition = totalTextWidth;
                    scene.currentCharBox.x = xPosition;
                    console.log(xPosition)
                    
                    // if key is a space, count this as one word done
                    if (key == " ") {
                        numWords++;
                        let spaceWidth = 1; // Adjust this value as needed
                        //xPosition += spaceWidth;
                        
                    }
                    scene.currentCharBox.setFillStyle(0x808080, 0.2);
                    
                }else {
                    lettersMissed[expectedChar] = (lettersMissed[expectedChar] || 0) + 1;
                    scene.currentCharBox.setFillStyle(0xffbf00, 0.5);
                }
            

            
            }
            

            // user has typed first line, then reset their text and move onto the next line
            if (curTyped === currentSentence && typedText != textToType && !flag) {
                userInputDisplay.setText('');
                wordIndex += 6;                 // move to next 6 words
                currentSentence = nextSentence  //get next sentence
                nextSentence = textToType.split(' ').slice(wordIndex,wordIndex+6).join(' '); //get next next sentence
                nextSentence += ' ';
                textDisplay.setText(currentSentence);
                textDisplay2.setText(nextSentence);
                curTyped = '';
                typedText += ' ';
                numWords++;
                scene.currentCharBox.setPosition(textDisplay.x + 8, textDisplay.y + 12);
                xPosition = textDisplay.x + 8
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
            this.newgamebutton = this.add.text(50, 400, 'New Game', { fontFamily:'"Consolas"', fill: '#0f0'})
            .setInteractive()
            .on('pointerdown', () => getSen(difficulty,timer).then(text => {
                this.newSentence(text,timer);


                 //added personalized practice related reset
                 const personalizedButton = document.getElementById('personalizedPractice');
                 personalizedButton.textContent = `Personalized Practice: OFF`;
                 personalizedButton.classList.toggle('btn-secondary');
                 isPersonalizedActive = false;

                // reset difficulty and timer

            

                
            }))
            .on('pointerover', () => this.hoverState())
            .on('pointerout', () => this.restState());
            this.newgamebutton.visible = false;

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
        width: window.innerWidth,
        height: window.innerHeight - 40,
        parent: 'game-container',
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        backgroundColor: '#142733',  // sorry it was hurting my eyes >_< its okay i guess ;(
        scene: TypingScene,
    };

    const game = new Phaser.Game(config);  // initializing game
    
    getDifficulty(game);
};
document.addEventListener('DOMContentLoaded', () => {
    const personalizedButton = document.getElementById('personalizedPractice');

    if (personalizedButton) {
        let isActive = false; // Tracks button state

        // Add a global keydown listener for the spacebar
        personalizedButton.addEventListener('keydown', function (event) {
            const isSpacebar = event.code === 'Space' || event.key === ' ';

            // Prevent spacebar activation only if the button is focused
            if (isSpacebar && document.activeElement === personalizedButton) {
                event.preventDefault();
                console.log("Spacebar press prevented on button.");
            }
        });

        // Add a click listener to toggle button state
        personalizedButton.addEventListener('click', async function () {
            // Toggle state
            isActive = !isActive;

            // Update button appearance and text
            this.textContent = `Personalized Practice: ${isActive ? "ON" : "OFF"}`;
            this.classList.toggle('btn-success', isActive);
            this.classList.toggle('btn-secondary', !isActive);
            this.blur();

            console.log(`Personalized Practice is now: ${isActive ? "ON" : "OFF"}`);

        

            if (isActive) {
                isPersonalizedActive = true
            }
            else{
                isPersonalizedActive = false
            }
        });
    } else {
        console.error("Personalized Practice button not found in the DOM.");
    }
});

// function to send the statistics from phaser js to django view
// "getStatistics"
function passStatistics(wpm, lettersMissed, sentence) {

    fetch('/getStatistics/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            wpm: wpm,
            lettersMissed: lettersMissed,
            sentence: sentence
        })
    })

}

function getpSen(timer) {
    return fetch('/personalizedSentences/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({
            difficulty: 'personalized',
            timer: timer,
        }),
    }) 
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to fetch personalized sentences');
            }
            return response.json();
        })
        .then((data) => {
            return data.text;
        })
        .catch((error) => {
            console.error("Error fetching personalized sentences:", error);
            return '';
        });
}

function getSen(difficulty,timer) {
    return fetch('/generateSentences/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken   // send in csrf token
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
    const dropdown = document.querySelectorAll('#difficultyMenu .dropdown-item');
    const dropdownButton = document.getElementById('difficultyMenuButton');
    const timerDropdown = document.querySelectorAll('#timerMenu .dropdown-item');
    const timerButton = document.getElementById('timerMenuButton');
    const personalizedButton = document.getElementById('personalizedPractice');
    
    // Event listener for difficulty selection
    dropdown.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            difficulty = e.currentTarget.value;
            dropdownButton.textContent = e.currentTarget.value;

            const scene = game.scene.getScene('TypingScene');

            // Check if personalized practice is active if it is do nothing else 
            if (!isPersonalizedActive) {
                if (difficulty && timer) {
                    getSen(difficulty, timer).then(text => {
                        scene.newSentence(text, timer);
                    }).catch(error => console.error("Error fetching sentences:", error));
                }
            }
            this.blur()
        });
    });

    // Event listener for timer selection
    timerDropdown.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            timer = e.currentTarget.value;
            timerButton.textContent = e.currentTarget.value + 's';

            const scene = game.scene.getScene('TypingScene');

            // Check if personalized practice is active
            if (isPersonalizedActive) {
                console.log("Personalized Practice is active.");
                getpSen(timer || '60').then(text => {
                    scene.newSentence(text, timer || '60');
                }).catch(error => console.error("Error fetching personalized sentences:", error));
            } else {
                // If both difficulty and timer are chosen, fetch sentences
                if (difficulty && timer) {
                    getSen(difficulty, timer).then(text => {
                        scene.newSentence(text, timer);
                    }).catch(error => console.error("Error fetching sentences:", error));
                }
            }
            this.blur()
        });
    });
    if (personalizedButton) {
        personalizedButton.addEventListener('click', () => {

            const scene = game.scene.getScene('TypingScene');

            // Trigger logic based on the new flag state
            if (isPersonalizedActive) {
                console.log("Personalized Practice activated. Fetching sentences...");
                getpSen(timer || '60').then(text => {
                    scene.newSentence(text, timer || '60');
                }).catch(error => console.error("Error fetching personalized sentences:", error));
            } else {
                //if deactivated, see if difficulty and timer are selected and restart sentences
                if (difficulty && timer) {
                    getSen(difficulty, timer).then(text => {
                        scene.newSentence(text, timer);
                    }).catch(error => console.error("Error fetching sentences:", error));
                }
                console.log("Personalized Practice deactivated. Awaiting user input...");
            }
        });
    } else {
        console.error("Personalized Practice button not found in the DOM.");
    }
}
