window.onload = function(){
    var game = new Phaser.Game()
}

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