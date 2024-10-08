window.onload = function() {
    function createTypingGame(scene, textToType) {
        let typedText = '';  
        let startTime = 0;
        let textDisplay, userInputDisplay;

    
        textDisplay = scene.add.text(50, 100, textToType, { fontSize: '32px Arial', fill: '#ffffff' });  // Correct color to '#ffffff'
        
     
        userInputDisplay = scene.add.text(50, 200, typedText, { fontSize: '32px Arial', fill: '#ffffff' });

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
            } else if (key === 'Backspace') {
                typedText = typedText.slice(0, -1);  
            }

            
            userInputDisplay.setText(typedText);

            // check if matches
            if (typedText === textToType) {
                const elapsedTime = (new Date().getTime() - startTime) / 1000;  // elapse time
                const wpm = Math.floor((textToType.length / 5) / (elapsedTime / 60));  // wpm
                
                
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
            const textToType = "This is sample text for our typing test in Phaser";
            createTypingGame(this, textToType);  
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
    fetch('/generateSentences/')
        // get the data from the django view and parse it in javascript
        .then(response => response.json())
        .then(data => {
            // extract the sentence
            let sentence = data.sentence;
            console.log("Generated Sentence: ", sentence);
            this.displaySentence(sentence)
        })

}

// function to send the statistics from phaser js to django view
// "getStatistics"
function passStatistics() {

    fetch('/getStatistics/', {
        method: 'POST'
    })

}