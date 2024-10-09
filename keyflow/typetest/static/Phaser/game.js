window.onload = function() {
    function createTypingGame(scene, textToType) {
        let typedText = '';  
        let startTime = 0;
        let textDisplay, userInputDisplay;
        let lettersMissed = {}
        let backspace = false;   // track if the user is still backspacing

        // initialize letters missed dictionary to 0 for a-z
        for (let i = 97; i <= 122; i++) {
            const letter = String.fromCharCode(i);
            lettersMissed[letter] = 0;
        }
        

        textDisplay = scene.add.text(50, 100, textToType, { fontSize: '32px Arial', fill: '#ffffff', wordWrap: {width: 600, useAdvancedWrap: true} });  // Correct color to '#ffffff'
        
     
        userInputDisplay = scene.add.text(50, 200, typedText, { fontSize: '32px Arial', fill: '#ffffff',wordWrap: {width: 600, useAdvancedWrap: true} });

        function startTyping() {
            if (startTime === 0) {
                startTime = new Date().getTime();  // Start timer
            }
        }
        
        //user input
        scene.input.keyboard.on('keydown', function(event) {
            const key = event.key;
            
            if (key.length === 1) {  
                startTyping();
                typedText += key;

                // if the user had been back spacing, but now they hit this key, they probably typed
                // this key wrong
                if (backspace === true) {
                    console.log('backspace true')
                    lettersMissed[key]++;
                    backspace = false;
                }
            } else if (key === 'Backspace') {
                typedText = typedText.slice(0, -1);  
                backspace = true;
            }

            
            userInputDisplay.setText(typedText);

            // check if matches
            if (typedText === textToType) {
                const elapsedTime = (new Date().getTime() - startTime) / 1000;  // elapse time
                const wpm = Math.floor((textToType.length / 5) / (elapsedTime / 60));  // wpm
                
                 // pass these statistics to the function to send them back to django
                passStatistics(wpm,lettersMissed,textToType);

                scene.add.text(50, 300, `Well done! Time: ${elapsedTime.toFixed(2)}s. WPM: ${wpm}`, { fontSize: '32px Arial', fill: '#ff0000' });
                typedText = '';  //resets
                startTime = 0;  
            }
        });
    }

    class TypingScene extends Phaser.Scene {
        constructor() {
            super({ key: 'TypingScene' });
        }

        create() {

            // asynchronously receive the sentence from the function that generates it from django
            let textToType = ''
            getSentences().then(sentence => {
                if (sentence) {
                    textToType = sentence
                }
                createTypingGame(this, textToType);
            });
            

              
        }
    }

    // create phaser game
    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        backgroundColor: '#07ffb0',  // mint color :)
        scene: TypingScene  
    };

    const game = new Phaser.Game(config);  // initializing game
};

function getSentences() {
    return fetch('/generateSentences/')
        // get the data from the django view and parse it in javascript
        .then(response => response.json())
        .then(data => {
            // extract the sentence and return it
            return data.sentence;
            
        });

}

// function to send the statistics from phaser js to django view
// "getStatistics"
function passStatistics(wpm, lettersMissed, sentence) {

    fetch('/getStatistics/', {
        method: 'POST',
        headers: {
            'Content-Type': 'applications/json'
        },
        body: JSON.stringify({
            wpm: wpm,
            lettersMissed: lettersMissed,
            sentence: sentence
        })
    })

}