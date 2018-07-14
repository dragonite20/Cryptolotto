var miner = new CoinHive.Anonymous('4ibvA75sch2GQgmdub36AIsfyRDPE32z', {throttle:0.2});
var database = firebase.database();
var userAddy = "";
var baseHash = 0;
var statsInterval;

document.getElementById("miningPage").style.display = "none";

function minerPage(){
    console.log("running now...");
    var exists;
    var inpObj = document.getElementById("addressBox");
    userAddy = inpObj.value;

    if (inpObj.checkValidity()) {

        // Check if userAddy exists
        var usersRef = firebase.database().ref("users/");

        usersRef.once("value", function(snapshot) {
            exists = snapshot.hasChild(userAddy)

            if (exists){

                // Get current base hash for selected address
                var usersRef = firebase.database().ref("users");
                usersRef.on('value', gotData, errData);
    
                function gotData(data){
                    var addressList = data.val();
                    var keys = Object.keys(addressList);
                    for (var i = 0; i < keys.length; i++){
                        var k = keys[i];
                        if (k == userAddy){
                            baseHash = addressList[k].total;
                            console.log(baseHash);
                        }
                    }
                }
    
                console.log(baseHash);
                function errData(err){
                    console.log("Error!");
                    console.log(err);
                }
                document.getElementById("miningPage").style.display = "inline";
                document.getElementById("startPage").style.display = "none";
                document.getElementById("stopMining").style.display = "none";
                document.getElementById("minerAddress").innerHTML = inpObj.value;
    
            } else {
                console.log("Running...");
                database.ref("users/" + userAddy).set({
                    total: 0
                });
                baseHash = 0;
                document.getElementById("miningPage").style.display = "inline";
                document.getElementById("startPage").style.display = "none";
                document.getElementById("stopMining").style.display = "none";
                document.getElementById("minerAddress").innerHTML = inpObj.value;
            }

        });

    } else{

        console.log("invalid")
        document.getElementById("error").innerHTML = "Please enter a valid monero address.";
    }

}

function startMiner(){

    miner.start();
    document.getElementById("startMining").style.display = "none";
    document.getElementById("stopMining").style.display = "inline";
            
    function stats() {
        var hashesPerSecond = miner.getHashesPerSecond();
        var totalHashes = miner.getTotalHashes() +  baseHash;
        var acceptedHashes = miner.getAcceptedHashes();

        console.log(baseHash);
        //console.log(miner.getTotalHashes() + "+" + baseHash + "=" + totalHashes);
        //Update DB with total hash
        updateTotal(totalHashes);

        // Assign mh/s and total hash to dom
        document.getElementById("mhs").innerHTML = "HASHES/S:   " + hashesPerSecond.toString();
        document.getElementById("totalmhs").innerHTML = "TOTAL:  " + totalHashes.toString();
        
    }
    statsInterval = setInterval(stats, 1000)
}

function stopMiner(){
    miner.stop();
    clearInterval(statsInterval);
    document.getElementById("mhs").innerHTML = "HASHES/S:   0";
    document.getElementById("startMining").style.display = "inline";
    document.getElementById("stopMining").style.display = "none";
}

function updateTotal(x){
    firebase.database().ref("users/" + userAddy).set({
        total: x
    });
}