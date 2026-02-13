// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TrustPassport
 * @dev Privacy-preserving blockchain reputation system for caregivers
 * 
 * Stores only:
 * - Caregiver hash (no personal data)
 * - Rating (1-5)
 * - Timestamp
 * 
 * Design Principles:
 * 1. Privacy: No personal identifiable information stored
 * 2. Immutability: Ratings cannot be deleted or modified  
 * 3. Transparency: All ratings are publicly verifiable
 * 4. Simplicity: Minimal gas costs
 */
contract TrustPassport {
    
    /**
     * @dev Rating record structure
     */
    struct Rating {
        bytes32 caregiverHash;  // Privacy-preserving identifier
        uint8 rating;           // Rating value (1-5)
        uint256 timestamp;      // Block timestamp
        address submitter;      // Who submitted (for audit)
    }
    
    // All ratings stored on-chain
    Rating[] public ratings;
    
    // Index: caregiverHash => rating IDs
    mapping(bytes32 => uint256[]) public caregiverRatings;
    
    // Events for off-chain indexing
    event RatingSubmitted(
        bytes32 indexed caregiverHash,
        uint8 rating,
        uint256 timestamp,
        address submitter,
        uint256 ratingId
    );
    
    /**
     * @dev Submit a new rating for a caregiver
     * @param _caregiverHash Privacy-preserving hash of caregiver identity
     * @param _rating Rating value (must be 1-5)
     */
    function submitRating(
        bytes32 _caregiverHash,
        uint8 _rating
    ) external {
        // Validate rating is in range [1, 5]
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");
        
        // Create rating record
        Rating memory newRating = Rating({
            caregiverHash: _caregiverHash,
            rating: _rating,
            timestamp: block.timestamp,
            submitter: msg.sender
        });
        
        // Store rating
        ratings.push(newRating);
        uint256 ratingId = ratings.length - 1;
        
        // Index by caregiver
        caregiverRatings[_caregiverHash].push(ratingId);
        
        // Emit event
        emit RatingSubmitted(
            _caregiverHash,
            _rating,
            block.timestamp,
            msg.sender,
            ratingId
        );
    }
    
    /**
     * @dev Get all rating IDs for a specific caregiver
     * @param _caregiverHash Caregiver's hash
     * @return Array of rating IDs
     */
    function getCaregiverRatingIds(bytes32 _caregiverHash) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return caregiverRatings[_caregiverHash];
    }
    
    /**
     * @dev Get rating details by ID
     * @param _ratingId Rating ID
     * @return caregiverHash, rating, timestamp, submitter
     */
    function getRating(uint256 _ratingId) 
        external 
        view 
        returns (
            bytes32 caregiverHash,
            uint8 rating,
            uint256 timestamp,
            address submitter
        ) 
    {
        require(_ratingId < ratings.length, "Invalid rating ID");
        Rating memory r = ratings[_ratingId];
        return (r.caregiverHash, r.rating, r.timestamp, r.submitter);
    }
    
    /**
     * @dev Get total number of ratings in system
     * @return Total rating count
     */
    function getTotalRatings() external view returns (uint256) {
        return ratings.length;
    }
    
    /**
     * @dev Calculate average rating for a caregiver
     * @param _caregiverHash Caregiver's hash
     * @return Average rating (scaled by 100 for precision, e.g., 450 = 4.50)
     */
    function getAverageRating(bytes32 _caregiverHash) 
        external 
        view 
        returns (uint256) 
    {
        uint256[] memory ratingIds = caregiverRatings[_caregiverHash];
        
        if (ratingIds.length == 0) {
            return 0;
        }
        
        uint256 sum = 0;
        for (uint256 i = 0; i < ratingIds.length; i++) {
            sum += ratings[ratingIds[i]].rating;
        }
        
        // Return average * 100 for precision (e.g., 450 = 4.50 stars)
        return (sum * 100) / ratingIds.length;
    }
}
