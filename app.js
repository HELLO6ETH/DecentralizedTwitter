const contractAddress = "0xde81a0ef7b2de3cb3e8d832761e8bb30aa77477a";

const contractAbi = [
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "_index",
					"type": "uint256"
				}
			],
			"name": "dislikeTweet",
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
			"name": "likeTweet",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
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
					"name": "sender",
					"type": "address"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "receiver",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "TipSent",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint256",
					"name": "tweetId",
					"type": "uint256"
				}
			],
			"name": "TweetDisliked",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint256",
					"name": "tweetId",
					"type": "uint256"
				}
			],
			"name": "TweetLiked",
			"type": "event"
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
				},
				{
					"internalType": "uint256",
					"name": "likes",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "dislikes",
					"type": "uint256"
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
				},
				{
					"internalType": "uint256",
					"name": "likes",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "dislikes",
					"type": "uint256"
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
let likedTweets = new Set();
let dislikedTweets = new Set();

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
						const tweetContent = tweet.content;
						const likes = tweet.likes;
						const dislikes = tweet.dislikes;

						const listItem = document.createElement("li");
						listItem.innerHTML = `<strong>${username}:</strong> ${tweetContent} <br> Likes: ${likes} | Dislikes: ${dislikes}`;

						// Create Like button
						const likeButton = document.createElement("button");
						likeButton.textContent = "Like";
						likeButton.addEventListener("click", async () => {
								try {
										if (!likedTweets.has(i)) {
												await contractInstance.methods.likeTweet(i).send({ from: currentUser });
												likedTweets.add(i);
												alert("Tweet liked successfully!");
												displayTweets();
										} else {
												alert("You have already liked this tweet!");
										}
								} catch (error) {
										console.error("Failed to like tweet:", error);
								}
						});

						// Create Dislike button
						const dislikeButton = document.createElement("button");
						dislikeButton.textContent = "Dislike";
						dislikeButton.addEventListener("click", async () => {
								try {
										if (!dislikedTweets.has(i)) {
												await contractInstance.methods.dislikeTweet(i).send({ from: currentUser });
												dislikedTweets.add(i);
												alert("Tweet disliked successfully!");
												displayTweets();
										} else {
												alert("You have already disliked this tweet!");
										}
								} catch (error) {
										console.error("Failed to dislike tweet:", error);
								}
						});

						// Create Tip button
						const tipButton = document.createElement("button");
						tipButton.textContent = "Tip";
						tipButton.addEventListener("click", async () => {
								try {
										await contractInstance.methods.tipAuthor(i).send({ value: web3.utils.toWei("0.01", "ether") });
										alert("Tip sent successfully!");
								} catch (error) {
										console.error("Failed to send tip:", error);
								}
						});

						listItem.appendChild(likeButton);
						listItem.appendChild(dislikeButton);
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
