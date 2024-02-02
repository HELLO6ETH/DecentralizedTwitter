
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TwitterDapp {
    struct Tweet {
        address author;
        string content;
    }

    mapping(uint256 => Tweet) public tweets;
    uint256 public tweetsLength;

    event TweetPosted(address indexed author, string content);

    function postTweet(string memory _content) external {
        require(bytes(_content).length > 0, "Tweet content cannot be empty");
        uint256 tweetId = tweetsLength++;
        tweets[tweetId] = Tweet(msg.sender, _content);
        emit TweetPosted(msg.sender, _content);
    }

    function getTweet(uint256 _index) external view returns (address author, string memory content) {
        require(_index < tweetsLength, "Tweet index out of bounds");
        Tweet memory tweet = tweets[_index];
        return (tweet.author, tweet.content);
    }

    function getTweetsLength() external view returns (uint256) {
        return tweetsLength;
    }


    function tipAuthor(uint256 _index) public payable {
        address payable author = payable(tweets[_index].author);
        author.transfer(msg.value);
    }
}
