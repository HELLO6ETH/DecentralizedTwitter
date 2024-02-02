const contractAddress = "0xe67c95477131505fea4b1d64048602ba4ff8bbda";

const contractAbi = [
		{
			"inputs": [
				{
					"internalType": "string",
					"name": "_content",
					"type": "string"
				}
			],
			"name": "postTweet",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "_index",
					"type": "uint256"
				}
			],
			"name": "tipAuthor",
			"outputs": [],
			"stateMutability": "payable",
			"type": "function"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "author",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "string",
					"name": "content",
					"type": "string"
				}
			],
			"name": "TweetPosted",
			"type": "event"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "_index",
					"type": "uint256"
				}
			],
			"name": "getTweet",
			"outputs": [
				{
					"internalType": "address",
					"name": "author",
					"type": "address"
				},
				{
					"internalType": "string",
					"name": "content",
					"type": "string"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "getTweetsLength",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"name": "tweets",
			"outputs": [
				{
					"internalType": "address",
					"name": "author",
					"type": "address"
				},
				{
					"internalType": "string",
					"name": "content",
					"type": "string"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "tweetsLength",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		}
	];

let web3;
let contractInstance;
let currentUser;

async function initWeb3() {
		if (window.ethereum) {
				web3 = new Web3(window.ethereum);
				try {
						await window.ethereum.request({ method: 'eth_requestAccounts' });
						const accounts = await web3.eth.getAccounts();
						currentUser = accounts[0];
						console.log("Connected Account:", currentUser);
						contractInstance = new web3.eth.Contract(contractAbi, contractAddress, { from: currentUser });
						displayTweets();
				} catch (error) {
						console.error("User denied account access or there was an error:", error);
				}
		} else if (window.web3) {
				web3 = new Web3(window.web3.currentProvider);
				const accounts = await web3.eth.getAccounts();
				currentUser = accounts[0];
				console.log("Connected Account (via window.web3):", currentUser);
				contractInstance = new web3.eth.Contract(contractAbi, contractAddress, { from: currentUser });
				displayTweets();
		} else {
				console.error("No Ethereum provider detected");
		}
}

async function login() {
		await initWeb3();
}

async function displayTweets() {
		try {
				const tweetList = document.getElementById("tweetList");
				tweetList.innerHTML = ""; // Clear previous tweets

				const tweetCount = await contractInstance.methods.getTweetsLength().call();
				for (let i = 0; i < tweetCount; i++) {
						const tweet = await contractInstance.methods.getTweet(i).call();
						const username = tweet.author;

						const listItem = document.createElement("li");
						listItem.innerHTML = `<strong>${username}:</strong> ${tweet.content}`;

						// Create a "Tip" button inside the tweet
						const tipButton = document.createElement("button");
						tipButton.textContent = "Tip";
					tipButton.id = `tipButton-${i}`;
						tipButton.addEventListener("click", async () => {
								try {
										// Call the tipAuthor function in the contract
										await contractInstance.methods.tipAuthor(i).send({ value: web3.utils.toWei("0.01", "ether") });
										alert("Tip sent successfully!");
								} catch (error) {
										console.error("Failed to send tip:", error);
								}
						});

						listItem.appendChild(tipButton);
						tweetList.appendChild(listItem);
				}
		} catch (error) {
				console.error("Error fetching and displaying tweets:", error);
		}
}


async function postTweet() {
		const tweetContent = document.getElementById("tweetContent").value;
		if (tweetContent) {
				try {
						await contractInstance.methods.postTweet(tweetContent).send({ from: currentUser });
						console.log("Tweet posted successfully");
						alert("Please wait, the transaction has been sent.");
						displayTweets(); // Refresh tweet list after posting
				} catch (error) {
						console.error("Failed to post tweet:", error);
				}
		}
}

// Call login function on page load
login();
