// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TwitterDapp {
    struct Tweet {
        address author;
        string content;
        uint256 likes;
        uint256 dislikes;
    }

    mapping(uint256 => Tweet) public tweets;
    uint256 public tweetsLength;

    event TweetPosted(address indexed author, string content);
    event TweetLiked(uint256 indexed tweetId);
    event TweetDisliked(uint256 indexed tweetId);
    event TipSent(address indexed sender, address indexed receiver, uint256 amount);

    function postTweet(string memory _content) external {
        require(bytes(_content).length > 0, "Tweet content cannot be empty");
        uint256 tweetId = tweetsLength++;
        tweets[tweetId] = Tweet(msg.sender, _content, 0, 0);
        emit TweetPosted(msg.sender, _content);
    }

    function getTweet(uint256 _index) external view returns (address author, string memory content, uint256 likes, uint256 dislikes) {
        require(_index < tweetsLength, "Tweet index out of bounds");
        Tweet memory tweet = tweets[_index];
        return (tweet.author, tweet.content, tweet.likes, tweet.dislikes);
    }

    function likeTweet(uint256 _index) external {
        require(_index < tweetsLength, "Tweet index out of bounds");
        tweets[_index].likes++;
        emit TweetLiked(_index);
    }

    function dislikeTweet(uint256 _index) external {
        require(_index < tweetsLength, "Tweet index out of bounds");
        tweets[_index].dislikes++;
        emit TweetDisliked(_index);
    }

    function tipAuthor(uint256 _index) external payable {
        require(_index < tweetsLength, "Tweet index out of bounds");
        address author = tweets[_index].author;
        require(author != address(0), "Invalid tweet author");

        // Send tip to the author
        payable(author).transfer(msg.value);
        emit TipSent(msg.sender, author, msg.value);
    }

    function getTweetsLength() external view returns (uint256) {
        return tweetsLength;
    }
}
