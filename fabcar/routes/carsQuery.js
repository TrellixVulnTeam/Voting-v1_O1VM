const express   = require('express');
const router    = express.Router();

var hfc = require('fabric-client');
var path = require('path');

var channel = {};
var client = null;

//- Options section
var options = {
    wallet_path: path.join(__dirname, '../creds'),
    user_id: 'PeerAdmin',
    channel_id: 'mychannel',
    chaincode_id: 'fabcar',
    network_url: 'grpc://localhost:7051',
};

// //######################################################
//Query.js Initialize
Promise.resolve().then(() => {
    console.log("Create a client and set the wallet location");
    client = new hfc();
    return hfc.newDefaultKeyValueStore({ path: options.wallet_path });
}).then((wallet) => {
    console.log("Set wallet path, and associate user ", options.user_id, " with application");
    client.setStateStore(wallet);
    return client.getUserContext(options.user_id, true);
}).then((user) => {
    console.log("Check user is enrolled, and set a query URL in the network");
    if (user === undefined || user.isEnrolled() === false) {
        console.error("User not defined, or not enrolled - error");
    }
    channel = client.newChannel(options.channel_id);
    channel.addPeer(client.newPeer(options.network_url));
    return;
});


//######################################################

router.get('/all', function (req,res) {
	var carOutpout = 'test';



    Promise.resolve().then(() => {
    	console.log("Make query");
	     var transaction_id = client.newTransactionID();
	     console.log("Assigning transaction_id: ", transaction_id._transaction_id);
	     // queryCar - requires 1 argument, ex: args: ['CAR4'],
	     // queryAllCars - requires no arguments , ex: args: [''],
	    const request = {
	        chaincodeId: options.chaincode_id,
	        txId: transaction_id,
	        fcn: 'queryAllCars',
	        args: ['']
	    };
        return channel.queryByChaincode(request);
    }).then((query_responses) => {
	    console.log("returned from query");
	    if (!query_responses.length) {
	        console.log("No payloads were returned from query");
	    } else {
	        console.log("Query result count = ", query_responses.length)
	    }
	    if (query_responses[0] instanceof Error) {
	        console.error("error from query = ", query_responses[0]);
	    }
	    //- Set a new variable with the query.
	    carOutpout = query_responses[0].toString();
	    console.log("Response is ", carOutpout);
	    // Render the query result to the view

	    res.render('index', { 
		  	title: 'Car application', 
		  	totalCars: JSON.parse(carOutpout) });
	}).catch((err) => {
	    console.error("Caught Error", err);
	});
});

router.get('/:id', function (req, res) {
	// Request id
	var query_id     =   req.params.id;
	// String transform
	var query_string = query_id.toString();
	// Var to store request
	var singleCar;

	Promise.resolve().then(() => {
    	console.log("Make query");
	     var transaction_id = client.newTransactionID();
	     console.log("Assigning transaction_id: ", transaction_id._transaction_id);
	     // queryCar - requires 1 argument, ex: args: ['CAR4'],
	     // queryAllCars - requires no arguments , ex: args: [''],
	    const request = {
	        chaincodeId: options.chaincode_id,
	        txId: transaction_id,
	        fcn: 'queryCar',
	        args: [query_string]
	    };
        return channel.queryByChaincode(request);
    }).then((query_responses) => {
	    console.log("returned from query");
	    if (!query_responses.length) {
	        console.log("No payloads were returned from query");
	    } else {
	        console.log("Query result count = ", query_responses.length)
	    }
	    if (query_responses[0] instanceof Error) {
	        console.error("error from query = ", query_responses[0]);
	    }

	    singleCar = query_responses[0].toString();
	    console.log("Response is ", query_responses[0].toString());

	    res.render('car', { 
		  	title: 'Show single car information', 
		  	car: JSON.parse(singleCar),
		  	carId: query_string });

	}).catch((err) => {
	    console.error("Caught Error", err);
	});
});


module.exports = router;